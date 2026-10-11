import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  FilePlus2,
  Loader2,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const QuizPage = () => {
  const { noteId: paramNoteId } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(paramNoteId || '');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIdx]: selectedOptionIdx }
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load all user notes for selection dropdown
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get('/notes');
        setNotes(res.data);
        if (!selectedNoteId && res.data.length > 0) {
          setSelectedNoteId(res.data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load notes', err);
      }
    };
    fetchNotes();
  }, []);

  // When selectedNoteId changes or initial load, fetch quiz questions
  useEffect(() => {
    if (selectedNoteId) {
      loadQuiz(selectedNoteId);
    }
  }, [selectedNoteId]);

  const loadQuiz = async (noteId) => {
    setLoading(true);
    setError('');
    setQuizSubmitted(false);
    setQuizResult(null);
    setUserAnswers({});
    setCurrentIdx(0);

    try {
      const res = await api.get(`/quiz/${noteId}`);
      setQuestions(res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not load quiz questions for this note.';
      setError(msg);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIdx) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIdx
    }));
  };

  const handleSubmitQuiz = async () => {
    if (submitting || !selectedNoteId) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post(`/quiz/${selectedNoteId}/submit`, {
        answers: userAnswers
      });
      setQuizResult(res.data);
      setQuizSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setCurrentIdx(0);
  };

  const currentQ = questions[currentIdx];
  const progressPercent = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Quiz Top Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Lecture Note
          </label>
          <select
            value={selectedNoteId}
            onChange={(e) => {
              setSelectedNoteId(e.target.value);
              navigate(`/quiz/${e.target.value}`);
            }}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {notes.length === 0 ? (
              <option value="">No notes found</option>
            ) : (
              notes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title}
                </option>
              ))
            )}
          </select>
        </div>

        {questions.length > 0 && !quizSubmitted && (
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>
              Question <span className="text-indigo-600 font-bold">{currentIdx + 1}</span> of {questions.length}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {answeredCount}/{questions.length} answered
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading quiz questions...</p>
        </div>
      )}

      {/* Error or No Questions State */}
      {!loading && error && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Quiz Available</h3>
          <p className="text-xs text-slate-600 mt-1 mb-5">{error}</p>
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Generate New Notes & Questions</span>
          </Link>
        </div>
      )}

      {/* Active Quiz Taking View */}
      {!loading && !error && questions.length > 0 && !quizSubmitted && currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5">
            <div
              className="bg-indigo-600 h-1.5 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {currentIdx + 1}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options?.map((option, optIdx) => {
                const isSelected = userAnswers[currentIdx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-xl text-left border flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-xs ring-1 ring-indigo-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4" />
                      <span>Submit Quiz</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Results and Review View */}
      {quizSubmitted && quizResult && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-indigo-100">
              <Award className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Quiz Completed</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              {quizResult.score}%
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              You answered <span className="font-bold text-emerald-600">{quizResult.correctAnswers}</span> out of{' '}
              <span className="font-bold text-slate-800">{quizResult.totalQuestions}</span> questions correctly.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <Link
                to={`/notes/${selectedNoteId}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Review Full Notes</span>
              </Link>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Answer Breakdown & Explanations</h3>
            <div className="space-y-6">
              {quizResult.review?.map((rev, idx) => (
                <div key={idx} className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-sm text-slate-900">
                      <span className="text-indigo-600 mr-1.5">Q{idx + 1}.</span> {rev.question}
                    </p>
                    {rev.correct ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 shrink-0">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>

                  {/* Options with correctness indication */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {rev.options?.map((opt, optIdx) => {
                      const isSelected = rev.selectedOption === optIdx;
                      const isCorrect = rev.correctOption === optIdx;
                      let badgeClasses = 'bg-white border-slate-200 text-slate-700';

                      if (isCorrect) {
                        badgeClasses = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold ring-1 ring-emerald-400';
                      } else if (isSelected && !isCorrect) {
                        badgeClasses = 'bg-rose-50 border-rose-300 text-rose-800 font-semibold';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-lg text-xs border flex items-center gap-2 ${badgeClasses}`}
                        >
                          <span className="w-5 h-5 rounded-full bg-slate-100 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {rev.explanation && (
                    <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900">
                      <span className="font-bold">Explanation: </span>
                      {rev.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
