import os
import fitz
import json
import re
from dotenv import load_dotenv
from openai import OpenAI
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

client = OpenAI(
    base_url="http://localhost:11434/v1", 
    api_key="ollama" 
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE = 5 * 1024 * 1024 

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    try:
        doc = fitz.open(stream=content, filetype="pdf")
        text = "".join([page.get_text() for page in doc])
        return {"resume_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-match")
async def analyze_match(resume_text: str = Form(...), job_description: str = Form(...)):
    prompt = f"""
    You are an expert HR. Compare this Resume and Job Description.
    Return ONLY a valid JSON object with keys: "match_score" (int), "missing_skills" (list), "strong_points" (list), "recommendation" (string).
    
    Resume: {resume_text[:3000]}
    Job Description: {job_description[:3000]}
    """
    
    response = client.chat.completions.create(
        model="llama3.2",
        messages=[{"role": "user", "content": prompt}]
    )
    
    raw = response.choices[0].message.content
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    result = json.loads(match.group(0)) if match else json.loads(raw)
    
    return {"analysis": result}