@echo off
echo ========================================
echo Fixing RAG Service
echo ========================================
echo.

echo Step 1: Stopping any running RAG service...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *rag_service*" 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Deleting corrupted ChromaDB database...
if exist "chroma_db_merck" (
    rmdir /s /q "chroma_db_merck"
    echo Database deleted successfully.
) else (
    echo No database found to delete.
)

echo.
echo Step 3: Starting RAG service...
echo This will recreate the database from scratch (may take a few minutes)...
echo.

call venv\Scripts\activate.bat
python rag_service.py

pause

