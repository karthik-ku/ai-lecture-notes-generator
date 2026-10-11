import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Search,
  BookOpen,
  Trash2,
  Download,
  Clock,
  ArrowRight,
  Loader2,
  FilePlus2,
  AlertTriangle
} from 'lucide-react';

const MyNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteModalNote, setDeleteModalNote] = useState(null);

  const fetchNotes = async (searchTerm = '') => {
    try {
      setLoading(true);
      const url = searchTerm ? `/notes?search=${encodeURIComponent(searchTerm)}` : '/notes';
      const res = await api.get(url);
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(search);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotes(search);
  };

  const confirmDelete = async () => {
    if (!deleteModalNote) return;
    setDeletingId(deleteModalNote.id);
    try {
      await api.delete(`/notes/${deleteModalNote.id}`);
      setNotes((prev) => prev.filter((n) => n.id !== deleteModalNote.id));
      setDeleteModalNote(null);
    } catch (err) {
      console.error('Failed to delete note', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (noteId, title) => {
    try {
      const res = await api.get(`/notes/${noteId}`);
      const fullNote = res.data;
      const content = fullNote.generatedContent;

      let txt = `========================================\n`;
      txt += `${fullNote.title.toUpperCase()}\n`;
      txt += `Style: ${fullNote.style || 'Standard'} | Generated: ${new Date(fullNote.createdAt).toLocaleString()}\n`;
      txt += `========================================\n\n`;
      txt += `EXECUTIVE SUMMARY:\n${content.summary || ''}\n\n`;

      if (content.keyPoints?.length) {
        txt += `KEY POINTS:\n`;
        content.keyPoints.forEach((p) => { txt += `• ${p}\n`; });
        txt += `\n`;
      }

      if (content.definitions?.length) {
        txt += `DEFINITIONS:\n`;
        content.definitions.forEach((d) => { txt += `• ${d.term}: ${d.definition}\n`; });
        txt += `\n`;
      }

      if (content.examQuestions?.length) {
        txt += `EXAM QUESTIONS:\n`;
        content.examQuestions.forEach((q, i) => { txt += `${i + 1}. ${q}\n`; });
        txt += `\n`;
      }

      const element = document.createElement('a');
      const fileBlob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      element.href = URL.createObjectURL(fileBlob);
      element.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      console.error('Download error', err);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Notes Library</h1>
          <p className="mt-1 text-sm text-slate-600">Access, review, download, and study all your generated lecture notes.</p>
        </div>
        <Link
          to="/generate"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>New Note</span>
        </Link>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search saved notes by title..."
          className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-indigo-600 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100/80">
                    {note.style || 'Study Notes'}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 line-clamp-1 mb-2">{note.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {note.summary || 'Summary generated for this lecture module.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/notes/${note.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <span>Open Full Note</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDownload(note.id, note.title)}
                    title="Download as TXT"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModalNote(note)}
                    title="Delete Note"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No lecture notes found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            {search ? 'Try adjusting your search query.' : 'You haven’t saved any lecture notes yet. Generate your first one now!'}
          </p>
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>Generate Notes</span>
          </Link>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Lecture Note?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteModalNote.title}"</span>? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalNote(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId === deleteModalNote.id}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {deletingId === deleteModalNote.id ? 'Deleting...' : 'Delete Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNotesPage;
