#!/bin/bash
# Akiya Tracker — Japan Abandoned House Property Tracker
# Start script for both backend and frontend

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "  家  空き家トラッカー — Japan Akiya Property Tracker"
echo "  ────────────────────────────────────────────────────"
echo ""

# Backend
echo "[1/2] Starting FastAPI backend..."
cd "$SCRIPT_DIR/backend"

if [ ! -d ".venv" ] && ! python3 -c "import fastapi" 2>/dev/null; then
  echo "  → Installing Python dependencies..."
  pip install -r requirements.txt
fi

# Seed the database if it doesn't exist
if [ ! -f "akiya.db" ]; then
  echo "  → Seeding database with sample akiya properties..."
  python3 seed.py
fi

echo "  → Launching uvicorn on http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "  ✓ Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "  → Waiting for backend to be ready..."
for i in {1..20}; do
  if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "  ✓ Backend is up!"
    break
  fi
  sleep 0.5
done

# Frontend
echo ""
echo "[2/2] Starting React frontend..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo "  → Installing npm dependencies..."
  npm install
fi

echo "  → Launching Vite dev server on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!
echo "  ✓ Frontend PID: $FRONTEND_PID"

echo ""
echo "  ────────────────────────────────────────────────────"
echo "  ✓ App running at:   http://localhost:5173"
echo "  ✓ API running at:   http://localhost:8000"
echo "  ✓ API docs at:      http://localhost:8000/docs"
echo "  ────────────────────────────────────────────────────"
echo ""
echo "  Press Ctrl+C to stop both servers."
echo ""

# Trap to kill both on exit
cleanup() {
  echo ""
  echo "  Shutting down..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  echo "  さようなら — Goodbye!"
}
trap cleanup EXIT INT TERM

# Wait
wait
