import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';

const NOTES_KEY = 'lofipad_notes_v2';
const ACTIVE_KEY = 'lofipad_active_v2';

function createNote(overrides: Partial<Note> = {}): Note {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: 'Untitled',
    content: '',
    createdAt: now,
    updatedAt: now,
    pinned: false,
    tags: [],
    ...overrides,
  };
}

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) return JSON.parse(raw) as Note[];
  } catch {}
  return [];
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const stored = loadNotes();
    if (stored.length > 0) return stored;
    const first = createNote({
      title: 'Welcome to LofiPad 🎵',
      content:
        '# Welcome to LofiPad!\n\nYour notes are saved automatically and will be here when you return.\n\n## Quick tips\n\n- Ctrl+N → New note\n- Ctrl+F → Find & Replace\n- Ctrl+, → Settings\n- Tab / Shift+Tab → Indent / Unindent\n- Right-click notes in sidebar for more options\n\n## Features\n\n  - 12 beautiful themes\n  - 12 fonts to choose from\n  - Drawing canvas\n  - VS Code-style indent guides\n  - Fully offline — everything saved locally\n\nEnjoy writing ✨',
    });
    return [first];
  });

  const [activeId, setActiveIdState] = useState<string>(() => {
    // Restore last active note
    const saved = localStorage.getItem(ACTIVE_KEY);
    const stored = loadNotes();
    if (saved && stored.find(n => n.id === saved)) return saved;
    return stored.length > 0 ? stored[0].id : '';
  });

  // Persist notes
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Persist active ID
  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, []);

  // Ensure activeId is always valid
  useEffect(() => {
    if (notes.length > 0 && !notes.find(n => n.id === activeId)) {
      const id = notes[0].id;
      setActiveIdState(id);
      localStorage.setItem(ACTIVE_KEY, id);
    }
  }, [notes, activeId]);

  const activeNote = notes.find(n => n.id === activeId) ?? notes[0] ?? null;

  const newNote = useCallback(() => {
    const note = createNote();
    setNotes(prev => [note, ...prev]);
    setActiveId(note.id);
    return note;
  }, [setActiveId]);

  const updateNote = useCallback((id: string, changes: Partial<Note>) => {
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, ...changes, updatedAt: Date.now() } : n))
    );
  }, []);

  const deleteNote = useCallback(
    (id: string) => {
      setNotes(prev => {
        const next = prev.filter(n => n.id !== id);
        if (activeId === id && next.length > 0) setActiveId(next[0].id);
        return next.length > 0 ? next : [createNote()];
      });
    },
    [activeId, setActiveId]
  );

  const togglePin = useCallback((id: string) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  }, []);

  const duplicateNote = useCallback(
    (id: string) => {
      setNotes(prev => {
        const original = prev.find(n => n.id === id);
        if (!original) return prev;
        const copy = createNote({ ...original, title: original.title + ' (copy)' });
        const idx = prev.findIndex(n => n.id === id);
        const next = [...prev];
        next.splice(idx + 1, 0, copy);
        setActiveId(copy.id);
        return next;
      });
    },
    [setActiveId]
  );

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  return {
    notes: sortedNotes,
    activeNote,
    activeId,
    setActiveId,
    newNote,
    updateNote,
    deleteNote,
    togglePin,
    duplicateNote,
  };
}
