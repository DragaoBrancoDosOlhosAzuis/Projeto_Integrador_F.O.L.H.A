@echo off
echo Iniciando Sistema F.O.L.H.A...
echo.
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python main.py
pause