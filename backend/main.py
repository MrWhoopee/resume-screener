import os
import fitz 
from dotenv import load_dotenv
from openai import OpenAI
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024 

@app.get("/")
def read_root():
    return {"message": "Backend is running and AI-ready!"}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    try:
        doc = fitz.open(stream=content, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        
        if not text.strip():
            raise ValueError("PDF is empty or contains no extractable text")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Error: {str(e)}")

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": (
                        "You are a professional HR assistant. Analyze the resume text and return a JSON object with: "
                        "'candidate_name' (string), 'skills' (list of strings), 'experience_summary' (string), "
                        "and 'hiring_recommendation' (string - brief advice)."
                    )
                },
                {"role": "user", "content": f"Resume text: {text[:4000]}"} 
            ],
            response_format={"type": "json_object"}
        )
        
        import json
        analysis_result = json.loads(response.choices[0].message.content)
        
        return {
            "filename": file.filename,
            "analysis": analysis_result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis Error: {str(e)}")