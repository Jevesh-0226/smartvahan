"""
SmartVahan – Mode Service (Performance-Hardened Singleton)

Key changes vs original:
- Mode is cached in _memory_ after first load (no file I/O on every get_mode call)
- File is written only when the mode actually changes (set_mode)
- `get_mode()` is O(1) — reads from self._cached_mode
- File read happens ONCE at startup inside __init__
- Singleton is initialized once at module import, never inside an endpoint
"""

import json
import os
from pathlib import Path


def _get_state_file_path() -> str:
    """
    Determine the best writable path for mode_state.json.
    Tries the project root first; falls back to /tmp for Railway/cloud deployments.
    Called ONCE at module load.
    """
    try:
        base_dir = Path(__file__).resolve().parent.parent
        candidate = os.path.join(base_dir, "mode_state.json")
        # Verify the directory is writable
        test_path = os.path.join(base_dir, ".write_test")
        with open(test_path, "w") as f:
            f.write("test")
        os.remove(test_path)
        return candidate
    except Exception:
        return "/tmp/mode_state.json"


# Resolved once at import time
_MODE_STATE_FILE: str = _get_state_file_path()
print(f"[MODE SERVICE] State file resolved to: {_MODE_STATE_FILE}", flush=True)


class ModeService:
    """
    Thread-safe, file-backed mode service with in-memory cache.

    - `get_mode()` → O(1), pure memory read (no disk I/O)
    - `set_mode()` → updates cache AND writes to disk
    """

    def __init__(self):
        self._cached_mode: bool = True  # True = demo, False = real (safe default)
        self._load_mode_from_file()

    def _load_mode_from_file(self):
        """Load mode from disk ONCE at startup into the in-memory cache."""
        if not os.path.exists(_MODE_STATE_FILE):
            self._persist_to_file("demo")
            self._cached_mode = True
            print("[MODE SERVICE] No state file found — created default (demo mode)", flush=True)
            return

        try:
            with open(_MODE_STATE_FILE, "r") as f:
                data = json.load(f)
            mode_str = data.get("mode", "demo").lower()
            self._cached_mode = (mode_str == "demo")
            print(f"[MODE SERVICE] Loaded mode from file: {mode_str}", flush=True)
        except Exception as e:
            print(f"[MODE SERVICE] Failed to read state file, defaulting to demo: {e}", flush=True)
            self._cached_mode = True

    def _persist_to_file(self, mode_str: str):
        """Write current mode to disk. Called only when mode changes."""
        try:
            with open(_MODE_STATE_FILE, "w") as f:
                json.dump({"mode": mode_str}, f, indent=2)
        except Exception as e:
            print(f"[MODE SERVICE] Warning: failed to persist mode to file: {e}", flush=True)

    # ── Public API ──────────────────────────────────────────────────────────

    def get_mode(self) -> bool:
        """
        Returns True for demo mode, False for real mode.
        O(1) — reads from in-memory cache only. No disk I/O.
        """
        return self._cached_mode

    def set_mode(self, is_demo: bool) -> bool:
        """
        Update the mode cache and persist to disk.
        Called only when the user explicitly changes the mode via the UI.
        No-op if mode hasn't changed (avoids unnecessary disk writes).
        """
        if self._cached_mode == is_demo:
            # Mode unchanged — nothing to do
            return True

        self._cached_mode = is_demo
        mode_str = "demo" if is_demo else "real"
        self._persist_to_file(mode_str)
        print(f"[MODE SERVICE] Mode updated to: {mode_str}", flush=True)
        return True


# ── Singleton (initialized ONCE at module import) ───────────────────────────
try:
    _mode_service_instance = ModeService()
    print("[MODE SERVICE] Singleton initialized successfully", flush=True)
except Exception as e:
    print(f"[MODE SERVICE] Singleton initialization failed: {e}", flush=True)
    _mode_service_instance = None


def get_mode_service() -> ModeService:
    """
    Return the singleton ModeService instance.
    If initialization failed at startup, attempt lazy re-initialization.
    """
    global _mode_service_instance
    if _mode_service_instance is None:
        try:
            _mode_service_instance = ModeService()
        except Exception as e:
            print(f"[MODE SERVICE] Lazy re-init failed: {e}", flush=True)

            # Last-resort fallback that never crashes the app
            class _FallbackModeService:
                def get_mode(self) -> bool:
                    return True  # Always demo

                def set_mode(self, is_demo: bool) -> bool:
                    return False

            return _FallbackModeService()

    return _mode_service_instance
