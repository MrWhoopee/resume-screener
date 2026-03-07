import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/upload-resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}

export async function analyzeMatch(
  resume_text: string,
  job_description: string,
) {
  const formData = new FormData();
  formData.append("resume_text", resume_text);
  formData.append("job_description", job_description);
  const response = await axios.post(
    "http://localhost:8000/analyze-match",
    formData,
  );
  return response.data;
}
