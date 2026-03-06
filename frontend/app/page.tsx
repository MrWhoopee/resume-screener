"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadResume } from "../lib/api";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const { mutate, data, isPending, isError } = useMutation({
    mutationFn: uploadResume,
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10 bg-gray-50">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">
        Resume Screener
      </h1>

      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <label className="file-drop-zone">
          <span className="text-gray-500">
            {file ? file.name : "Select a PDF"}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>

        <button
          onClick={() => file && mutate(file)}
          disabled={!file || isPending}
          className="upload-btn"
        >
          {isPending ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>

      <div className="result-card">
        <h2 className="font-bold text-gray-800 mb-3 border-b pb-2">Result:</h2>
        {isError && <p className="text-red-500">Error analyzing file.</p>}
        <p className="text-gray-600 whitespace-pre-wrap">
          {data ? data.extracted_text : "Upload a file to see results."}
        </p>
      </div>
    </main>
  );
}
