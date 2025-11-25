@echo off
echo Starting RAG Service...
cd /d "%~dp0"
call venv\Scripts\activate
python rag_service.py

