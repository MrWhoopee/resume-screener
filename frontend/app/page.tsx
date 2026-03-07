import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-10 bg-gray-50">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
        Resume Screener
      </h1>
      <p className="text-xl text-gray-600 mb-10 text-center max-w-md">
        Analyze your resume with AI to see how you match the job requirements.
      </p>
      <Link
        href="/upload"
        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
      >
        Get Started
      </Link>
    </main>
  );
}
