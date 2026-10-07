import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { 
  Plus, 
  BookOpen, 
  Trash2, 
  Edit3, 
  Eye, 
  FileText, 
  Check, 
  FileCheck 
} from 'lucide-react';
import { Note } from '@/lib/mockData';

interface NotesWidgetProps {
  notes: Note[];
  onSaveNote: (note: Note) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

// Simple zero-dependency Markdown Parser Component
const MarkdownPreview: React.FC<{ content: string }> = ({ content }) => {
  const parsedHtml = useMemo(() => {
    let lines = content.split('\n');
    let html = '';
    let inList = false;

    for (let line of lines) {
      // Headers
      if (line.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h4 class="text-sm font-bold text-zinc-900 dark:text-white mt-4 mb-2 border-b border-zinc-200 dark:border-white/5 pb-1">${line.substring(4)}</h4>`;
      } else if (line.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h3 class="text-base font-bold text-zinc-900 dark:text-white mt-5 mb-2">${line.substring(3)}</h3>`;
      } else if (line.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h2 class="text-lg font-bold text-zinc-900 dark:text-white mt-6 mb-3">${line.substring(2)}</h2>`;
      } 
      // Bullet lists
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        if (!inList) { html += '<ul class="list-disc pl-5 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 my-2">'; inList = true; }
        const itemContent = line.trim().substring(2);
        html += `<li>${parseInlineMarkdown(itemContent)}</li>`;
      } 
      // Blockquotes
      else if (line.trim().startsWith('> ')) {
        if (inList) { html += '</ul>'; inList = false; }
        const quoteContent = line.trim().substring(2);
        html += `<blockquote class="border-l-2 border-indigo-500 pl-3 italic text-zinc-600 dark:text-zinc-400 my-3 text-sm">${parseInlineMarkdown(quoteContent)}</blockquote>`;
      }
      // Empty line
      else if (line.trim() === '') {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<div class="h-2"></div>';
      } 
      // Normal paragraph
      else {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p class="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed my-2">${parseInlineMarkdown(line)}</p>`;
      }
    }
    if (inList) html += '</ul>';
    return html;
  }, [content]);

  return (
    <div 
      className="space-y-1 select-text selection:bg-indigo-500/30 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-zinc-850"
      dangerouslySetInnerHTML={{ __html: parsedHtml }} 
    />
  );
};

// Parser helper for inline tags like **bold**
function parseInlineMarkdown(text: string): string {
  let formatted = text;
  // Bold **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-zinc-900 dark:text-white">$1</strong>');
  // Italic *text*
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-zinc-700 dark:text-zinc-200">$1</em>');
  // Inline code `code`
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-zinc-100 dark:bg-black/50 px-1 rounded text-pink-600 dark:text-pink-400 font-mono text-xs">$1</code>');
  return formatted;
}

export const NotesWidget: React.FC<NotesWidgetProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
}) => {
  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form/Editor states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<Note['category']>('UK Life');

  // Modal new note states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Note['category']>('UK Life');

  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || notes[0];
  }, [notes, activeNoteId]);

  // Set editor fields when activeNote changes or edit mode toggled
  useEffect(() => {
    if (activeNote) {
      setNoteTitle(activeNote.title);
      setNoteContent(activeNote.content);
      setNoteCategory(activeNote.category);
    }
  }, [activeNote, isEditMode]);

  // Categories list
  const categories: Note['category'][] = ['UK Life', 'University', 'Documents'];

  const handleSave = async () => {
    if (activeNote && noteTitle.trim()) {
      await onSaveNote({
        ...activeNote,
        title: noteTitle.trim(),
        content: noteContent,
        category: noteCategory,
        updatedAt: new Date().toISOString().split('T')[0]
      });
      setIsEditMode(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      const newNote: Note = {
        id: `n-${Date.now()}`,
        title: newTitle.trim(),
        content: `### New ${newCategory} Note\n- Edit this markdown content...`,
        category: newCategory,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      await onSaveNote(newNote);
      setActiveNoteId(newNote.id);
      setIsAddOpen(false);
      setNewTitle('');
      setIsEditMode(true); // open editor immediately
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await onDeleteNote(id);
      // Select another note
      const remaining = notes.filter(n => n.id !== id);
      if (remaining.length > 0) {
        setActiveNoteId(remaining[0].id);
      } else {
        setActiveNoteId('');
      }
    }
  };

  return (
    <Card className="h-full select-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle>UK101 Knowledge Notebook</CardTitle>
          <p className="text-sm text-zinc-500 mt-1">Markdown-supported notes and checklists</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/10"
        >
          <Plus className="h-3.5 w-3.5" /> New Note
        </button>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-zinc-200 dark:border-white/5 h-[420px]">
          {/* Left Panel: Notes Sidebar */}
          <div className="border-r border-zinc-200 dark:border-white/5 overflow-y-auto p-4 space-y-4 max-h-full scrollbar-thin scrollbar-thumb-zinc-800">
            {categories.map((cat) => {
              const catNotes = notes.filter(n => n.category === cat);
              return (
                <div key={cat} className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-2 block">
                    {cat}
                  </span>
                  
                  {catNotes.length === 0 ? (
                    <span className="text-xs text-zinc-600 italic px-2 block">No notes</span>
                  ) : (
                    catNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => {
                          setActiveNoteId(note.id);
                          setIsEditMode(false);
                        }}
                        className={`flex justify-between items-center px-3 py-2 rounded-xl text-left cursor-pointer transition-colors duration-150 group ${
                          activeNoteId === note.id 
                            ? 'bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-500/25' 
                            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-950 dark:hover:text-white border border-transparent'
                        }`}
                      >
                        <span className="text-sm truncate max-w-[120px]">{note.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(note.id);
                          }}
                          className="p-0.5 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Panel: Note Editor / Viewer */}
          <div className="col-span-2 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950/20">
            {activeNote ? (
              <div className="flex flex-col h-full">
                {/* Note Header Toolbar */}
                <div className="flex justify-between items-center px-5 py-3 border-b border-zinc-200 dark:border-white/5 bg-zinc-100/50 dark:bg-zinc-900/10">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    {isEditMode ? (
                      <input
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded px-2 py-0.5 text-sm text-zinc-900 dark:text-white focus:outline-none"
                      />
                    ) : (
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{activeNote.title}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditMode ? (
                      <>
                        <select
                          value={noteCategory}
                          onChange={(e) => setNoteCategory(e.target.value as any)}
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded px-1.5 py-0.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        >
                          <option value="UK Life">UK Life</option>
                          <option value="University">University</option>
                          <option value="Documents">Documents</option>
                        </select>
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-955 dark:hover:text-white transition-colors"
                      >
                        <Edit3 className="h-3 w-3" /> Edit Note
                      </button>
                    )}
                  </div>
                </div>

                {/* Note Body: Content Area */}
                <div className="flex-1 p-5 overflow-y-auto">
                  {isEditMode ? (
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write markdown here..."
                      className="w-full h-full bg-transparent text-sm text-zinc-800 dark:text-zinc-300 font-mono resize-none focus:outline-none"
                    />
                  ) : (
                    <MarkdownPreview content={activeNote.content} />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-sm">
                <FileCheck className="h-10 w-10 text-zinc-600 mb-2" />
                Select or create a note to begin.
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* MODAL: Create new note */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Note">
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Note Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Bank Account details, Semester Exam Syllabus"
              className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl py-2 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="UK Life">UK Life Notes</option>
              <option value="University">University Notes</option>
              <option value="Documents">Important Documents</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm"
            >
              Initialize Note File
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
