"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadResume, analyzeMatch } from "@/lib/api";
import { AxiosError } from "axios";

interface AnalysisResult {
  match_score: number;
  missing_skills: string[];
  strong_points: string[];
  recommendation: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");

  const uploadMutation = useMutation({
    mutationFn: uploadResume,
    onSuccess: (data) => setResumeText(data.resume_text),
  });

  const matchMutation = useMutation<
    { analysis: AnalysisResult },
    AxiosError,
    { resume_text: string; job_description: string }
  >({
    mutationFn: ({ resume_text, job_description }) =>
      analyzeMatch(resume_text, job_description),
  });

  const isPending = uploadMutation.isPending || matchMutation.isPending;
  const analysis = matchMutation.data?.analysis;

  return (
    <main className="min-h-screen flex flex-col items-center p-10 bg-gray-50">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">
        Resume Matcher
      </h1>

      <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
        <label className="w-full max-w-md cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-100 transition text-center">
          <span className="text-gray-500 block">
            {file ? file.name : "Select a PDF Resume"}
          </span>
          <input
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <button
          onClick={() => file && uploadMutation.mutate(file)}
          disabled={!file || uploadMutation.isPending}
          className="w-full max-w-md bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900 disabled:bg-gray-400"
        >
          {uploadMutation.isPending ? "Parsing..." : "Parse Resume"}
        </button>

        {resumeText && (
          <div className="w-full">
            <textarea
              className="w-full h-32 p-4 border rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Paste Job Description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <button
              onClick={() =>
                matchMutation.mutate({
                  resume_text: resumeText,
                  job_description: jobDescription,
                })
              }
              disabled={!jobDescription || isPending}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isPending ? "Analyzing with Ollama..." : "Analyze Match"}
            </button>
          </div>
        )}

        {analysis && (
          <div className="w-full mt-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <h2 className="font-bold text-gray-800 border-b pb-2 text-xl">
              Match Score: {analysis.match_score}%
            </h2>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-semibold border border-red-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
              <h3 className="text-xs uppercase tracking-widest text-emerald-600 font-bold mb-1">
                Recommendation
              </h3>
              <p className="text-emerald-900 italic text-sm">
                {analysis.recommendation}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
