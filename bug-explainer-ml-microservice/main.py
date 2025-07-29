from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import load_model_async, get_model, is_model_loaded, get_model_info
from analyzer import analyze_code
import logging
import asyncio
import time
from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Bug Explainer ML Microservice",
    description="An AI service that detects and fixes bugs in code",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    language: str
    code: str

# Global variables for model loading status
model_load_start_time = None
model_load_task = None

def transform_bug_to_issue(bug):
    """Transform ML service bug format to frontend issue format"""
    return {
        "lineNumber": bug.get("line_number", 0),
        "type": bug.get("error_message", "Unknown Error"),
        "message": bug.get("explanation", "No explanation provided"),
        "suggestion": bug.get("fix_suggestion", "No suggestion provided")
    }

@app.on_event("startup")
async def startup_event():
    """Start model loading in background when server starts"""
    global model_load_start_time, model_load_task
    logger.info("🚀 Starting ML microservice...")
    logger.info("🔧 Initiating background model loading...")
    
    model_load_start_time = time.time()
    
    # Start model loading in background
    model_load_task = asyncio.create_task(load_model_async())
    
    logger.info("✅ Server started! Model is loading in background...")

@app.get("/health")
async def health_check():
    """Enhanced health check with model loading status"""
    global model_load_start_time
    
    model_info = get_model_info()
    loading_time = None
    
    if model_load_start_time:
        loading_time = round(time.time() - model_load_start_time, 2)
    
    return {
        "status": "healthy",
        "model_info": model_info,
        "loading_time_seconds": loading_time,
        "ready_for_inference": model_info["loaded"]
    }

@app.get("/model/status")
async def model_status():
    """Get detailed model loading status"""
    global model_load_start_time
    
    model_info = get_model_info()
    loading_time = None
    
    if model_load_start_time:
        loading_time = round(time.time() - model_load_start_time, 2)
    
    return {
        "model_id": model_info["model_id"],
        "loaded": model_info["loaded"],
        "loading": model_info["loading"],
        "loading_time_seconds": loading_time,
        "ready": model_info["loaded"]
    }

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    """Original analyze endpoint with model loading check"""
    logger.info(f"🔍 Received code for analysis ({req.language})")
    
    # Check if model is loaded
    if not is_model_loaded():
        # Wait for model to load (with timeout)
        try:
            await asyncio.wait_for(model_load_task, timeout=300)  # 5 minute timeout
        except asyncio.TimeoutError:
            raise HTTPException(
                status_code=503, 
                detail="Model is still loading. Please try again in a few moments."
            )
    
    try:
        tokenizer, model = get_model()
        # Fixed function call with correct parameter order
        result = analyze_code(tokenizer, model, req.language, req.code)

        if result is None:
            raise HTTPException(status_code=500, detail="Model failed to return any response.")

        if not isinstance(result, dict):
            logger.warning("⚠️ Model did not return valid JSON, sending raw output")
            return {
                "bugs": [],
                "corrected_code": "",
                "raw_output": result
            }

        return {
            "bugs": result.get("bug_analysis", []),
            "corrected_code": result.get("corrected_code", ""),
            "raw_output": result.get("raw_output", "")
        }
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analysis/submit")
async def analyze_for_frontend(req: AnalyzeRequest):
    """Frontend-compatible endpoint with model loading check"""
    logger.info(f"🔍 Frontend: Received code for analysis ({req.language})")
    
    # Check if model is loaded
    if not is_model_loaded():
        # If model is still loading, return appropriate response
        if model_load_task and not model_load_task.done():
            return {
                "success": False,
                "has_json_output": False,
                "corrected_code": "",
                "issues": [],
                "raw_output": "Model is still loading. Please wait a moment and try again.",
                "model_status": "loading"
            }
        else:
            # Try to wait for model loading
            try:
                await asyncio.wait_for(model_load_task, timeout=30)  # Short timeout for frontend
            except (asyncio.TimeoutError, Exception):
                return {
                    "success": False,
                    "has_json_output": False,
                    "corrected_code": "",
                    "issues": [],
                    "raw_output": "Model is not ready yet. Please try again in a few moments.",
                    "model_status": "loading"
                }
    
    try:
        tokenizer, model = get_model()
        # Fixed function call with correct parameter order
        result = analyze_code(tokenizer, model, req.language, req.code)
        
        logger.info(f"📋 Analysis result type: {type(result)}")
        
        if result is None:
            return {
                "success": False,
                "has_json_output": False,
                "corrected_code": "",
                "issues": [],
                "raw_output": "Model failed to return any response.",
                "model_status": "error"
            }

        # If result is not valid JSON, return raw output as fallback
        if not isinstance(result, dict):
            logger.warning("⚠️ Model did not return valid JSON, showing raw output")
            return {
                "success": False,
                "has_json_output": False,
                "corrected_code": "",
                "issues": [],
                "raw_output": str(result),
                "model_status": "loaded"
            }

        # Successfully parsed JSON
        bugs = result.get("bug_analysis", [])
        issues = [transform_bug_to_issue(bug) for bug in bugs]
        corrected_code = result.get("corrected_code", "")
        
        logger.info(f"🐛 Found {len(issues)} issues")
        logger.info(f"📝 Corrected code length: {len(corrected_code)} chars")
        logger.info(f"🔧 Corrected code preview: {corrected_code[:100]}...")

        return {
            "success": True,
            "has_json_output": True,
            "corrected_code": corrected_code,
            "issues": issues,
            "raw_output": result.get("raw_output", ""),
            "model_status": "loaded"
        }
        
    except Exception as e:
        logger.error(f"Frontend analysis error: {e}")
        return {
            "success": False,
            "has_json_output": False,
            "corrected_code": "",
            "issues": [],
            "raw_output": f"Analysis failed: {str(e)}",
            "model_status": "error"
        }

@app.get("/analysis/history")
async def get_analysis_history():
    """Get analysis history (placeholder)"""
    return {"data": []}

@app.get("/")
async def root():
    return {
        "message": "👋 Bug Explainer ML microservice is running.",
        "status": "OK",
        "model_ready": is_model_loaded()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)