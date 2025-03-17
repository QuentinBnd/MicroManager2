#!/bin/bash

# Function to clean up processes and close terminals
cleanup() {
    echo "Stopping project..."
    # Stop Docker services gracefully
    cd $(pwd) && docker-compose down
    # Kill frontend process
    kill $FRONTEND_PID 2>/dev/null
    # Close Terminal windows
    osascript -e 'tell application "Terminal" to close (every window whose name contains "µManager Backend Logs")' 2>/dev/null
    osascript -e 'tell application "Terminal" to close (every window whose name contains "µManager Frontend")' 2>/dev/null
    # Close all Safari tabs with localhost (except the frontend tab)
    osascript <<EOF
tell application "Safari"
    repeat with win in (every window)
        set tabList to tabs of win
        set tabCount to count of tabList
        repeat with i from tabCount to 1 by -1 -- Iterate backwards to avoid index shifting
            if (URL of (item i of tabList)) contains "localhost" then
                close (item i of tabList)
            end if
        end repeat
    end repeat
end tell
EOF
    # Close Postman
    osascript -e 'tell application "Postman" to quit'

    #Kill Docker Desktop
    osascript -e 'quit app "Docker Desktop"'
    echo "Project Stopped"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT

# Check if Docker is running
if ! pgrep -x "Docker" >/dev/null; then
    echo "Docker is not running. Starting Docker..."
    osascript -e "tell application \"Docker Desktop\" to activate"
    open --background -a Docker
    while ! docker info >/dev/null 2>&1; do
        echo "Waiting for Docker to start..."
        sleep 2
    done
    echo "Docker is now running!"
else
    echo "Docker is already running."
fi

# Launch Backend Logs in a new terminal
osascript <<EOF
tell application "Terminal"
    do script "cd $(pwd) && docker-compose up -d && docker logs -f manager-backend-1"
    set custom title of front window to "µManager Backend Logs"
end tell
EOF

# Wait briefly for the backend terminal to start
sleep 2

# Wait for the backend to be fully up and running
echo "Waiting for the backend to be ready..."
while ! curl -s http://localhost:8081 >/dev/null; do
    sleep 2
done
echo "Backend is up and running!"

# Launch Frontend in another new terminal
osascript <<EOF
tell application "Terminal"
    do script "cd $(pwd)/frontend && npm run dev"
    set custom title of front window to "µManager Frontend"
end tell
EOF

echo "Waiting for the frontend to be ready..."
while ! curl -s http://localhost:5173 >/dev/null; do
    sleep 2
done
echo "Frontend is up and running!"

#Open Postman
osascript -e 'tell application "Postman" to activate'

# Open tabs in Safari for the frontend and phpMyAdmin
osascript <<EOF
tell application "Safari"
    activate
    if (count of windows) = 0 then
        make new document
    end if
    tell window 1
        set current tab to (make new tab with properties {URL:"http://localhost:5173/"})
        make new tab with properties {URL:"http://localhost:8081/"}
        -- Switch to the phpMyAdmin tab (last created tab)
        set current tab to last tab
    end tell
end tell
EOF

# Automate phpMyAdmin login
osascript <<EOF
tell application "Safari"
    activate
    tell application "System Events"
        delay 1
        -- Automate username and password entry in phpMyAdmin tab
        keystroke "root"
        keystroke tab
        keystroke "root"
        keystroke return
    end tell
end tell
EOF


# Get the PID of the frontend process
FRONTEND_PID=$(pgrep -f "npm run dev")

# Keep the parent process alive to listen for Ctrl+C
echo "Project is running. Press Ctrl+C to stop or type 'stop' and press Enter."

while true; do
    read -r -n 1 INPUT
    if [[ $(printf "%d" "'$INPUT") -eq 127 ]]; then
        cleanup
    fi
done