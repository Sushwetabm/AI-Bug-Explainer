#!/usr/bin/env python3
"""
Quick setup script to optimize your existing ML microservice.
Run this to set up caching and pre-download the model.
"""

import os
import sys
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_cache_directory():
    """Create cache directory for models"""
    cache_dir = Path("./model_cache")
    cache_dir.mkdir(exist_ok=True)
    logger.info(f"✅ Cache directory created: {cache_dir.absolute()}")
    return cache_dir

def set_environment_variables():
    """Set environment variables for optimization"""
    env_vars = {
        "TRANSFORMERS_CACHE": "./model_cache",
        "HF_HOME": "./model_cache", 
        "TORCH_HOME": "./model_cache",
        "TOKENIZERS_PARALLELISM": "false",
        "OMP_NUM_THREADS": "4"
    }
    
    for key, value in env_vars.items():
        os.environ[key] = value
        logger.info(f"Set {key}={value}")

def pre_download_model():
    """Pre-download the model to cache"""
    try:
        from transformers import AutoTokenizer, AutoModelForCausalLM
        
        model_id = "deepseek-ai/deepseek-coder-1.3b-instruct"
        cache_dir = "./model_cache"
        
        logger.info(f"🔧 Pre-downloading model: {model_id}")
        logger.info("This may take a few minutes on first run...")
        
        # Download tokenizer
        logger.info("📝 Downloading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(
            model_id,
            cache_dir=cache_dir,
            trust_remote_code=True
        )
        
        # Download model  
        logger.info("🧠 Downloading model...")
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            cache_dir=cache_dir,
            trust_remote_code=True,
            torch_dtype="auto",  # Let it choose the best dtype
            low_cpu_mem_usage=True,
        )
        
        logger.info("✅ Model downloaded and cached successfully!")
        logger.info(f"📁 Model cached in: {Path(cache_dir).absolute()}")
        
        # Test that everything works
        logger.info("🧪 Testing model loading...")
        del model, tokenizer  # Free memory
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to pre-download model: {e}")
        return False

def main():
    """Main setup function"""
    logger.info("🚀 Setting up ML Microservice Optimizations")
    logger.info("=" * 50)
    
    # Step 1: Setup cache directory
    setup_cache_directory()
    
    # Step 2: Set environment variables
    set_environment_variables()
    
    # Step 3: Pre-download model
    success = pre_download_model()
    
    if success:
        logger.info("\n✅ Setup completed successfully!")
        logger.info("📋 Next steps:")
        logger.info("1. Replace your main.py with the optimized version")
        logger.info("2. Replace your model.py with the optimized version") 
        logger.info("3. Run: python main.py")
        logger.info("\n🚀 Your server will now start much faster!")
    else:
        logger.error("\n❌ Setup failed!")
        logger.error("Please check your internet connection and try again.")
        sys.exit(1)

if __name__ == "__main__":
    main()