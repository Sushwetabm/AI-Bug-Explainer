# model.py - Optimized version
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
from functools import lru_cache
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging

logger = logging.getLogger(__name__)

# Global variables to store loaded model
_tokenizer = None
_model = None
_model_loading = False
_model_loaded = False

@lru_cache(maxsize=1)
def get_model_config():
    """Cache model configuration"""
    return {
        "model_id": "deepseek-ai/deepseek-coder-1.3b-instruct",
        "torch_dtype": torch.bfloat16,
        "device_map": "auto",
        "trust_remote_code": True,
        # Add these optimizations
        "low_cpu_mem_usage": True,
        "use_cache": True,
    }

def load_model_sync():
    """Synchronous model loading with optimizations"""
    global _tokenizer, _model, _model_loaded
    
    if _model_loaded:
        return _tokenizer, _model
    
    config = get_model_config()
    model_id = config["model_id"]
    
    logger.info(f"🔧 Loading model {model_id}...")
    
    try:
        # Set cache directory to avoid re-downloading
        cache_dir = os.environ.get("TRANSFORMERS_CACHE", "./model_cache")
        os.makedirs(cache_dir, exist_ok=True)
        
        # Load tokenizer first (faster)
        logger.info("📝 Loading tokenizer...")
        _tokenizer = AutoTokenizer.from_pretrained(
            model_id,
            trust_remote_code=config["trust_remote_code"],
            cache_dir=cache_dir,
            use_fast=True,  # Use fast tokenizer if available
        )
        
        # Load model with optimizations
        logger.info("🧠 Loading model...")
        _model = AutoModelForCausalLM.from_pretrained(
            model_id,
            trust_remote_code=config["trust_remote_code"],
            torch_dtype=config["torch_dtype"],
            device_map=config["device_map"],
            low_cpu_mem_usage=config["low_cpu_mem_usage"],
            cache_dir=cache_dir,
            offload_folder="offload",  
             offload_state_dict=True      
        )
        
        # Set to evaluation mode
        _model.eval()
        
        _model_loaded = True
        logger.info("✅ Model loaded successfully!")
        return _tokenizer, _model
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise

async def load_model_async():
    """Asynchronous model loading"""
    global _model_loading
    
    if _model_loaded:
        return _tokenizer, _model
    
    if _model_loading:
        # Wait for ongoing loading to complete
        while _model_loading and not _model_loaded:
            await asyncio.sleep(0.1)
        return _tokenizer, _model
    
    _model_loading = True
    
    try:
        # Run model loading in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor(max_workers=1) as executor:
            tokenizer, model = await loop.run_in_executor(
                executor, load_model_sync
            )
        return tokenizer, model
    finally:
        _model_loading = False

def get_model():
    """Get the loaded model (for synchronous access)"""
    if not _model_loaded:
        return load_model_sync()
    return _tokenizer, _model

def is_model_loaded():
    """Check if model is loaded"""
    return _model_loaded

def get_model_info():
    """Get model information without loading"""
    config = get_model_config()
    return {
        "model_id": config["model_id"],
        "loaded": _model_loaded,
        "loading": _model_loading,
    }
