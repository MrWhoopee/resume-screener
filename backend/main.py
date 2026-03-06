from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Бекенд працює!"}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    return {"filename": file.filename, "status": "received"}