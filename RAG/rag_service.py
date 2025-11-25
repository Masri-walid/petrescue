from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import warnings
import ollama

# Suppress warnings
warnings.filterwarnings('ignore')

from langchain_community.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings

app = Flask(__name__)
CORS(app)

# Configuration
PERSIST_DIR = "chroma_db_merck"
PDF_PATH = "The-Merck-Veterinary-Manual-11th-Edition.pdf"

# Initialize embeddings
embeddings = OllamaEmbeddings(model="nomic-embed-text")

# Initialize or load vector store
print("Initializing RAG service...")
if not os.path.exists(PERSIST_DIR):
    print("No existing Chroma DB found. Building it now...")
    loader = PyMuPDFLoader(PDF_PATH)
    print("Loading PDF pages 5-25...")

    # Load all pages first
    all_docs = loader.load()
    # Keep only pages 5-25 (indices 4-24 since 0-indexed)
    docs = all_docs[4:25]
    print(f"Loaded {len(docs)} pages (pages 5-25)")

    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=200)
    splits = splitter.split_documents(docs)
    print(f"Created {len(splits)} chunks")

    vectorstore = Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory=PERSIST_DIR,
    )
    print("Vector store created and persisted")
else:
    print("Loading existing Chroma DB...")
    vectorstore = Chroma(
        embedding_function=embeddings,
        persist_directory=PERSIST_DIR,
    )

print("RAG service initialized successfully!")

def generate_answer(question: str, context: str) -> str:
    """Generate answer using Ollama directly"""
    prompt = f"""Answer the following question using ONLY the context provided.
If you cannot answer based on the context, say "I don't have enough information to answer that question."

Context: {context}

Question: {question}

Answer:"""

    try:
        response = ollama.chat(
            model='llama3.2',
            messages=[{'role': 'user', 'content': prompt}]
        )
        return response['message']['content']
    except Exception as e:
        print(f"Error generating answer: {e}")
        return f"Error: {str(e)}"

def retrieve_context(question: str) -> str:
    """Retrieve relevant context from vector store"""
    try:
        # Search for relevant documents
        docs = vectorstore.similarity_search(question, k=4)

        # Combine document contents
        context = "\n\n".join([doc.page_content for doc in docs])
        return context
    except Exception as e:
        print(f"Error retrieving context: {e}")
        return ""

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat requests"""
    try:
        data = request.json
        question = data.get('question', '')

        if not question:
            return jsonify({'error': 'Question is required'}), 400

        print(f"Received question: {question}")

        # Retrieve relevant context
        context = retrieve_context(question)

        if not context:
            return jsonify({
                'answer': "I couldn't find relevant information to answer your question.",
                'question': question
            })

        # Generate answer
        answer = generate_answer(question, context)

        print(f"Generated answer: {answer}")

        return jsonify({
            'answer': answer,
            'question': question
        })

    except Exception as e:
        print(f"Error processing question: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'RAG service is running'})

if __name__ == '__main__':
    # Note: this service intentionally runs on port 5002 so it doesn't conflict
    # with the existing ml-service that uses port 5001.
    print("Starting RAG service on port 5002...")
    app.run(host='0.0.0.0', port=5002, debug=True)

