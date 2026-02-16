# SmartVahan - AI Powered Predictive Vehicle Health Monitoring System

This project is a transformation of a basic chatbot into a vehicle health monitoring dashboard with simulated sensor data and AI diagnostics.

## Prerequisites

- Python 3.8+
- Node.js 16+
- Google Gemini API Key

## Backend Setup (FastAPI)

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create a virtual environment (if not already created):
    ```bash
    python -m venv venv
    ```

3.  Activate the virtual environment:
    - Windows: `venv\Scripts\activate`
    - Mac/Linux: `source venv/bin/activate`

4.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

5.  Configure Environment Variables:
    - Ensure `.env` file exists with your `GEMINI_API_KEY`.

6.  Run the server:
    ```bash
    python main.py
    ```
    The API will run on `http://localhost:8000`.

## Frontend Setup (React + Vite)

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```
    The app will open at `http://localhost:5173`.

## Features

- **Real-time Dashboard**: Visualizes Engine Temp, Oil Pressure, Battery, Brake Wear, and Coolant.
- **Auto-Simulation**: Automatically generates sensor data every 5 seconds.
- **Threshold Alerts**: Visual indicators (Red/Green) when sensors cross safety limits.
- **AI Diagnostics**: Uses Google Gemini to analyze sensor data when critical thresholds are breached, providing actionable insights.
- **Responsive Design**: Modern, dark-themed UI with glassmorphism effects.
