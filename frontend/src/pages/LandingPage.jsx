import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  HelpCircle,
  Award,
  Zap,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Brain,
  ShieldCheck,
  Download
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-lg">AI Lecture Notes</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3.5 py-2 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 transition-all hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),theme(colors.slate.50))] opacity-60" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Study Companion for University Students</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight mb-6">
            Turn Any Lecture Into <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
              Exam-Ready Notes
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-9 leading-relaxed">
            Upload PDF lecture slides or paste raw class transcripts. Instantly generate structured summaries, key definitions, high-yield exam questions, and test yourself with interactive quizzes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-300 transition-all hover:scale-[1.01]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
            >
              Sign In to Your Account
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> PDF Document Parsing</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Interactive Quizzes</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Wait Time</span>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Everything You Need to Ace Your Exams
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Engineered specifically for university coursework, lecture recordings, and dense textbook chapters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Summaries</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transform 50-page slides or lengthy textbook extracts into high-yield summaries and key concepts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Exam Preparation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automatically extract critical definitions, formula references, and probable final exam questions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Interactive Quizzes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Take timed multiple-choice practice quizzes with automated server grading and answer explanations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Contextual AI Chat</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ask targeted questions directly against your lecture material without leaving your study session.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Workflow</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How It Works in 3 Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm shadow-indigo-200">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Upload or Paste</h3>
              <p className="text-sm text-slate-600">
                Upload your lecture PDF or paste notes directly into the generator.
              </p>
            </div>

            <div className="relative p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm shadow-indigo-200">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Generate Study Pack</h3>
              <p className="text-sm text-slate-600">
                Our engine extracts definitions, structured bullet points, and exam questions in seconds.
              </p>
            </div>

            <div className="relative p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm shadow-indigo-200">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Quiz & Master</h3>
              <p className="text-sm text-slate-600">
                Test your knowledge through auto-generated multiple-choice questions with full explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900 text-sm">AI Lecture Notes Generator</span>
          </div>
          <p className="text-xs text-slate-500">
            &copy; 2026 AI Lecture Notes Generator. Turn lectures into learning.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
