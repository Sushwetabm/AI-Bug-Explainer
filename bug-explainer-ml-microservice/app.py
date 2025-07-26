# # app.py

# from model import load_model
# from analyzer import analyze_code
# import json

# if __name__ == "__main__":
#     print("🔧 AI Bug Explainer - Local Terminal Interface")
#     language = input("Enter programming language (e.g., Python): ")
#     print("\nPaste your buggy code. End input with a line that says only 'END':\n")

#     lines = []
#     while True:
#         line = input()
#         if line.strip() == "END":
#             break
#         lines.append(line)

#     code = "\n".join(lines)

#     tokenizer, model = load_model()
#     print("\n🔍 Analyzing your code...\n")
#     result = analyze_code(language, code, tokenizer, model)

#     print(json.dumps(result, indent=2))
# app.py

from model import load_model
from analyzer import analyze_code
import json

def main():
    print("🔧 Loading model...")
    tokenizer, model = load_model()

    print("\n📥 Enter your code for analysis.")
    language = input("Programming Language (e.g., Python, JavaScript): ").strip()

    print("Paste your buggy code (end input with an empty line):")
    code_lines = []
    while True:
        line = input()
        if line == "":
            break
        code_lines.append(line)
    code = "\n".join(code_lines)

    print("\n🔍 Analyzing your code...\n")
    result = analyze_code(tokenizer, model, language, code)

    print("\n🧾 JSON Response:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
