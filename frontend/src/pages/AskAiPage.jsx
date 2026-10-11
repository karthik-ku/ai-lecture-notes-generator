import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  Loader2,
  AlertCircle,
  FileText,
  Info
} from 'lucide-react';

const AskAiPage = () => {
  const [searchParams] = useSearchParams();
  const initialNoteId = searchParams.get('noteId') || '';

  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(initialNoteId);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! Select one of your saved lecture notes above and ask any question about the material. I will answer based strictly on your lecture content.'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingNotes, setFetchingNotes] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const res = await api.get('/notes');
        setNotes(res.data);
        if (!selectedNoteId && res.data.length > 0) {
          setSelectedNoteId(res.data[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load notes for chat', err);
      } finally {
        setFetchingNotes(false);
      }
    };

    loadNotes();
  }, []);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputQuestion.trim() || loading) return;

    if (!selectedNoteId) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Please select a lecture note from the dropdown above before asking a question.'
        }
      ]);
      return;
    }

    const currentQuestion = inputQuestion.trim();
    setInputQuestion('');
    setMessages((prev) => [...prev, { sender: 'user', text: currentQuestion }]);
    setLoading(true);

    try {
      const res = await api.post('/chat/ask', {
        noteId: Number(selectedNoteId),
        question: currentQuestion
      });

      if (res.data.isDemoMode) {
        setIsDemoMode(true);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.data.answer,
          isDemo: res.data.isDemoMode
        }
      ]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to get an answer. Please try again.';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error: ${errorMsg}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        sender: 'assistant',
        text: 'Conversation cleared. What else would you like to know about your lecture notes?'
      }
    ]);
  };

  const selectedNote = notes.find((n) => n.id.toString() === selectedNoteId);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] md:h-screen p-4 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Top Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex-1 max-w-md">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Lecture Context</span>
          </label>
          <select
            value={selectedNoteId}
            onChange={(e) => setSelectedNoteId(e.target.value)}
            disabled={fetchingNotes || notes.length === 0}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {notes.length === 0 ? (
              <option value="">No notes found. Generate notes first.</option>
            ) : (
              notes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.title} ({new Date(n.createdAt).toLocaleDateString()})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isDemoMode && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Info className="w-3 h-3" />
              <span>Demo Matching Mode</span>
            </span>
          )}
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  isUser
                    ? 'bg-indigo-600'
                    : 'bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs shadow-xs'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs whitespace-pre-line'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shrink-0 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-4 flex items-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Analyzing lecture material and drafting response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSend} className="mt-3 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={
            selectedNote
              ? `Ask about "${selectedNote.title}"...`
              : 'Select a lecture note and ask a question...'
          }
          disabled={loading || notes.length === 0}
          className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={loading || !inputQuestion.trim() || notes.length === 0}
          className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AskAiPage;
