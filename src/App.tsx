import { useState, useCallback, useEffect } from 'react';
import { THEMES, Settings, FileEntry } from './types';
import { useNotes } from './hooks/useNotes';
import { useSettings } from './hooks/useSettings';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import StatusBar from './components/StatusBar';
import SettingsPanel from './components/SettingsPanel';
import Releases from './components/Releases';

// ── Build file tree from a directory handle ────────────────────────────────────
async function buildFileTree(
  dirHandle: FileSystemDirectoryHandle,
  path = '',
): Promise<FileEntry[]> {
  const entries: FileEntry[] = [];
  for await (const [name, handle] of dirHandle as unknown as AsyncIterable<[string, FileSystemHandle]>) {
    const fullPath = path ? `${path}/${name}` : name;
    if (handle.kind === 'file') {
      entries.push({ name, path: fullPath, isFolder: false });
    } else {
      const children = await buildFileTree(handle as FileSystemDirectoryHandle, fullPath);
      entries.push({ name, path: fullPath, isFolder: true, children });
    }
  }
  return entries.sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

// Store dir handle globally (not in state – not serialisable)
const win = window as unknown as Record<string, unknown>;

// Check if running in Tauri
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined;

export default function App() {
  const { notes, activeNote, activeId, setActiveId, newNote, updateNote, deleteNote, togglePin, duplicateNote } = useNotes();
  const { settings, update } = useSettings();

  const [showSettings, setShowSettings] = useState(false);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  // File explorer state
  const [fileTree, setFileTree] = useState<FileEntry[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [fileViewContent, setFileViewContent] = useState<string | null>(null);
  const [view, setView] = useState<'editor' | 'releases'>(
    window.location.pathname === '/releases' ? 'releases' : 'editor'
  );

  // Handle URL changes
  useEffect(() => {
    const handlePopState = () => {
      setView(window.location.pathname === '/releases' ? 'releases' : 'editor');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: 'editor' | 'releases') => {
    const url = path === 'releases' ? '/releases' : '/';
    window.history.pushState({}, '', url);
    setView(path);
  };

  const theme = THEMES.find(t => t.name === settings.theme) ?? THEMES[0];

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowSettings(false); setFindOpen(false); return; }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') { e.preventDefault(); newNote(); }
        if (e.key === 's') { e.preventDefault(); } // autosave – nothing needed
        if (e.key === ',') { e.preventDefault(); setShowSettings(s => !s); }
        if (e.key === 'f') { e.preventDefault(); setFindOpen(s => !s); }
        if (e.key === 'd') { e.preventDefault(); if (activeNote) duplicateNote(activeNote.id); }
        if (e.key === '\\') { e.preventDefault(); update({ showSidebar: !settings.showSidebar }); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [newNote, activeNote, duplicateNote, update, settings.showSidebar]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (activeNote.title || 'note') + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }, [activeNote]);

  // ── Import file as new note ────────────────────────────────────────────────
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.js,.ts,.json,.html,.css,.py,.rs,.go,.jsx,.tsx,.yaml,.toml,.sh,.xml,.csv';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const content = ev.target?.result as string;
        const note = newNote();
        updateNote(note.id, { title: file.name.replace(/\.[^.]+$/, ''), content });
      };
      reader.readAsText(file);
    };
    input.click();
  }, [newNote, updateNote]);

  // ── Find & Replace ─────────────────────────────────────────────────────────
  const handleFindReplace = useCallback(() => {
    if (!activeNote || !findQuery) return;
    const newContent = activeNote.content.split(findQuery).join(replaceQuery);
    updateNote(activeNote.id, { content: newContent });
  }, [activeNote, findQuery, replaceQuery, updateNote]);

  // ── Open single file (read-only) ───────────────────────────────────────────
  const handleOpenFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const content = ev.target?.result as string;
        const entry: FileEntry = { name: file.name, path: file.name, isFolder: false, content };
        setFileTree([entry]);
        setActiveFilePath(file.name);
        setFileViewContent(content);
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // ── Open folder ────────────────────────────────────────────────────────────
  const handleOpenFolder = useCallback(async () => {
    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({ mode: 'read' });
      const tree = await buildFileTree(dirHandle);
      win['__folderHandle'] = dirHandle;
      const folderEntry: FileEntry = {
        name: dirHandle.name,
        path: dirHandle.name,
        isFolder: true,
        children: tree,
      };
      setFileTree([folderEntry]);
      setActiveFilePath(null);
      setFileViewContent(null);
    } catch {
      // user cancelled
    }
  }, []);

  // ── Select a file in tree ──────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (entry: FileEntry) => {
    if (entry.isFolder) return;
    if (entry.content !== undefined) {
      setActiveFilePath(entry.path);
      setFileViewContent(entry.content);
      return;
    }
    const dirHandle = win['__folderHandle'] as FileSystemDirectoryHandle | undefined;
    if (!dirHandle) return;
    try {
      const segments = entry.path.split('/');
      let current: FileSystemDirectoryHandle = dirHandle;
      for (let i = 0; i < segments.length - 1; i++) {
        current = await current.getDirectoryHandle(segments[i]);
      }
      const fileHandle = await current.getFileHandle(segments[segments.length - 1]);
      const file = await fileHandle.getFile();
      const content = await file.text();
      setActiveFilePath(entry.path);
      setFileViewContent(content);
    } catch {
      setFileViewContent('Could not read file.');
    }
  }, []);

  // ── Create file/folder inside an explorer folder (virtual only) ───────────
  const handleCreateFileInFolder = useCallback((folderPath: string, name: string) => {
    const insert = (entries: FileEntry[]): FileEntry[] =>
      entries.map(e => {
        if (e.path === folderPath && e.isFolder) {
          const newFile: FileEntry = { name, path: `${folderPath}/${name}`, isFolder: false, content: '' };
          return { ...e, children: [...(e.children ?? []), newFile].sort((a, b) => {
            if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
            return a.name.localeCompare(b.name);
          }) };
        }
        if (e.children) return { ...e, children: insert(e.children) };
        return e;
      });
    setFileTree(prev => insert(prev));
  }, []);

  const handleCreateFolderInFolder = useCallback((folderPath: string, name: string) => {
    const insert = (entries: FileEntry[]): FileEntry[] =>
      entries.map(e => {
        if (e.path === folderPath && e.isFolder) {
          const newFolder: FileEntry = { name, path: `${folderPath}/${name}`, isFolder: true, children: [] };
          return { ...e, children: [...(e.children ?? []), newFolder].sort((a, b) => {
            if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
            return a.name.localeCompare(b.name);
          }) };
        }
        if (e.children) return { ...e, children: insert(e.children) };
        return e;
      });
    setFileTree(prev => insert(prev));
  }, []);

  const handleCloseExplorer = useCallback(() => {
    setFileTree([]);
    setActiveFilePath(null);
    setFileViewContent(null);
    win['__folderHandle'] = undefined;
  }, []);

  const showSidebar = settings.showSidebar && !settings.focusMode;
  const isViewingFile = activeFilePath !== null && fileViewContent !== null;

  // Ref to import a file as a note from viewer
  const importFileAsNote = useCallback(() => {
    if (!fileViewContent || !activeFilePath) return;
    const note = newNote();
    updateNote(note.id, {
      title: activeFilePath.split('/').pop()?.replace(/\.[^.]+$/, '') ?? 'Imported',
      content: fileViewContent,
    });
    setActiveFilePath(null);
    setFileViewContent(null);
  }, [fileViewContent, activeFilePath, newNote, updateNote]);

  const MainApp = (
    <div
      style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden',
        background: theme.bg, color: theme.text,
        fontFamily: settings.fontFamily,
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      {/* Find & Replace Bar */}
      {findOpen && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px', background: theme.toolbar,
          borderBottom: `1px solid ${theme.border}`, zIndex: 20, flexShrink: 0,
        }}>
          <input
            autoFocus
            placeholder="Find..."
            value={findQuery}
            onChange={e => setFindQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFindReplace()}
            style={{
              padding: '4px 10px', borderRadius: 6, outline: 'none', fontSize: 12,
              background: theme.hover, color: theme.text,
              border: `1px solid ${theme.border}`, width: 180,
            }}
          />
          <input
            placeholder="Replace with..."
            value={replaceQuery}
            onChange={e => setReplaceQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFindReplace()}
            style={{
              padding: '4px 10px', borderRadius: 6, outline: 'none', fontSize: 12,
              background: theme.hover, color: theme.text,
              border: `1px solid ${theme.border}`, width: 180,
            }}
          />
          <button onClick={handleFindReplace} style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 12,
            background: theme.accent, color: theme.accentText, border: 'none', cursor: 'pointer',
          }}>Replace All</button>
          {findQuery && (
            <span style={{ color: theme.textFaint, fontSize: 11 }}>
              {(activeNote?.content ?? '').split(findQuery).length - 1} match(es)
            </span>
          )}
          <button onClick={() => setFindOpen(false)} style={{
            marginLeft: 'auto', padding: '4px 8px', borderRadius: 6, fontSize: 12,
            background: theme.hover, color: theme.textMuted,
            border: `1px solid ${theme.border}`, cursor: 'pointer',
          }}>✕</button>
        </div>
      )}

      <Toolbar
        theme={theme}
        settings={settings}
        onSettingsChange={update}
        onExport={handleExport}
        onImport={handleImport}
        onToggleFocus={() => update({ focusMode: !settings.focusMode })}
        noteTitle={isViewingFile ? (activeFilePath ?? '') : (activeNote?.title ?? '')}
        onTitleChange={t => activeNote && !isViewingFile && updateNote(activeNote.id, { title: t })}
        onOpenSettings={() => setShowSettings(true)}
        onNewNote={newNote}
        isReadOnly={isViewingFile}
        isTauri={isTauri}
        onGoToReleases={() => navigate('releases')}
      />

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar
            notes={notes}
            activeId={activeId}
            theme={theme}
            settings={settings}
            onSelect={id => { setActiveId(id); setActiveFilePath(null); setFileViewContent(null); }}
            onNew={newNote}
            onDelete={deleteNote}
            onPin={togglePin}
            onDuplicate={duplicateNote}
            onWidthChange={w => update({ sidebarWidth: w })}
            fileTree={fileTree}
            activeFilePath={activeFilePath}
            onFileSelect={handleFileSelect}
            onOpenFile={handleOpenFile}
            onOpenFolder={handleOpenFolder}
            onCloseExplorer={handleCloseExplorer}
            onCreateFileInFolder={handleCreateFileInFolder}
            onCreateFolderInFolder={handleCreateFolderInFolder}
          />
        )}

        {/* Content area */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {isViewingFile ? (
            /* ── Read-only file viewer ── */
            <div style={{
              flex: 1, overflow: 'auto', background: theme.editor,
              fontFamily: settings.fontFamily, fontSize: settings.fontSize,
              lineHeight: settings.lineHeight, color: theme.text,
              whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
              scrollbarWidth: 'thin', scrollbarColor: `${theme.scrollbar} transparent`,
              position: 'relative',
            }}>
              {/* Banner */}
              <div style={{
                position: 'sticky', top: 0, display: 'flex', alignItems: 'center', gap: 8,
                background: theme.toolbar, borderBottom: `1px solid ${theme.border}`,
                padding: '6px 16px', fontSize: 11, color: theme.textMuted, zIndex: 10,
              }}>
                <span style={{ color: theme.accent, fontWeight: 700 }}>👁 Read-only</span>
                <span style={{ color: theme.textFaint }}>•</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{activeFilePath}</span>
                <button onClick={importFileAsNote} style={{
                  padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                  background: theme.accent, color: theme.accentText, border: 'none', cursor: 'pointer',
                }}>Import as Note</button>
                <button onClick={() => { setActiveFilePath(null); setFileViewContent(null); }} style={{
                  padding: '3px 8px', borderRadius: 5, fontSize: 11,
                  background: theme.hover, color: theme.textMuted,
                  border: `1px solid ${theme.border}`, cursor: 'pointer',
                }}>✕</button>
              </div>
              <div style={{ padding: '20px 28px' }}>{fileViewContent}</div>
            </div>
          ) : (
            /* ── Normal editor ── */
            <Editor
              content={activeNote?.content ?? ''}
              onChange={c => activeNote && updateNote(activeNote.id, { content: c })}
              theme={theme}
              settings={settings}
              onCursorChange={(l, c) => { setCursorLine(l); setCursorCol(c); }}
            />
          )}

          {/* Status Bar */}
          {settings.showStatusBar && (
            <StatusBar
              note={isViewingFile ? null : activeNote}
              theme={theme}
              settings={settings}
              cursorLine={cursorLine}
              cursorCol={cursorCol}
              onToggleFind={() => setFindOpen((v: boolean) => !v)}
            />
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          theme={theme}
          settings={settings}
          onSettingsChange={(s: Partial<Settings>) => update(s)}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );

  if (view === 'releases') {
    return <Releases theme={theme} settings={settings} onBack={() => navigate('editor')} />;
  }

  return MainApp;
}
