# HireFlow - Next-Gen Candidate Screening & Interview Intelligence Platform

HireFlow is an end-to-end recruitment intelligence system featuring an interactive React + Vite frontend and a high-performance FastAPI Python backend.

---

## 🚀 Quick Start (Local Development)

### 1. Start the FastAPI Backend
```bash
# In the root directory
uvicorn backend.main:app --reload --port 8000
```
*Backend API Docs:* `http://localhost:8000/docs`

### 2. Start the Vite Frontend
```bash
# In a second terminal
npm install
npm run dev
```
*Frontend URL:* `http://localhost:5173`

---

## 🌐 Deploying to Vercel

This repository is pre-configured for seamless single-repo deployment on **Vercel** (serving both the Vite frontend SPA and the Python FastAPI backend via Serverless Functions).

### Configuration Files Included:
- **`vercel.json`**: Configures rewrites for `/api/(.*)` to `api/index.py` and SPA fallback routing.
- **`api/index.py`**: Serverless Python entrypoint importing the FastAPI `app`.
- **`requirements.txt`**: Root Python package requirements for Vercel runtime.

### Steps to Deploy:
1. **Push to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Deploy HireFlow to Vercel"
   git push origin main
   ```
2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your repository.
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (Leave as default)
   - Click **Deploy**.

Vercel will automatically build the React frontend and deploy the FastAPI backend as Serverless Functions on `/api/*`.

---

## 👥 Demo Credentials
- **Recruiter Account**: `recruiter@hireflow.ai` / `password123`
- **Candidate Account**: `candidate@hireflow.ai` / `password123`
- Or register any new account with your own custom company name!
