import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  BookOpen,
  Copy,
  Check,
  Download,
  Award,
  MessageSquare,
  HelpCircle,
  Clock,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const NoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/notes/${id}`);
        setNote(res.data);
      } catch (err) {
        setError('Failed to load this note or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const getPlainText = () => {
    if (!note || !note.generatedContent) return '';
    const content = note.generatedContent;
    let txt = `========================================\n`;
    txt += `${note.title.toUpperCase()}\n`;
    txt += `Style: ${note.style || 'Standard'} | Generated: ${new Date(note.createdAt).toLocaleString()}\n`;
    txt += `========================================\n\n`;
    txt += `SUMMARY:\n${content.summary || ''}\n\n`;

    if (content.keyConcepts?.length) {
      txt += `KEY CONCEPTS:\n${content.keyConcepts.map((c) => `• ${c}`).join('\n')}\n\n`;
    }
    if (content.definitions?.length) {
      txt += `DEFINITIONS:\n${content.definitions.map((d) => `• ${d.term}: ${d.definition}`).join('\n')}\n\n`;
    }
    if (content.keyPoints?.length) {
      txt += `KEY POINTS:\n${content.keyPoints.map((p) => `• ${p}`).join('\n')}\n\n`;
    }
    if (content.examQuestions?.length) {
      txt += `EXAM QUESTIONS:\n${content.examQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\n`;
    }
    return txt;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getPlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textData = getPlainText();
    const element = document.createElement('a');
    const fileBlob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `${(note?.title || 'Lecture_Notes').replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full text-center py-20">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Note Not Found</h2>
        <p className="text-sm text-slate-600 mt-1 mb-6">{error || 'The requested note could not be retrieved.'}</p>
        <Link to="/notes" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Back to Notes Library
        </Link>
      </div>
    );
  }

  const content = note.generatedContent || {};

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/notes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Notes</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {note.style || 'Study Guide'}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(note.createdAt).toLocaleString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{note.title}</h1>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to={`/quiz/${note.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-colors"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Practice Quiz</span>
          </Link>
          <Link
            to={`/chat?noteId=${note.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 border border-indigo-200 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat AI</span>
          </Link>
          <button
            onClick={handleCopy}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Copy Notes"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Download TXT"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          <span>Executive Summary</span>
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{content.summary}</p>
      </div>

      {/* Key Concepts */}
      {content.keyConcepts?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Concepts</h2>
          <div className="flex flex-wrap gap-2">
            {content.keyConcepts.map((c, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                #{c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Definitions */}
      {content.definitions?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-4">Core Terminology & Definitions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.definitions.map((def, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="font-bold text-sm text-slate-900 mb-1">{def.term}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{def.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Points */}
      {content.keyPoints?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-3">Key Points & Takeaways</h2>
          <ul className="space-y-2">
            {content.keyPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 shrink-0" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Structured Sections */}
      {content.sections?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Lecture Sections</h2>
          <div className="space-y-5 divide-y divide-slate-100">
            {content.sections.map((sec, i) => (
              <div key={i} className={i > 0 ? 'pt-5' : ''}>
                <h3 className="text-base font-bold text-slate-900 mb-2">{sec.heading}</h3>
                {sec.content && <p className="text-sm text-slate-600 mb-2">{sec.content}</p>}
                {sec.bulletPoints?.length > 0 && (
                  <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-slate-700">
                    {sec.bulletPoints.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exam Questions */}
      {content.examQuestions?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-4 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>High-Yield Exam Questions</span>
          </h2>
          <div className="space-y-3">
            {content.examQuestions.map((q, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-violet-50/50 border border-violet-100 flex items-start gap-2.5">
                <span className="font-bold text-xs text-violet-700 shrink-0">Q{i + 1}.</span>
                <p className="text-xs sm:text-sm font-medium text-slate-800">{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MCQs Preview */}
      {content.mcqs?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Multiple Choice Practice ({content.mcqs.length} Questions)</span>
            </h2>
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {showAnswers ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showAnswers ? 'Hide Answers' : 'Reveal Answers'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {content.mcqs.map((m, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="font-bold text-sm text-slate-900">
                  <span className="text-indigo-600 mr-1.5">Q{i + 1}.</span> {m.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {m.options?.map((opt, optIdx) => (
                    <div
                      key={optIdx}
                      className={`p-2 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                        showAnswers && optIdx === m.correctOptionIndex
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteDetailPage;
