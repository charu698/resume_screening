from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import Chroma
# NEW (stable)
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS


persist_directory = "./chroma_db"

#        Load and Process PDF      

def file_loader(file_path):
    """
    Loads a PDF, extracts text, chunks it, creates embeddings,
    and stores vectors in ChromaDB.
    """
    print("Starting file_loader...")

    try:
        # Load the PDF file
        loader = PyPDFLoader(file_path)
        print("PDF loader initialized")

        docs = loader.load()
        print("PDF loaded successfully")

        # Combine text from all pages
        extracted_text = " ".join([doc.page_content for doc in docs])
        print("Text extracted successfully")

        # Split the text into chunks
        split_docs = chunk_extracteddata(docs)
        print("Text split into chunks successfully")

        # Generate embeddings
        embedding_function = embend_chunks()
        print("Embeddings created successfully")

        # Store in vector DB and return retriever
        retriever = vector_store1(embedding_function, split_docs)
        return retriever, extracted_text

    except Exception as e:
        print(f"[ERROR] file_loader failed: {str(e)}")
        raise


#     Split Documents to Chunks    

def chunk_extracteddata(docs):
    """
    Splits the documents into smaller chunks using recursive splitter.
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    return text_splitter.split_documents(docs)


#      HuggingFace Embeddings      

def embend_chunks():
    """
    Creates a HuggingFace embedding function with CPU to avoid meta tensor errors.
    """
    return HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
        # model_kwargs={"device": "cpu"}  # Ensures it works on CPU
    )


#       Store in ChromaDB          

def vector_store1(embedding_function, split_docs):
    """
    Saves embedded chunks in Chroma vector DB and returns retriever.
    """
    # vectorstore = Chroma.from_documents(
    #     documents=split_docs,
    #     embedding=embedding_function,
    #     persist_directory=persist_directory
    # )
    
    # vectorstore.persist()
    # print("Vector store persisted to disk")
    
    vectorstore = FAISS.from_documents(split_docs, embedding_function)
    print("vector store created")
    # vectorstore.save("faiss_index")
    
    return vectorstore.as_retriever()


def load_vector_store():
    """
    Loads the vector store from disk.
    """
    embedding_function = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"}  # Force CPU
    )
    vectorstore = Chroma(
        persist_directory=persist_directory,
        embedding_function=embedding_function
    )
    retriever = vectorstore.as_retriever()
    print("Vector store loaded successfully from disk.")
    return retriever
