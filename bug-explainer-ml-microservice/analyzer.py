import json

def analyze_code(language, code, tokenizer, model):
    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful and expert-level AI code reviewer and bug fixer. "
                "Your task is to analyze the given buggy code in the specified programming language, "
                "identify bugs (logical, syntax, runtime, etc.), and fix them. "
                "Return a JSON object with the following keys:\n\n"
                "1. 'bug_analysis': a list of objects, each containing:\n"
                "   - 'line_number': the line number (approximate if needed)\n"
                "   - 'error_message': a short name of the bug\n"
                "   - 'explanation': short explanation of the problem\n"
                "   - 'fix_suggestion': how to fix it\n"
                "2. 'corrected_code': the entire corrected code block.\n\n"
                "Respond with ONLY the raw JSON object, no extra commentary or markdown."
            )
        },
        {
            "role": "user",
            "content": f"💻 Language: {language}\n🐞 Buggy Code:\n```{language.lower()}\n{code.strip()}\n```"
        }
    ]

    inputs = tokenizer.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt").to(model.device)
    attention_mask = (inputs != tokenizer.pad_token_id).long()

    outputs = model.generate(
        inputs,
        attention_mask=attention_mask,
        max_new_tokens=1024,
        do_sample=False,
        pad_token_id=tokenizer.eos_token_id,
        eos_token_id=tokenizer.eos_token_id
    )

    response = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)

    # Try parsing response to JSON
    try:
        json_output = json.loads(response)
        return json_output
    except json.JSONDecodeError:
        print("⚠️ Could not decode response into JSON. Here's the raw output:\n")
        print(response)
        return None
