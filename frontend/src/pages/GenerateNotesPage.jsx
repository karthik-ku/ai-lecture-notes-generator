import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  RotateCcw,
  AlertCircle,
  Loader2,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  Award
} from 'lucide-react';

const GenerateNotesPage = () => {
  const navigate = useNavigate();

  // Mode & Form inputs
  const [inputMode, setInputMode] = useState('pdf'); // 'pdf' or 'text'
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('Detailed Notes'); // Quick Revision, Detailed Notes, Exam Preparation

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith('.pdf') && selected.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setError('File size exceeds the 10MB limit. Please upload a smaller PDF.');
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (inputMode === 'pdf' && !file) {
      setError('Please choose a PDF file to upload.');
      return;
    }
    if (inputMode === 'text' && !text.trim()) {
      setError('Please paste lecture text into the input field.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let res;
      if (inputMode === 'pdf') {
        const formData = new FormData();
        formData.append('file', file);
        if (topic.trim()) formData.append('topic', topic.trim());
        if (style) formData.append('style', style);

        res = await api.post('/notes/generate', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/notes/generate', {
          text: text.trim(),
          topic: topic.trim() || undefined,
          style: style
        });
      }

      setResult(res.data);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to generate lecture notes. Please verify your input and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFullNotesPlainText = () => {
    if (!result || !result.generatedContent) return '';
    const content = result.generatedContent;
    let txt = `========================================\n`;
    txt += `${result.title.toUpperCase()}\n`;
    txt += `Style: ${result.style || 'Standard'} | Generated: ${new Date(result.createdAt).toLocaleString()}\n`;
    txt += `========================================\n\n`;

    txt += `EXECUTIVE SUMMARY:\n${content.summary || ''}\n\n`;

    if (content.keyConcepts?.length) {
      txt += `KEY CONCEPTS:\n`;
      content.keyConcepts.forEach((c) => {
        txt += `• ${c}\n`;
      });
      txt += `\n`;
    }

    if (content.definitions?.length) {
      txt += `IMPORTANT DEFINITIONS:\n`;
      content.definitions.forEach((d) => {
        txt += `• ${d.term}: ${d.definition}\n`;
      });
      txt += `\n`;
    }

    if (content.keyPoints?.length) {
      txt += `KEY TAKEAWAYS & POINTS:\n`;
      content.keyPoints.forEach((p) => {
        txt += `• ${p}\n`;
      });
      txt += `\n`;
    }

    if (content.sections?.length) {
      txt += `STRUCTURED SECTIONS:\n`;
      content.sections.forEach((s) => {
        txt += `\n### ${s.heading}\n${s.content || ''}\n`;
        if (s.bulletPoints?.length) {
          s.bulletPoints.forEach((b) => {
            txt += `  - ${b}\n`;
          });
        }
      });
      txt += `\n`;
    }

    if (content.examQuestions?.length) {
      txt += `EXAM PREPARATION QUESTIONS:\n`;
      content.examQuestions.forEach((q, i) => {
        txt += `${i + 1}. ${q}\n`;
      });
      txt += `\n`;
    }

    if (content.mcqs?.length) {
      txt += `PRACTICE QUESTIONS (MCQS):\n`;
      content.mcqs.forEach((m, i) => {
        txt += `Q${i + 1}: ${m.question}\n`;
        m.options?.forEach((opt, optIdx) => {
          txt += `   [${String.fromCharCode(65 + optIdx)}] ${opt}\n`;
        });
        txt += `Answer: [${String.fromCharCode(65 + m.correctOptionIndex)}] - ${m.explanation || ''}\n\n`;
      });
    }

    return txt;
  };

  const handleCopyNotes = () => {
    const textToCopy = getFullNotesPlainText();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const textData = getFullNotesPlainText();
    const element = document.createElement('a');
    const fileBlob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${(result?.title || 'Lecture_Notes').replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Generate Lecture Notes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload PDF lecture slides or paste raw notes to produce structured study guides, definitions, and quizzes.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-6">
          <button
            type="button"
            onClick={() => { setInputMode('pdf'); setError(''); }}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              inputMode === 'pdf'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload PDF File</span>
          </button>
          <button
            type="button"
            onClick={() => { setInputMode('text'); setError(''); }}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              inputMode === 'text'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Lecture Text</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className="font-semibold">Generation Error</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Mode 1: PDF Upload */}
          {inputMode === 'pdf' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                PDF Lecture Document (Max 10 MB)
              </label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-8 text-center hover:border-indigo-400 bg-slate-50/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  {file ? (
                    <div>
                      <p className="text-sm font-bold text-indigo-700">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to process</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Click or drag & drop lecture PDF here
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Accepts native text-based PDF files up to 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Paste Text */}
          {inputMode === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Paste Lecture Transcript or Notes
                </label>
                <span className="text-[11px] text-slate-500">{text.length} characters</span>
              </div>
              <textarea
                rows={7}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your lecture notes, textbook excerpt, course syllabus, or class transcript here..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-mono leading-relaxed"
              />
            </div>
          )}

          {/* Additional Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Topic / Subject Hint (Optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Distributed Operating Systems - Chapter 4"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Generation Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Detailed Notes">Detailed Notes (Full Comprehensive Study Pack)</option>
                <option value="Quick Revision">Quick Revision (Concise Bullet Points & Summaries)</option>
                <option value="Exam Preparation">Exam Preparation (Heavy Focus on Questions & Definitions)</option>
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing & Generating Study Notes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Notes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Result Display */}
      {result && result.generatedContent && (
        <div className="space-y-6 animate-fade-in">
          {/* Result Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved to Library</span>
                </span>
                {result.generatedContent.isDemoMode ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Info className="w-3 h-3" />
                    <span>Rule-Based Demo Mode (AI Key Not Configured)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Sparkles className="w-3 h-3" />
                    <span>AI-Generated Study Pack</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">{result.title}</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyNotes}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Copied!' : 'Copy Notes'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Download TXT</span>
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
            </div>
          </div>

          {/* Executive Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Executive Summary</span>
            </h3>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {result.generatedContent.summary}
            </p>
          </div>

          {/* Key Concepts Pills */}
          {result.generatedContent.keyConcepts && result.generatedContent.keyConcepts.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-3">Key Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {result.generatedContent.keyConcepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-semibold"
                  >
                    #{concept}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Important Definitions */}
          {result.generatedContent.definitions && result.generatedContent.definitions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-4">Important Definitions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.generatedContent.definitions.map((def, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <p className="font-bold text-sm text-slate-900 mb-1">{def.term}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{def.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Points */}
          {result.generatedContent.keyPoints && result.generatedContent.keyPoints.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600 mb-4">Key Takeaways</h3>
              <ul className="space-y-2.5">
                {result.generatedContent.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Structured Sections */}
          {result.generatedContent.sections && result.generatedContent.sections.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-600">Lecture Structure & Modules</h3>
              <div className="space-y-5 divide-y divide-slate-100">
                {result.generatedContent.sections.map((section, idx) => (
                  <div key={idx} className={idx > 0 ? 'pt-5' : ''}>
                    <h4 className="text-base font-bold text-slate-900 mb-2">{section.heading}</h4>
                    {section.content && (
                      <p className="text-xs sm:text-sm text-slate-600 mb-3 leading-relaxed">{section.content}</p>
                    )}
                    {section.bulletPoints && section.bulletPoints.length > 0 && (
                      <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-slate-700">
                        {section.bulletPoints.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exam Preparation Questions */}
          {result.generatedContent.examQuestions && result.generatedContent.examQuestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-4 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Exam Preparation Questions</span>
              </h3>
              <div className="space-y-3">
                {result.generatedContent.examQuestions.map((q, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-violet-50/50 border border-violet-100 flex items-start gap-3">
                    <span className="font-bold text-xs text-violet-700 shrink-0 mt-0.5">Q{idx + 1}.</span>
                    <p className="text-xs sm:text-sm font-medium text-slate-800">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multiple Choice Questions (MCQs) & Quiz Shortcut */}
          {result.generatedContent.mcqs && result.generatedContent.mcqs.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>Practice Questions (MCQs)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{result.generatedContent.mcqs.length} questions generated</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAnswers(!showAnswers)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    {showAnswers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{showAnswers ? 'Hide Answer Key' : 'Reveal Answer Key'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/quiz/${result.id}`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Take Interactive Quiz</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {result.generatedContent.mcqs.map((mcq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <p className="font-bold text-sm text-slate-900">
                      <span className="text-indigo-600 mr-1.5">Q{idx + 1}.</span> {mcq.question}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mcq.options?.map((opt, optIdx) => {
                        const isCorrect = optIdx === mcq.correctOptionIndex;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all ${
                              showAnswers && isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                    {showAnswers && mcq.explanation && (
                      <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800">
                        <span className="font-bold">Explanation: </span> {mcq.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerateNotesPage;
