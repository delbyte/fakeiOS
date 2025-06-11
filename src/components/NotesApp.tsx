import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Edit3, Trash2, Plus, ChevronLeft, Share, MoreHorizontal } from 'lucide-react';

interface NotesAppProps {
  onClose: () => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const NotesApp: React.FC<NotesAppProps> = ({ onClose }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Set cursor to end of text
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const loadNotes = () => {
    const stored = localStorage.getItem('notes_app_data');
    if (stored) {
      const notesData = JSON.parse(stored);
      setNotes(notesData.sort((a: Note, b: Note) => b.updatedAt - a.updatedAt));
    }
  };

  const saveNotes = (notesToSave: Note[]) => {
    localStorage.setItem('notes_app_data', JSON.stringify(notesToSave));
    setNotes(notesToSave.sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const updatedNotes = [newNote, ...notes];
    saveNotes(updatedNotes);
    setSelectedNote(newNote);
    setIsEditing(true);
  };

  const updateNote = (noteId: string, content: string) => {
    const lines = content.split('\n');
    const title = lines[0] || 'New Note';
    
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, title, content, updatedAt: Date.now() }
        : note
    );
    
    saveNotes(updatedNotes);
    
    // Update selected note
    const updatedNote = updatedNotes.find(note => note.id === noteId);
    if (updatedNote) {
      setSelectedNote(updatedNote);
    }
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    saveNotes(updatedNotes);
    
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const deleteSelectedNotes = () => {
    const updatedNotes = notes.filter(note => !selectedNotes.has(note.id));
    saveNotes(updatedNotes);
    setSelectedNotes(new Set());
    setIsSelecting(false);
    
    if (selectedNote && selectedNotes.has(selectedNote.id)) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit'
      });
    }
  };

  const getPreviewText = (content: string) => {
    const lines = content.split('\n');
    const contentLines = lines.slice(1); // Skip title line
    return contentLines.join(' ').substring(0, 100);
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupNotesByDate = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    const groups: { [key: string]: Note[] } = {
      'Today': [],
      'Yesterday': [],
      'Previous 7 Days': [],
      'Previous 30 Days': [],
      'Older': []
    };

    filteredNotes.forEach(note => {
      const noteDate = new Date(note.updatedAt);
      
      if (noteDate.toDateString() === today.toDateString()) {
        groups['Today'].push(note);
      } else if (noteDate.toDateString() === yesterday.toDateString()) {
        groups['Yesterday'].push(note);
      } else if (noteDate >= lastWeek) {
        groups['Previous 7 Days'].push(note);
      } else if (noteDate >= lastMonth) {
        groups['Previous 30 Days'].push(note);
      } else {
        groups['Older'].push(note);
      }
    });

    return groups;
  };

  // Note editing view
  if (selectedNote) {
    return (
      <div 
        className="absolute inset-0 bg-white z-50 flex flex-col overflow-hidden"
        style={{ borderRadius: '40px' }}
      >
        {/* Header */}
        <div className="bg-white px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedNote(null);
                setIsEditing(false);
              }}
              className="flex items-center text-orange-500 text-lg"
            >
              <ChevronLeft size={24} />
              <span className="ml-1">Notes</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button className="text-orange-500">
                <Share size={24} />
              </button>
              <button 
                onClick={() => deleteNote(selectedNote.id)}
                className="text-orange-500"
              >
                <Trash2 size={24} />
              </button>
              <button className="text-orange-500">
                <MoreHorizontal size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Note Content */}
        <div className="flex-1 p-4">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={selectedNote.content}
              onChange={(e) => updateNote(selectedNote.id, e.target.value)}
              onBlur={() => setIsEditing(false)}
              className="w-full h-full resize-none border-none outline-none text-lg leading-relaxed"
              placeholder="Start writing..."
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="w-full h-full cursor-text text-lg leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              {selectedNote.content || 'Start writing...'}
            </div>
          )}
        </div>

        {/* Bottom toolbar */}
        <div className="bg-gray-100 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-gray-600">
            <span className="text-sm">
              {formatDate(selectedNote.updatedAt)}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2"
            >
              <Edit3 size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main notes list view
  return (
    <div 
      className="absolute inset-0 bg-white z-50 flex flex-col overflow-hidden"
      style={{ borderRadius: '40px' }}
    >
      {/* Header */}
      <div className="bg-white px-4 py-3">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              if (isSelecting) {
                setIsSelecting(false);
                setSelectedNotes(new Set());
              } else {
                onClose();
              }
            }}
            className="text-orange-500 text-lg"
          >
            {isSelecting ? 'Cancel' : 'Done'}
          </button>
          
          <h1 className="text-lg font-semibold">Notes</h1>
          
          <button 
            onClick={() => setIsSelecting(!isSelecting)}
            className="text-orange-500 text-lg"
          >
            {isSelecting ? 'Done' : 'Select'}
          </button>
        </div>

        {/* Folder navigation */}
        <div className="flex items-center mb-4">
          <button className="flex items-center text-orange-500">
            <ChevronLeft size={20} />
            <span className="ml-1">Folders</span>
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-4">All iCloud</h2>

        {/* Search Bar */}
        <div className="bg-gray-100 rounded-lg px-3 py-2 flex items-center mb-4">
          <Search size={16} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent flex-1 outline-none text-gray-700"
          />
        </div>

        {/* Selection Actions */}
        {isSelecting && selectedNotes.size > 0 && (
          <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">
              {selectedNotes.size} selected
            </span>
            <button
              onClick={deleteSelectedNotes}
              className="flex items-center space-x-1 text-red-500"
            >
              <Trash2 size={16} />
              <span className="text-sm">Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold mb-2">No Notes</h2>
              <p className="text-gray-500">Tap the compose button to create your first note</p>
            </div>
          </div>
        ) : (
          <div className="px-4">
            {Object.entries(groupNotesByDate()).map(([groupName, groupNotes]) => {
              if (groupNotes.length === 0) return null;
              
              return (
                <div key={groupName} className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">{groupName}</h3>
                  <div className="space-y-2">
                    {groupNotes.map((note) => {
                      const isSelected = selectedNotes.has(note.id);
                      return (
                        <div
                          key={note.id}
                          className={`bg-gray-50 rounded-lg p-4 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            if (isSelecting) {
                              toggleNoteSelection(note.id);
                            } else {
                              setSelectedNote(note);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {note.title || 'New Note'}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatDate(note.updatedAt)} {getPreviewText(note.content)}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <span>📁 Notes</span>
                              </div>
                            </div>
                            {isSelecting && (
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-3 ${
                                isSelected 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Status and Compose Button */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
          </span>
          <button
            onClick={createNewNote}
            className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Edit3 size={24} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesApp;