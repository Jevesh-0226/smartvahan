# Environment Variables Setup Guide

## Backend (Railway)

### Required Environment Variables

```bash
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Port (Railway sets this automatically)
PORT=8000
```

### Railway Deployment

1. Go to your Railway project
2. Navigate to Variables tab
3. Add the following:
   - `GEMINI_API_KEY`: Your Google Gemini API key

Railway will automatically set:
- `PORT`: The port your app should listen on
- Other Railway-specific variables

---

## Frontend (Vercel)

### Required Environment Variables

```bash
# Backend API URL (Railway deployment)
VITE_API_URL=https://your-railway-app.railway.app/api
```

### Vercel Deployment

#### Option 1: Via Vercel Dashboard
1. Go to your Vercel project
2. Navigate to Settings → Environment Variables
3. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-railway-app.railway.app/api`
   - **Environment:** Production, Preview, Development

#### Option 2: Via Vercel CLI
```bash
vercel env add VITE_API_URL
# Enter value: https://your-railway-app.railway.app/api
# Select environments: Production, Preview, Development
```

#### Option 3: Via .env.production (Not Recommended)
```bash
# frontend/.env.production
VITE_API_URL=https://your-railway-app.railway.app/api
```

---

## Local Development

### Backend (.env)

Create `backend/.env`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### Frontend (.env.local)

Create `frontend/.env.local`:

```bash
VITE_API_URL=http://localhost:8000/api
```

---

## Verification

### Test Backend Environment
```bash
cd backend
python -c "import os; print('GEMINI_API_KEY:', 'SET' if os.getenv('GEMINI_API_KEY') else 'NOT SET')"
```

### Test Frontend Environment
```bash
cd frontend
npm run dev
# Check console for API_URL value
```

---

## Important Notes

1. **Never commit `.env` files** to version control
2. **Use `.env.example`** files to document required variables
3. **Vercel variables** must start with `VITE_` to be exposed to the browser
4. **Railway variables** are automatically injected at runtime
5. **Update CORS** in `backend/main.py` with your actual Vercel domain

---

## Quick Deploy Checklist

- [ ] Railway: Set `GEMINI_API_KEY`
- [ ] Vercel: Set `VITE_API_URL` to Railway backend URL
- [ ] Update `backend/main.py` CORS with Vercel domain
- [ ] Commit and push changes
- [ ] Deploy backend (Railway auto-deploys)
- [ ] Deploy frontend (`vercel --prod`)
- [ ] Test mode switching in production
