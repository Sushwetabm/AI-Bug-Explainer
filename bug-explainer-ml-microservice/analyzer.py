# import json

# def analyze_code(language, code, tokenizer, model):
#     messages = [
#         {
#             "role": "system",
#             "content": (
#                 "You are a helpful and expert-level AI code reviewer and bug fixer. "
#                 "Your task is to analyze the given buggy code in the specified programming language, "
#                 "identify bugs (logical, syntax, runtime, etc.), and fix them. "
#                 "Return a JSON object with the following keys:\n\n"
#                 "1. 'bug_analysis': a list of objects, each containing:\n"
#                 "   - 'line_number': the line number (approximate if needed)\n"
#                 "   - 'error_message': a short name of the bug\n"
#                 "   - 'explanation': short explanation of the problem\n"
#                 "   - 'fix_suggestion': how to fix it\n"
#                 "2. 'corrected_code': the entire corrected code block.\n\n"
#                 "Respond with ONLY the raw JSON object, no extra commentary or markdown."
#             )
#         },
#         {
#             "role": "user",
#             "content": f"💻 Language: {language}\n🐞 Buggy Code:\n```{language.lower()}\n{code.strip()}\n```"
#         }
#     ]

#     inputs = tokenizer.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt").to(model.device)
#     attention_mask = (inputs != tokenizer.pad_token_id).long()

#     outputs = model.generate(
#         inputs,
#         attention_mask=attention_mask,
#         max_new_tokens=1024,
#         do_sample=False,
#         pad_token_id=tokenizer.eos_token_id,
#         eos_token_id=tokenizer.eos_token_id
#     )

#     response = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)

#     # Try parsing response to JSON
#     try:
#         json_output = json.loads(response)
#         return json_output
#     except json.JSONDecodeError:
#         print("⚠️ Could not decode response into JSON. Here's the raw output:\n")
#         print(response)
#         return None
# import json
# import logging
# import time
# import torch

# # Configure logging
# logger = logging.getLogger(__name__)

# def analyze_code(language, code, tokenizer, model):
#     """
#     Analyze code and return bug analysis with improved logging and error handling
#     """
#     start_time = time.time()
#     logger.info(f"🔍 Starting analysis for {language} code ({len(code)} characters)")
    
#     try:
#         # Prepare messages
#         messages = [
#             {
#                 "role": "system",
#                 "content": (
#                     "You are a helpful and expert-level AI code reviewer and bug fixer. "
#                     "Your task is to analyze the given buggy code in the specified programming language, "
#                     "identify bugs (logical, syntax, runtime, etc.), and fix them. "
#                     "Return a JSON object with the following keys:\n\n"
#                     "1. 'bug_analysis': a list of objects, each containing:\n"
#                     "   - 'line_number': the line number (approximate if needed)\n"
#                     "   - 'error_message': a short name of the bug\n"
#                     "   - 'explanation': short explanation of the problem\n"
#                     "   - 'fix_suggestion': how to fix it\n"
#                     "2. 'corrected_code': the entire corrected code block.\n\n"
#                     "Respond with ONLY the raw JSON object, no extra commentary or markdown."
#                 )
#             },
#             {
#                 "role": "user",
#                 "content": f"💻 Language: {language}\n🐞 Buggy Code:\n```{language.lower()}\n{code.strip()}\n```"
#             }
#         ]

#         logger.info("🔧 Applying chat template...")
#         inputs = tokenizer.apply_chat_template(
#             messages, 
#             add_generation_prompt=True, 
#             return_tensors="pt"
#         ).to(model.device)
        
#         attention_mask = (inputs != tokenizer.pad_token_id).long()
        
#         logger.info(f"📏 Input length: {inputs.shape[1]} tokens")
#         logger.info("🚀 Starting model generation...")
        
#         generation_start = time.time()
        
#         # Generate with more conservative settings
#         with torch.no_grad():  # Ensure no gradients are computed
#             outputs = model.generate(
#                 inputs,
#                 attention_mask=attention_mask,
#                 max_new_tokens=512,  # Reduced from 1024 for faster inference
#                 do_sample=False,
#                 temperature=0.1,  # Add temperature for more consistent output
#                 pad_token_id=tokenizer.eos_token_id,
#                 eos_token_id=tokenizer.eos_token_id,
#                 use_cache=True,  # Enable KV cache for efficiency
#             )
        
#         generation_time = time.time() - generation_start
#         logger.info(f"⚡ Generation completed in {generation_time:.2f} seconds")
        
#         logger.info("📝 Decoding response...")
#         response = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)
        
#         logger.info(f"📄 Response length: {len(response)} characters")
#         logger.info(f"🔍 First 100 chars: {response[:100]}...")

#         # Try parsing response to JSON
#         logger.info("🔍 Attempting to parse JSON...")
#         try:
#             # Clean up response - remove any markdown formatting
#             cleaned_response = response.strip()
#             if cleaned_response.startswith('```json'):
#                 cleaned_response = cleaned_response[7:]
#             if cleaned_response.startswith('```'):
#                 cleaned_response = cleaned_response[3:]
#             if cleaned_response.endswith('```'):
#                 cleaned_response = cleaned_response[:-3]
            
#             cleaned_response = cleaned_response.strip()
            
#             json_output = json.loads(cleaned_response)
            
#             total_time = time.time() - start_time
#             logger.info(f"✅ Analysis completed successfully in {total_time:.2f} seconds")
            
#             # Validate the JSON structure
#             if not isinstance(json_output, dict):
#                 raise ValueError("Response is not a dictionary")
                
#             if 'bug_analysis' not in json_output:
#                 logger.warning("⚠️ Missing 'bug_analysis' key, adding empty list")
#                 json_output['bug_analysis'] = []
                
#             if 'corrected_code' not in json_output:
#                 logger.warning("⚠️ Missing 'corrected_code' key, adding original code")
#                 json_output['corrected_code'] = code
            
#             return json_output
            
#         except json.JSONDecodeError as e:
#             logger.error(f"❌ JSON decode error: {e}")
#             logger.error(f"📄 Raw response: {repr(response)}")
            
#             # Return a fallback structure with the raw response
#             fallback_response = {
#                 "bug_analysis": [{
#                     "line_number": 1,
#                     "error_message": "Analysis parsing failed",
#                     "explanation": "The AI model returned a response that couldn't be parsed as JSON",
#                     "fix_suggestion": "Please try again or check the code format"
#                 }],
#                 "corrected_code": code,
#                 "raw_output": response,
#                 "parsing_error": str(e)
#             }
            
#             return fallback_response
            
#     except Exception as e:
#         total_time = time.time() - start_time
#         logger.error(f"❌ Analysis failed after {total_time:.2f} seconds: {str(e)}")
#         logger.error(f"💥 Exception type: {type(e).__name__}")
        
#         # Return error response
#         return {
#             "bug_analysis": [{
#                 "line_number": 1,
#                 "error_message": "Analysis failed",
#                 "explanation": f"An error occurred during analysis: {str(e)}",
#                 "fix_suggestion": "Please try again or contact support"
#             }],
#             "corrected_code": code,
#             "error": str(e),
#             "error_type": type(e).__name__
#         }

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
    start_time = time.time()

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
                "Respond only with a JSON block, no extra commentary."
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
        outputs = model.generate(
            inputs,
            attention_mask=attention_mask,
            max_new_tokens=1024,
            do_sample=False,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id
        )
        generation_time = time.time() - generation_start
        logger.info(f"⚡ Generation completed in {generation_time:.2f} seconds")

        logger.info("📝 Decoding response...")
        response = tokenizer.decode(outputs[0][inputs.shape[1]:], skip_special_tokens=True)

        logger.info(f"📄 Response length: {len(response)} characters")
        logger.info(f"🔍 First 100 chars: {response[:100]}...")

        # Attempt to parse as JSON
        logger.info("🔍 Attempting to parse JSON...")
        cleaned_response = response.strip()
        if cleaned_response.startswith('```json'):
            cleaned_response = cleaned_response[7:]
        elif cleaned_response.startswith('```'):
            cleaned_response = cleaned_response[3:]
        if cleaned_response.endswith('```'):
            cleaned_response = cleaned_response[:-3]

        cleaned_response = cleaned_response.strip()

        json_output = json.loads(cleaned_response)

        total_time = time.time() - start_time
        logger.info(f"✅ Analysis completed successfully in {total_time:.2f} seconds")

        # Validate and patch missing keys
        if not isinstance(json_output, dict):
            raise ValueError("Parsed response is not a dictionary")

        if 'bug_analysis' not in json_output:
            logger.warning("⚠️ Missing 'bug_analysis' key, adding empty list")
            json_output['bug_analysis'] = []

        if 'corrected_code' not in json_output:
            logger.warning("⚠️ Missing 'corrected_code' key, adding original code")
            json_output['corrected_code'] = code

        return json_output

    except json.JSONDecodeError as e:
        logger.error(f"❌ JSON decode error: {e}")
        logger.error(f"📄 Raw response: {repr(response)}")
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
