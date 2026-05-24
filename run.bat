@echo off
title Shanmukha Fashions - Startup Script
echo =========================================================
echo       SHANMUKHA FASHIONS - FULL-STACK OWNER ENGINE
echo =========================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not added to your system PATH.
    echo Please install Python 3.10+ and select "Add Python to PATH" during setup.
    pause
    exit /b 1
)

:: Set up virtual environment
if not exist "venv" (
    echo [INFO] Creating local isolated Python environment (venv)...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [WARNING] Could not create virtual environment. Using global Python context.
        goto GLOBAL_CONTEXT
    )
)

:ACTIVATE_VENV
echo [INFO] Activating virtual environment...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo [WARNING] Could not activate virtual environment. Using global Python context.
    goto GLOBAL_CONTEXT
)

echo [INFO] Installing e-commerce engine dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies. Check your internet connection.
    pause
    exit /b 1
)

echo [INFO] Starting Shanmukha Fashions local server...
echo.
echo ---------------------------------------------------------
echo   Customer storefront is active on: http://127.0.0.1:5000
echo   Secure Admin portal is active on: http://127.0.0.1:5000/
echo   (Click Owner Dashboard in the footer or top navigation)
echo.
echo   Owner Access PIN: shanmukha2026
echo ---------------------------------------------------------
echo.
python app.py
pause
exit /b 0

:GLOBAL_CONTEXT
echo [INFO] Installing e-commerce engine dependencies globally...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies globally. Check your internet connection.
    pause
    exit /b 1
)

echo [INFO] Starting Shanmukha Fashions local server globally...
echo.
echo ---------------------------------------------------------
echo   Customer storefront is active on: http://127.0.0.1:5000
echo   Secure Admin portal is active on: http://127.0.0.1:5000/
echo   (Click Owner Dashboard in the footer or top navigation)
echo.
echo   Owner Access PIN: shanmukha2026
echo ---------------------------------------------------------
echo.
python app.py
pause
exit /b 0
