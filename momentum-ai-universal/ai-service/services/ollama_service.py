"""
Service for interacting with Ollama models
"""
import json
import requests
from typing import Dict, Any, List, Optional
from ai_service.config.ai_config import AIConfig, ModelProvider

class OllamaService:
    def __init__(self, config: AIConfig):
        self.config = config
        
    def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        context: Optional[List[str]] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Generate text using Ollama model
        """
        payload = {
            "model": self.config.model_config["model_name"],
            "prompt": prompt,
            "stream": False
        }
        
        if system:
            payload["system"] = system
        if context:
            payload["context"] = context
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
            
        response = requests.post(
            self.config.ollama_url,
            json=payload
        )
        response.raise_for_status()
        
        return response.json()["response"]
    
    def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Chat with Ollama model using message format
        """
        # Convert messages to prompt format
        prompt = ""
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            
            if role == "system":
                prompt += f"System: {content}\n"
            elif role == "user":
                prompt += f"User: {content}\n"
            elif role == "assistant":
                prompt += f"Assistant: {content}\n"
                
        return self.generate(
            prompt=prompt,
            temperature=temperature,
            max_tokens=max_tokens
        ) 