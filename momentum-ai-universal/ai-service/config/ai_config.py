"""
Configuration for AI services and models
"""
from enum import Enum
from typing import Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class ModelProvider(Enum):
    LLAMA = "llama"
    MISTRAL = "mistral"
    GEMMA = "gemma"
    QWEN = "qwen"

class EmbeddingProvider(Enum):
    NOMIC = "nomic"
    LLMWARE = "llmware"

class VectorStore(Enum):
    FAISS = "faiss"
    MILVUS = "milvus"
    PGVECTOR = "pgvector"

# Default configurations
DEFAULT_MODEL_CONFIG = {
    "provider": ModelProvider.LLAMA.value,
    "model_name": "llama2",
    "temperature": 0.7,
    "max_tokens": 2000,
    "context_window": 4096
}

DEFAULT_EMBEDDING_CONFIG = {
    "provider": EmbeddingProvider.NOMIC.value,
    "model_name": "nomic-embed-text-v1",
    "dimension": 768,
    "normalize": True
}

DEFAULT_VECTOR_STORE_CONFIG = {
    "provider": VectorStore.FAISS.value,
    "index_type": "IndexFlatL2",
    "dimension": 768,
    "metric": "l2"
}

# Environment variables
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
VECTOR_DB_PATH = os.getenv("VECTOR_DB_PATH", "data/vector_store")

class AIConfig:
    def __init__(
        self,
        model_config: Dict[str, Any] = None,
        embedding_config: Dict[str, Any] = None,
        vector_store_config: Dict[str, Any] = None
    ):
        self.model_config = model_config or DEFAULT_MODEL_CONFIG.copy()
        self.embedding_config = embedding_config or DEFAULT_EMBEDDING_CONFIG.copy()
        self.vector_store_config = vector_store_config or DEFAULT_VECTOR_STORE_CONFIG.copy()
        
    @property
    def ollama_url(self) -> str:
        return f"{OLLAMA_HOST}/api/generate"
    
    @property
    def vector_store_path(self) -> str:
        return VECTOR_DB_PATH

# Model configurations
MODEL_CONFIGS = {
    ModelProvider.LLAMA.value: {
        "base_url": OLLAMA_HOST,
        "model_name": "llama2-7b-chat",
        "context_window": 4096
    },
    ModelProvider.MISTRAL.value: {
        "base_url": OLLAMA_HOST,
        "model_name": "mistral-7b",
        "context_window": 8192
    },
    ModelProvider.GEMMA.value: {
        "base_url": OLLAMA_HOST,
        "model_name": "gemma-7b",
        "context_window": 8192
    },
    ModelProvider.QWEN.value: {
        "base_url": OLLAMA_HOST,
        "model_name": "qwen-7b",
        "context_window": 8192
    }
}

# Embedding configurations
EMBEDDING_CONFIGS = {
    EmbeddingProvider.NOMIC.value: {
        "model_name": "nomic-embed-text-v1",
        "dimension": 768,
        "batch_size": 32
    },
    EmbeddingProvider.LLMWARE.value: {
        "model_name": "llmware-embed-text",
        "dimension": 768,
        "batch_size": 32
    }
}

# Vector store configurations
VECTOR_STORE_CONFIGS = {
    VectorStore.FAISS.value: {
        "index_type": "IndexFlatIP",
        "dimension": 768,
        "metric": "cosine"
    },
    VectorStore.MILVUS.value: {
        "host": os.getenv("MILVUS_HOST", "localhost"),
        "port": int(os.getenv("MILVUS_PORT", "19530")),
        "dimension": 768
    },
    VectorStore.PGVECTOR.value: {
        "connection_string": os.getenv("DATABASE_URL"),
        "dimension": 768
    }
}

def get_model_config(provider: str = None) -> Dict[str, Any]:
    """Get model configuration"""
    if not provider:
        return DEFAULT_MODEL_CONFIG
    return MODEL_CONFIGS.get(provider, DEFAULT_MODEL_CONFIG)

def get_embedding_config(provider: str = None) -> Dict[str, Any]:
    """Get embedding configuration"""
    if not provider:
        return DEFAULT_EMBEDDING_CONFIG
    return EMBEDDING_CONFIGS.get(provider, DEFAULT_EMBEDDING_CONFIG)

def get_vector_store_config(provider: str = None) -> Dict[str, Any]:
    """Get vector store configuration"""
    if not provider:
        return DEFAULT_VECTOR_STORE_CONFIG
    return VECTOR_STORE_CONFIGS.get(provider, DEFAULT_VECTOR_STORE_CONFIG) 