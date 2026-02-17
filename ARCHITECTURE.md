# SmartVahan Mode Switching Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCTION ENVIRONMENT                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │   Vercel         │              │   Railway        │        │
│  │   (Frontend)     │◄────────────►│   (Backend)      │        │
│  │                  │   HTTPS      │                  │        │
│  │  - React App     │   API Calls  │  - FastAPI       │        │
│  │  - ModeToggle    │              │  - Mode Service  │        │
│  │  - Dashboard     │              │  - Diagnostics   │        │
│  └──────────────────┘              └──────────────────┘        │
│         │                                    │                  │
│         │                                    │                  │
│         │                                    ▼                  │
│         │                          ┌──────────────────┐        │
│         │                          │ mode_state.json  │        │
│         │                          │                  │        │
│         │                          │ {                │        │
│         │                          │   "mode": "demo" │        │
│         │                          │ }                │        │
│         │                          └──────────────────┘        │
│         │                                    │                  │
│         │                          (Persists across restarts)  │
│         │                                                       │
│         └───────────────────────────────────────────────────────┘
│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Mode Switching Flow

### 1. Initial Load

```
┌──────────┐     GET /api/get-mode      ┌──────────┐
│ Frontend │ ────────────────────────────►│ Backend  │
│          │                              │          │
│          │                              │ 1. Read  │
│          │                              │    file  │
│          │                              │          │
│          │                              │ 2. Parse │
│          │                              │    JSON  │
│          │                              │          │
│          │  {"mode": "demo"}            │ 3. Return│
│          │◄─────────────────────────────│    mode  │
│          │                              │          │
│ 4. Set   │                              └──────────┘
│    toggle│                                    │
│    state │                                    │
│          │                              ┌──────────┐
└──────────┘                              │mode_state│
                                          │.json     │
                                          │          │
                                          │{"mode":  │
                                          │ "demo"}  │
                                          └──────────┘
```

### 2. Mode Toggle

```
┌──────────┐   POST /api/set-mode       ┌──────────┐
│ Frontend │   {"mode": "real"}         │ Backend  │
│          │ ───────────────────────────►│          │
│          │                             │          │
│ 1. Click │                             │ 1. Parse │
│    toggle│                             │    request│
│          │                             │          │
│ 2. Update│                             │ 2. Write │
│    UI    │                             │    to    │
│    (opt) │                             │    file  │
│          │                             │          │
│          │  {"success": true,          │ 3. Return│
│          │   "mode": "real"}           │    status│
│          │◄────────────────────────────│          │
│          │                             │          │
│ 3. Confirm                             └──────────┘
│    from  │                                   │
│    server│                                   │
│          │                                   ▼
│ 4. Show  │                             ┌──────────┐
│    notif │                             │mode_state│
└──────────┘                             │.json     │
                                         │          │
                                         │{"mode":  │
                                         │ "real"}  │
                                         └──────────┘
```

### 3. Diagnostic Processing

```
┌──────────┐  POST /api/sensor-data     ┌──────────┐
│ Frontend │  {sensor readings}          │ Backend  │
│          │ ───────────────────────────►│          │
│          │                             │          │
│          │                             │ 1. Read  │
│          │                             │    mode  │
│          │                             │    from  │
│          │                             │    file  │
│          │                             │          │
│          │                             │ 2. Check │
│          │                             │    mode  │
│          │                             │          │
│          │                             ├─────┬────┤
│          │                             │     │    │
│          │                        ┌────▼─┐ ┌▼────┐
│          │                        │ DEMO │ │REAL │
│          │                        │      │ │     │
│          │                        │Demo  │ │Call │
│          │                        │Data  │ │Gemini
│          │                        └────┬─┘ └┬────┘
│          │                             │    │    │
│          │  Diagnostic Report          │    │    │
│          │◄────────────────────────────┴────┴────┤
│          │                             │          │
└──────────┘                             └──────────┘
```

---

## 📁 File Structure

```
SmartVahan/
├── backend/
│   ├── services/
│   │   ├── mode_service.py          ← File-based mode management
│   │   ├── diagnostic_service.py    ← Uses mode service
│   │   ├── gemini_service.py        ← Real mode AI
│   │   └── demo_response_service.py ← Demo mode responses
│   ├── routes/
│   │   └── diagnostics.py           ← /set-mode, /get-mode endpoints
│   ├── main.py                      ← CORS configuration
│   └── mode_state.json              ← PERSISTENT STATE FILE ✨
│
└── frontend/
    └── src/
        ├── components/
        │   ├── ModeToggle.jsx       ← Mode toggle UI component
        │   └── Dashboard.jsx        ← Main dashboard
        └── config.js                ← API URL configuration
```

---

## 🔐 State Persistence

### Before (❌ Unreliable)
```python
# In-memory global variable
DEMO_MODE = True  # Lost on Railway restart!
```

### After (✅ Production-Safe)
```python
# File-based persistence
MODE_STATE_FILE = "mode_state.json"

def set_mode(is_demo: bool):
    with open(MODE_STATE_FILE, 'w') as f:
        json.dump({"mode": "demo" if is_demo else "real"}, f)
    # Survives Railway restarts! ✅
```

---

## 🌐 API Endpoints

### GET /api/get-mode
**Purpose:** Fetch current mode  
**Response:**
```json
{
  "mode": "demo",
  "currentMode": "demo"
}
```

### POST /api/set-mode
**Purpose:** Update mode  
**Request:**
```json
{
  "mode": "real"
}
```
**Response:**
```json
{
  "success": true,
  "mode": "real",
  "currentMode": "real"
}
```

---

## 🔄 Data Flow

```
User Action → Frontend State → API Call → Backend Service → File Write
                    ↑                                            ↓
                    └────────────── Response ←──────────────────┘
```

---

## 🛡️ Error Handling

### Frontend
- ✅ Optimistic updates with rollback
- ✅ Loading states during transitions
- ✅ Error notifications
- ✅ Fallback to demo mode on error

### Backend
- ✅ File existence checks
- ✅ JSON parsing error handling
- ✅ Default to demo mode on error
- ✅ Comprehensive logging

---

## 📊 State Transitions

```
┌──────────┐                    ┌──────────┐
│   DEMO   │◄──────────────────►│   REAL   │
│   MODE   │   User Toggle      │   MODE   │
└──────────┘                    └──────────┘
     │                               │
     │                               │
     ▼                               ▼
Demo Response                   Gemini API
(Instant)                       (AI-powered)
```

---

## 🚀 Deployment Architecture

```
GitHub Repo
    │
    ├──► Railway (Backend)
    │    - Auto-deploy on push
    │    - Persistent file storage
    │    - Environment: GEMINI_API_KEY
    │
    └──► Vercel (Frontend)
         - Auto-deploy on push
         - Environment: VITE_API_URL
         - CDN distribution
```

---

## ✅ Benefits of New Architecture

1. **Stateless-Friendly:** Works in Railway's ephemeral containers
2. **Persistent:** Survives restarts and rebuilds
3. **Simple:** Single JSON file, no database needed
4. **Debuggable:** Comprehensive logging at every step
5. **Reliable:** Graceful error handling and fallbacks
6. **Production-Safe:** No race conditions or state conflicts

---

## 🎯 Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `mode_state.json` | Persistent state storage | Backend root |
| `mode_service.py` | Mode management logic | Backend services |
| `ModeToggle.jsx` | UI toggle component | Frontend components |
| `/set-mode` | Mode update endpoint | Backend routes |
| `/get-mode` | Mode fetch endpoint | Backend routes |

---

**Architecture Status:** ✅ Production-Ready
