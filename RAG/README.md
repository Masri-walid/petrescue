# RAG Service - Veterinary AI Assistant

This is a simple RAG (Retrieval-Augmented Generation) service that uses Ollama and LangChain to answer veterinary questions based on The Merck Veterinary Manual.

## Setup

1. **Install Ollama** (if not already installed):
   - Download from: https://ollama.ai/
   - Install the required models:
     ```bash
     ollama pull llama3.2
     ollama pull nomic-embed-text
     ```

2. **Create a virtual environment and install dependencies**:
   ```bash
   cd rag
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

   **Important**: This project uses a virtual environment to avoid version conflicts with NumPy and ChromaDB.

3. **Run the RAG service**:

   **Option A - Using the startup script (Windows)**:
   ```bash
   start_service.bat
   ```

   **Option B - Manual start**:
   ```bash
   cd rag
   venv\Scripts\activate
   python rag_service.py
   ```

   The service will:
   - Load pages 5-25 from the PDF (skipping the first 5 pages with pictures)
   - Create embeddings and store them in a ChromaDB database
   - Start a Flask server on port 5001

   **Note**: The first run will take some time to process the PDF and create the vector database. Subsequent runs will be faster as it loads the existing database.

## Usage

Once the service is running:

1. Make sure your Next.js frontend is running (`npm run dev`)
2. Navigate to http://localhost:3000/ask-ia
3. Start asking veterinary questions!

Example questions:
- "What are common clinical signs of canine parvovirus in dogs?"
- "How do you treat feline diabetes?"
- "What are the symptoms of heartworm in dogs?"

## How it works

1. **Document Loading**: Loads pages 5-25 from the PDF
2. **Text Splitting**: Splits the text into chunks of 800 characters with 200 character overlap
3. **Embeddings**: Uses Ollama's nomic-embed-text model to create embeddings
4. **Vector Store**: Stores embeddings in ChromaDB for fast retrieval
5. **Query Processing**: 
   - Generates 5 alternative versions of your question
   - Retrieves relevant chunks from the vector store
   - Uses llama3.2 to generate an answer based on the retrieved context

## API Endpoints

- `POST /api/chat`: Send a question and get an answer
  ```json
  {
    "question": "What are common clinical signs of canine parvovirus?"
  }
  ```

- `GET /api/health`: Check if the service is running

## Troubleshooting

- **Ollama not found**: Make sure Ollama is installed and running
- **Models not found**: Run `ollama pull llama3.2` and `ollama pull nomic-embed-text`
- **Port 5001 already in use**: Change the port in `rag_service.py`
- **ChromaDB errors**: Delete the `chroma_db_merck` folder and restart the service

