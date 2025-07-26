# Dockerfile

FROM python:3.10-slim

# Set environment variables for caching
ENV TRANSFORMERS_CACHE=/app/model_cache \
    HF_HOME=/app/model_cache \
    TORCH_HOME=/app/model_cache \
    TOKENIZERS_PARALLELISM=false \
    OMP_NUM_THREADS=4

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy app files
COPY . .

# Expose port
EXPOSE 8000

# Run with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--timeout-keep-alive", "120", "--log-level", "info"]
