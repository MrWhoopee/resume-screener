"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadResume } from "@/lib/api";
import { AxiosError } from "axios";

interface AIAnalysis {
  candidate_name: string;
  skills: string[];
  experience_summary: string;
  hiring_recommendation: string;
}

interface UploadResponse {
  filename: string;
  analysis: AIAnalysis;
}

interface ApiError {
  detail: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const { mutate, data, isPending, isError, error } = useMutation<
    UploadResponse,
    AxiosError<ApiError>,
    File
  >({
    mutationFn: uploadResume,
  });

  const analysis = data?.analysis;
  const errorMessage =
    error?.response?.data?.detail || "An unexpected error occurred";

  return (
    <main className="min-h-screen flex flex-col items-center p-10 bg-gray-50">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">
        Resume Screener
      </h1>

      <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
        <label className="file-drop-zone w-full max-w-md cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-100 transition text-center">
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
          onClick={() => file && mutate(file)}
          disabled={!file || isPending}
          className="w-full max-w-md bg-blue-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-300 hover:bg-blue-700 transition"
        >
          {isPending ? "AI is analyzing..." : "Analyze Resume"}
        </button>

        <div className="result-card w-full mt-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-800 mb-4 border-b pb-2 text-xl">
            Analysis Result:
          </h2>

          {isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-4">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          {isPending && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-600 animate-pulse font-medium">
                Processing with GPT-4o-mini...
              </p>
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold">
                  Candidate
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {analysis.candidate_name}
                </p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                  Key Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold border border-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">
                  Summary
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {analysis.experience_summary}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
                <h3 className="text-xs uppercase tracking-widest text-emerald-600 font-bold mb-1">
                  Recommendation
                </h3>
                <p className="text-emerald-900 italic text-sm">
                  &quot;{analysis.hiring_recommendation}&quot;
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
