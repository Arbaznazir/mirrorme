"""
AI Providers for MirrorMe
Supports multiple AI services including free alternatives to OpenAI
"""

import httpx
import json
from typing import Dict, Any, Optional
from config import settings
import asyncio


class AIProvider:
    """Base class for AI providers."""

    async def generate_text(self, messages: list, max_tokens: int = 150) -> str:
        raise NotImplementedError


class DeepSeekProvider(AIProvider):
    """DeepSeek API - Free tier available."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.deepseek.com/v1/chat/completions"

    async def generate_text(self, messages: list, max_tokens: int = 150) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "deepseek-chat",
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.base_url, headers=headers, json=data)
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            raise Exception(f"DeepSeek API error: {str(e)}")


class GroqProvider(AIProvider):
    """Groq API - Free tier with fast inference."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    async def generate_text(self, messages: list, max_tokens: int = 150) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "mixtral-8x7b-32768",  # Free model
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.base_url, headers=headers, json=data)
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            raise Exception(f"Groq API error: {str(e)}")


class OllamaProvider(AIProvider):
    """Ollama - Run models locally (completely free)."""

    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.model = "qwen2.5:7b"  # Default model

    async def generate_text(self, messages: list, max_tokens: int = 150) -> str:
        # Convert messages to Ollama format
        prompt = self._convert_messages_to_prompt(messages)

        data = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": 0.7
            }
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(f"{self.base_url}/api/generate", json=data)
                response.raise_for_status()
                result = response.json()
                return result["response"].strip()
        except Exception as e:
            raise Exception(f"Ollama error: {str(e)}")

    def _convert_messages_to_prompt(self, messages: list) -> str:
        """Convert OpenAI-style messages to a single prompt."""
        prompt_parts = []
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            if role == "system":
                prompt_parts.append(f"System: {content}")
            elif role == "user":
                prompt_parts.append(f"User: {content}")
        return "\n".join(prompt_parts) + "\nAssistant:"


class TogetherAIProvider(AIProvider):
    """Together AI - Free tier for open-source models."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.together.xyz/v1/chat/completions"

    async def generate_text(self, messages: list, max_tokens: int = 150) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "Qwen/Qwen2.5-7B-Instruct-Turbo",  # Free Qwen model
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.base_url, headers=headers, json=data)
                response.raise_for_status()
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
        except Exception as e:
            raise Exception(f"Together AI error: {str(e)}")


class GeminiProvider(AIProvider):
    """Google Gemini API - Free tier with generous limits."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

    async def generate_text(self, messages: list, max_tokens: int = 150) -> str:
        # Convert OpenAI-style messages to Gemini format
        prompt = self._convert_messages_to_prompt(messages)

        headers = {
            "Content-Type": "application/json"
        }

        data = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": 0.7
            }
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}?key={self.api_key}",
                    headers=headers,
                    json=data
                )
                response.raise_for_status()
                result = response.json()

                # Extract text from Gemini response
                if "candidates" in result and len(result["candidates"]) > 0:
                    content = result["candidates"][0]["content"]["parts"][0]["text"]
                    return content.strip()
                else:
                    raise Exception("No valid response from Gemini")

        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")

    def _convert_messages_to_prompt(self, messages: list) -> str:
        """Convert OpenAI-style messages to a single prompt for Gemini."""
        prompt_parts = []
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            if role == "system":
                prompt_parts.append(f"Instructions: {content}")
            elif role == "user":
                prompt_parts.append(f"User: {content}")
        return "\n".join(prompt_parts)


class OpenAIProvider(AIProvider):
    """OpenAI API - Backup option."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_text(self, messages: list, max_tokens: int = 150) -> str:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=self.api_key)

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()
        except Exception as e:
            raise Exception(f"OpenAI error: {str(e)}")


class AIProviderManager:
    """Manages multiple AI providers with fallback support."""

    def __init__(self):
        self.providers = []
        self._initialize_providers()

    def _initialize_providers(self):
        """Initialize available providers based on configuration."""

        # Use ONLY Gemini - remove all other providers
        if hasattr(settings, 'gemini_api_key') and settings.gemini_api_key:
            self.providers.append(
                ("Gemini", GeminiProvider(settings.gemini_api_key)))
        else:
            print(
                "⚠️ Warning: No Gemini API key found. Please set GEMINI_API_KEY in .env file.")

    async def generate_text(self, messages: list, max_tokens: int = 150) -> tuple[str, str]:
        """Generate text using Gemini ONLY."""

        if not self.providers:
            raise Exception(
                "No Gemini API key configured. Please set GEMINI_API_KEY in .env file.")

        provider_name, provider = self.providers[0]  # Only Gemini
        try:
            print(f"🤖 Using {provider_name}...")
            result = await provider.generate_text(messages, max_tokens)
            print(f"✅ Success with {provider_name}")
            return result, provider_name
        except Exception as e:
            print(f"❌ {provider_name} failed: {str(e)}")
            raise Exception(f"Gemini API failed: {str(e)}")


# Global instance
ai_manager = AIProviderManager()
