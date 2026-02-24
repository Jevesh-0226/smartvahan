# 🚗 SmartVahan — AI-Powered Vehicle Diagnostics

SmartVahan is a modern, professional, and production-ready vehicle diagnostic platform that leverages AI to monitor vehicle health in real-time. Built with a robust FastAPI backend and a high-performance React frontend, it provides intelligent insights into vehicle performance using Google's Gemini 1.5 Flash model.

## 🌟 Key Features

- **Dual-Mode Operation**: 
  - **Demo Mode**: Simulate vehicle issues with high-fidelity mock data.
  - **Real Mode**: Live AI diagnostics using Google Gemini for accurate real-world analysis.
- **Persistent State**: Industry-safe persistence of application mode across server restarts.
- **Predictive Maintenance**: Smart analysis of sensor data to predict the next service requirement.
- **Aesthetic Dashboard**: Premium, glassmorphism UI with real-time health indicators and maintenance logs.
- **Stateless Ready**: Architected to work seamlessly in stateless cloud environments like Railway and Vercel.

## 🛠 Tech Stack

- **Frontend**: React 19 (Vite), Custom CSS3 Design System.
- **Backend**: Python 3.10+ FastAPI.
- **AI Core**: Google Gemini 1.5 Flash API.
- **Persistence**: File-based persistent storage (/tmp compatible for Railway).
- **Deployment**: Vercel (Frontend) & Railway (Backend).

## 📂 Project Structure

```text
SmartVahan/
├── backend/
│   ├── main.py              # Application entry point
│   ├── routes/              # API endpoints (Diagnostics, Chat, Modes)
│   ├── services/            # Core business & AI logic
│   ├── models/              # Pydantic data schemas
│   └── requirements.txt     # Backend dependencies
└── frontend/
    ├── src/
    │   ├── components/      # Modular UI components
    │   ├── config.js        # Environment configuration
    │   └── App.jsx          # Main application shell
    └── package.json         # Frontend dependencies
```

## ⚙️ Quick Start

### 1. Backend Setup (FastAPI)
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Create a `.env` file from `.env.example` and add your `GEMINI_API_KEY`.
4. Run the server: `uvicorn main:app --reload`
   - Access API documentation at `http://localhost:8000/docs`

### 2. Frontend Setup (React)
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Access the dashboard at `http://localhost:5173`

## 🔑 Environment Variables

The backend requires:
- `GEMINI_API_KEY`: Obtain from [Google AI Studio](https://aistudio.google.com/).
- `PORT`: (Managed by Railway in production).

The frontend requires:
- `VITE_API_URL`: Path to your backend API.

---
© 2026 SmartVahan — Intelligent Vehicle Care.
