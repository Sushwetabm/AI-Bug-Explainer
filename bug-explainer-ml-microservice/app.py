# app.py

from model import load_model
from analyzer import analyze_code
import json

if __name__ == "__main__":
    print("🔧 AI Bug Explainer - Local Terminal Interface")
    language = input("Enter programming language (e.g., Python): ")
    print("\nPaste your buggy code. End input with a line that says only 'END':\n")

    lines = []
    while True:
        line = input()
        if line.strip() == "END":
            break
        lines.append(line)

    code = "\n".join(lines)

    tokenizer, model = load_model()
    print("\n🔍 Analyzing your code...\n")
    result = analyze_code(language, code, tokenizer, model)

    print(json.dumps(result, indent=2))
