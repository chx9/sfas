#!/bin/bash

BASE_DIR=$(pwd)
LOG_DIR="$BASE_DIR/logs"
PID_DIR="$BASE_DIR/run"

BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/frontend"

BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

BACKEND_PID="$PID_DIR/backend.pid"
FRONTEND_PID="$PID_DIR/frontend.pid"

mkdir -p "$LOG_DIR" "$PID_DIR"

start_services() {
    echo "Cleaning old logs and PID files..."
    rm -f "$LOG_DIR"/*.log
    rm -f "$PID_DIR"/*.pid

    echo "Starting backend..."
    cd "$BACKEND_DIR" || exit 1
    nohup go run main.go > "$BACKEND_LOG" 2>&1 &
    echo $! > "$BACKEND_PID"
    disown
    echo "Backend started with PID $(cat $BACKEND_PID), log: $BACKEND_LOG"

    echo "Starting frontend..."
    cd "$FRONTEND_DIR" || exit 1
    nohup npm run start > "$FRONTEND_LOG" 2>&1 &
    echo $! > "$FRONTEND_PID"
    disown
    echo "Frontend started with PID $(cat $FRONTEND_PID), log: $FRONTEND_LOG"
}

stop_services() {
    if [ -f "$BACKEND_PID" ]; then
        PID=$(cat "$BACKEND_PID")
        echo "Stopping backend (PID $PID)..."
        kill "$PID" 2>/dev/null || echo "Backend already stopped"
        rm -f "$BACKEND_PID"
    else
        echo "No backend PID file found."
    fi

    if [ -f "$FRONTEND_PID" ]; then
        PID=$(cat "$FRONTEND_PID")
        echo "Stopping frontend (PID $PID)..."
        kill "$PID" 2>/dev/null || echo "Frontend already stopped"
        rm -f "$FRONTEND_PID"
    else
        echo "No frontend PID file found."
    fi
}

case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    *)
        echo "Usage: $0 {start|stop}"
        exit 1
        ;;
esac
