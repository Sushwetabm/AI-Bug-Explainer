# ✅ Use official slim image
FROM python:3.10-slim

# ✅ Set working directory
WORKDIR /app

# ✅ Set environment variables early to ensure cache use in setup.py
ENV TRANSFORMERS_CACHE=/app/model_cache \
    HF_HOME=/app/model_cache \
    TORCH_HOME=/app/model_cache \
    TOKENIZERS_PARALLELISM=false \
    OMP_NUM_THREADS=4

# ✅ Install only necessary OS packages and clean cache
RUN apt-get update && apt-get install -y git \
 && rm -rf /var/lib/apt/lists/*

# ✅ Copy files (excluding model_cache, logs, etc. via .dockerignore)
COPY . .

# ✅ Upgrade pip + install deps without cache
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# ✅ Run setup.py to download the model
RUN python setup.py

# ✅ Expose Hugging Face Space-required port
EXPOSE 7860

# ✅ Launch FastAPI on port 7860 for HF Space
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860", "--timeout-]()
