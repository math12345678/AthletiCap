#!/bin/bash

# AthletiCap Development Server Launcher
# Starts both frontend (Vite) and backend (Express) in the same terminal

echo "🚀 Starting AthletiCap Development Environment..."
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3000"
echo ""
echo "Demo Account:"
echo "  Email: athlete@rodriguez.family"
echo "  Name: Sofia Rodriguez (Soccer, Class of 2026, Georgia)"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
echo "[1/2] Starting Express API on port 3000..."
cd apps/api
npm run dev &
API_PID=$!

# Wait a moment for API to start
sleep 2

# Start frontend in foreground
echo "[2/2] Starting React frontend on port 5173..."
cd ../web
npm run dev

# If frontend exits, kill the backend
kill $API_PID 2>/dev/null
echo "Stopped AthletiCap development servers"
