# model.py
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

def load_model():
    model_id = "deepseek-ai/deepseek-coder-1.3b-instruct"

    tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        trust_remote_code=True,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    return tokenizer, model
