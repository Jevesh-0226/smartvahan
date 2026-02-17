# 🐛 Production Debugging Guide

## Issue: Mode switching not working in production

### Quick Diagnostics

#### 1. Check Railway Backend Status

**Go to Railway Dashboard:**
1. Open https://railway.app/dashboard
2. Select your SmartVahan backend project
3. Click on "Deployments"
4. Check the latest deployment status

**Look for:**
- ✅ Deployment status: "Success" or "Active"
- ❌ Deployment status: "Failed" or "Crashed"

**Check Logs:**
1. Click on "View Logs"
2. Look for startup messages:
   ```
   [MODE SERVICE] Singleton instance created successfully
   [STARTUP] Mode service initialized. Current mode: demo
   INFO:     Uvicorn running on http://0.0.0.0:PORT
   ```

**Common Errors:**
- `ModuleNotFoundError` → Missing dependency in requirements.txt
- `FileNotFoundError` → Path issue with mode_state.json
- `502 Bad Gateway` → App crashed or not responding

---

#### 2. Test Backend Endpoints Directly

**Test Root Endpoint:**
```bash
curl https://YOUR-RAILWAY-URL.railway.app/
```
Expected: `{"message": "SmartVahan AI API is running"}`

**Test Get Mode:**
```bash
curl https://YOUR-RAILWAY-URL.railway.app/api/get-mode
```
Expected: `{"mode": "demo", "currentMode": "demo"}`

**Test Set Mode:**
```bash
curl -X POST https://YOUR-RAILWAY-URL.railway.app/api/set-mode \
  -H "Content-Type: application/json" \
  -d '{"mode": "real"}'
```
Expected: `{"success": true, "mode": "real", "currentMode": "real"}`

---

#### 3. Check Vercel Frontend

**Environment Variables:**
1. Go to Vercel Dashboard
2. Select your SmartVahan project
3. Go to Settings → Environment Variables
4. Verify `VITE_API_URL` is set to your Railway backend URL

**Example:**
```
VITE_API_URL=https://smartvahan-production.up.railway.app/api
```

**Redeploy if needed:**
```bash
cd frontend
vercel --prod
```

---

#### 4. Check Browser Console

**Open deployed frontend:**
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for errors

**Expected logs:**
```
[MODE TOGGLE] Fetching current mode from backend...
[MODE TOGGLE] Initial mode set to: demo
```

**Common errors:**
- `CORS error` → Backend CORS not configured correctly
- `Failed to fetch` → Backend URL incorrect or backend down
- `Network error` → Backend not accessible

---

### Specific Issues & Solutions

#### Issue 1: Backend Returns 502 Error

**Cause:** Application failed to start or crashed

**Solutions:**
1. Check Railway logs for error messages
2. Verify all dependencies in requirements.txt
3. Check if mode_state.json path is correct
4. Ensure PORT environment variable is used correctly

**Fix:**
```python
# In main.py, ensure Procfile uses:
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

#### Issue 2: CORS Error in Browser

**Cause:** Backend not allowing requests from Vercel domain

**Solution:**
Update `backend/main.py`:
```python
allowed_origins = [
    "http://localhost:5173",
    "https://your-actual-vercel-domain.vercel.app",  # ← Update this
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # ← Change from ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

#### Issue 3: Mode Toggle Doesn't Update

**Cause:** Frontend not calling correct backend URL

**Solution:**
1. Check Vercel environment variable `VITE_API_URL`
2. Ensure it ends with `/api` (e.g., `https://your-app.railway.app/api`)
3. Redeploy frontend after changing env vars

---

#### Issue 4: Mode Doesn't Persist

**Cause:** mode_state.json not being created or saved

**Solution:**
Check Railway logs for:
```
[MODE SERVICE] Created mode_state.json with default mode: demo
[MODE SERVICE] Mode updated to: real
```

If missing, check file permissions or path issues.

---

### Manual Testing Steps

#### Step 1: Test Backend Locally
```bash
cd backend
.\venv\Scripts\python.exe main.py
```

Open browser: http://localhost:8000/api/get-mode

Should return: `{"mode": "demo", "currentMode": "demo"}`

#### Step 2: Test Frontend Locally
```bash
cd frontend
npm run dev
```

Open browser: http://localhost:5173

Toggle mode and check console logs.

---

### Railway Deployment Checklist

- [ ] Backend deployed successfully (check Railway dashboard)
- [ ] Logs show "Uvicorn running on http://0.0.0.0:PORT"
- [ ] Logs show "[MODE SERVICE] Singleton instance created successfully"
- [ ] Root endpoint returns success: `curl https://YOUR-URL.railway.app/`
- [ ] Get-mode endpoint works: `curl https://YOUR-URL.railway.app/api/get-mode`
- [ ] No error messages in Railway logs

---

### Vercel Deployment Checklist

- [ ] Frontend deployed successfully (check Vercel dashboard)
- [ ] `VITE_API_URL` environment variable is set
- [ ] `VITE_API_URL` points to Railway backend (with `/api` suffix)
- [ ] No build errors in Vercel logs
- [ ] Browser console shows no CORS errors
- [ ] Browser console shows mode toggle logs

---

### Emergency Rollback

If nothing works, rollback to previous version:

```bash
# Find previous working commit
git log --oneline -n 5

# Rollback (replace COMMIT_HASH with actual hash)
git revert COMMIT_HASH

# Push
git push origin main
```

---

### Get Help

**Provide this information:**
1. Railway backend URL
2. Vercel frontend URL
3. Railway deployment logs (copy/paste)
4. Browser console errors (screenshot)
5. What happens when you click the toggle

**Check these logs:**
- Railway: https://railway.app/dashboard → Your Project → Deployments → View Logs
- Vercel: https://vercel.com/dashboard → Your Project → Deployments → View Function Logs
- Browser: F12 → Console tab

---

### Quick Fix Commands

**Redeploy Railway:**
```bash
git commit --allow-empty -m "Trigger Railway redeploy"
git push origin main
```

**Redeploy Vercel:**
```bash
cd frontend
vercel --prod
```

**Clear Railway cache:**
In Railway dashboard → Settings → Clear Build Cache → Redeploy

---

**Status:** Waiting for diagnostic information
