# analyzer.py

import torch
import json
import time
import logging

# Configure logger
logger = logging.getLogger("CodeAnalyzer")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


def analyze_code(tokenizer, model, language, code):
    """
    Analyze code for bugs and return corrected version
    
    Args:
        tokenizer: The model tokenizer
        model: The language model
        language: Programming language (e.g., 'python', 'javascript')
        code: Source code to analyze
        
    Returns:
        dict: Analysis results with bug_analysis and corrected_code
    """
    start_time = time.time()
    
    logger.info(f"🔍 Starting analysis for {language} code ({len(code)} characters)")

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
                "2. 'corrected_code': the entire corrected code block with ALL bugs fixed.\n\n"
                "❗️CRITICAL: The 'corrected_code' field must be the COMPLETE, WORKING version of the code with ALL bugs fixed. "
                "Do NOT leave any syntax errors, missing colons, parentheses, or incomplete statements. "
                "The corrected code should be ready to run without any errors.\n\n"
                "Respond ONLY with a valid JSON object, no extra commentary, markdown, or explanations."
            )
        },
        {
            "role": "user",
            "content": f"💻 Language: {language}\n🐞 Buggy Code:\n```{language.lower()}\n{code.strip()}\n```"
        }
    ]

    try:
        logger.info("📦 Tokenizing input...")
        inputs = tokenizer.apply_chat_template(
            messages,
            add_generation_prompt=True,
            return_tensors="pt"
        ).to(model.device)

        attention_mask = (inputs != tokenizer.pad_token_id).long()

        logger.info("⚙️ Starting generation...")
        generation_start = time.time()
        
        # Use more tokens for better code completion
        max_tokens = min(2048, max(1024, 3 * len(code.split())))
        
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                attention_mask=attention_mask,
                max_new_tokens=max_tokens,
                do_sample=False,  # Use greedy decoding for consistency
                temperature=0.1,  # Low temperature for more deterministic output
                top_p=0.9,
                pad_token_id=tokenizer.eos_token_id,
                eos_token_id=tokenizer.eos_token_id,
                use_cache=True
            )
            
        generation_time = time.time() - generation_start
        logger.info(f"⚡ Generation completed in {generation_time:.2f} seconds")

        logger.info("📝 Decoding response...")
        response = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)

        logger.info(f"📄 Response length: {len(response)} characters")
        logger.info(f"🔍 First 200 chars: {response[:200]}...")

        # Clean and parse JSON response
        logger.info("🔍 Attempting to parse JSON...")
        cleaned_response = response.strip()
        
        # Remove markdown code blocks if present
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
        elif cleaned_response.startswith('```'):
            cleaned_response = cleaned_response[3:]
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]

        cleaned_response = cleaned_response.strip()
        
        # Try to find JSON object if response has extra text
        json_start = cleaned_response.find('{')
        json_end = cleaned_response.rfind('}') + 1
        if json_start != -1 and json_end > json_start:
            cleaned_response = cleaned_response[json_start:json_end]

        logger.info(f"🧹 Cleaned response length: {len(cleaned_response)} chars")
        
        try:
            json_output = json.loads(cleaned_response)
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parse failed: {e}")
            logger.error(f"🔍 Trying to extract JSON from response...")
            
            # Try to find and extract valid JSON
            import re
            json_pattern = r'\{.*\}'
            matches = re.findall(json_pattern, cleaned_response, re.DOTALL)
            
            if matches:
                try:
                    json_output = json.loads(matches[-1])  # Take the last match
                except:
                    raise e
            else:
                raise e

        total_time = time.time() - start_time
        logger.info(f"✅ Analysis completed successfully in {total_time:.2f} seconds")

        # Validate and ensure required fields exist
        if not isinstance(json_output, dict):
            raise ValueError("Parsed response is not a dictionary")

        if 'bug_analysis' not in json_output:
            logger.warning("⚠️ Missing 'bug_analysis' key, adding empty list")
            json_output['bug_analysis'] = []

        if 'corrected_code' not in json_output or not json_output['corrected_code'].strip():
            logger.warning("⚠️ Missing or empty 'corrected_code' key, using original code")
            json_output['corrected_code'] = code

        # Ensure bug_analysis is a list
        if not isinstance(json_output['bug_analysis'], list):
            json_output['bug_analysis'] = []

        logger.info(f"🐛 Found {len(json_output['bug_analysis'])} bugs")
        logger.info(f"📝 Corrected code length: {len(json_output['corrected_code'])} chars")

        return json_output

    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON decode error: {e}")
        logger.error(f"📄 Raw response: {repr(response[:500])}...")
        return {
            "bug_analysis": [{
                "line_number": 1,
                "error_message": "Analysis parsing failed",
                "explanation": "The AI model returned a response that couldn't be parsed as JSON",
                "fix_suggestion": "Please try again or check the code format"
            }],
            "corrected_code": code,
            "raw_output": response,
            "parsing_error": str(e)
        }

    except Exception as e:
        total_time = time.time() - start_time
        logger.error(f"❌ Analysis failed after {total_time:.2f} seconds: {str(e)}")
        logger.error(f"💥 Exception type: {type(e).__name__}")
        return {
            "bug_analysis": [{
                "line_number": 1,
                "error_message": "Analysis failed",
                "explanation": f"An error occurred during analysis: {str(e)}",
                "fix_suggestion": "Please try again or contact support"
            }],
            "corrected_code": code,
            "error": str(e),
            "error_type": type(e).__name__
        }