@echo off
cd /d "E:\Level2 -Sem1\Introduction to Software Development\EasyMart Group 09\EasyMart - Group 09"
start /b npm run dev
timeout /t 5 /nobreak >nul

REM Use the microsoft-edge protocol command
start microsoft-edge:http://localhost:8080/