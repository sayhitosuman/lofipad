import { useState, useRef, useCallback, useEffect } from 'react';
import { Note, Theme, Settings, FileEntry } from '../types';
import {
  Search, Pin, Trash2, Copy, FileText,
  ChevronLeft, ChevronRight, FolderOpen,
  Folder, File, ChevronDown, ChevronRight as ChevronRightIcon,
  Plus, FolderPlus, FilePlus, MoreVertical,
} from 'lucide-react';

interface Props {
  notes: Note[];
  activeId: string;
  theme: Theme;
  settings: Settings;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
  onDuplicate: (id: string) => void;
  onWidthChange: (w: number) => void;
  // file explorer
  fileTree: FileEntry[];
  activeFilePath: string | null;
  onFileSelect: (entry: FileEntry) => void;
  onOpenFile: () => void;
  onOpenFolder: () => void;
  onCloseExplorer: () => void;
  onCreateFileInFolder: (folderPath: string, name: string) => void;
  onCreateFolderInFolder: (folderPath: string, name: string) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const MIN_W = 190;
const MAX_W = 440;

// ── File Tree Node ─────────────────────────────────────────────────────────────
function FileTreeNode({
  entry, depth, theme, activeFilePath, onSelect,
  onCreateFile, onCreateFolder,
}: {
  entry: FileEntry; depth: number; theme: Theme; activeFilePath: string | null;
  onSelect: (e: FileEntry) => void;
  onCreateFile: (folderPath: string, name: string) => void;
  onCreateFolder: (folderPath: string, name: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth === 0);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [creating, setCreating] = useState<'file' | 'folder' | null>(null);
  const [newName, setNewName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creating && inputRef.current) inputRef.current.focus();
  }, [creating]);

  const isActive = activeFilePath === entry.path;

  const handleCtx = (e: React.MouseEvent) => {
    if (!entry.isFolder) return;
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  };

  const confirmCreate = () => {
    if (!newName.trim() || !creating) return;
    if (creating === 'file') onCreateFile(entry.path, newName.trim());
    else onCreateFolder(entry.path, newName.trim());
    setCreating(null);
    setNewName('');
    setExpanded(true);
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 4,
    paddingLeft: 6 + depth * 14, paddingRight: 8,
    paddingTop: 3, paddingBottom: 3,
    cursor: 'pointer', fontSize: 12,
    color: isActive ? theme.accent : theme.textMuted,
    background: isActive ? theme.active : 'transparent',
    borderLeft: isActive ? `2px solid ${theme.accent}` : '2px solid transparent',
    borderRadius: '0 4px 4px 0',
    userSelect: 'none',
  };

  return (
    <>
      {/* Context menu */}
      {ctxMenu && entry.isFolder && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setCtxMenu(null)} />
          <div style={{
            position: 'fixed', left: ctxMenu.x, top: ctxMenu.y,
            zIndex: 1000, background: theme.toolbar,
            border: `1px solid ${theme.border}`, borderRadius: 8,
            boxShadow: theme.shadow, padding: 4, minWidth: 180,
          }}>
            {[
              { icon: <FilePlus size={12} />, label: 'New File', action: () => { setCreating('file'); setCtxMenu(null); setExpanded(true); } },
              { icon: <FolderPlus size={12} />, label: 'New Folder', action: () => { setCreating('folder'); setCtxMenu(null); setExpanded(true); } },
            ].map(item => (
              <button key={item.label} onClick={item.action} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '6px 10px', background: 'none',
                border: 'none', cursor: 'pointer', color: theme.text,
                fontSize: 12, borderRadius: 5, textAlign: 'left',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = theme.hover; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Row */}
      <div
        style={rowStyle}
        onClick={() => entry.isFolder ? setExpanded(x => !x) : onSelect(entry)}
        onContextMenu={handleCtx}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = theme.hover; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        {entry.isFolder ? (
          <>
            {expanded
              ? <ChevronDown size={11} style={{ flexShrink: 0, color: theme.textFaint }} />
              : <ChevronRightIcon size={11} style={{ flexShrink: 0, color: theme.textFaint }} />}
            {expanded
              ? <FolderOpen size={13} style={{ color: theme.accent, flexShrink: 0 }} />
              : <Folder size={13} style={{ color: theme.accent, flexShrink: 0 }} />}
          </>
        ) : (
          <>
            <span style={{ width: 11, flexShrink: 0 }} />
            <File size={12} style={{ color: theme.textFaint, flexShrink: 0 }} />
          </>
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {entry.name}
        </span>
        {entry.isFolder && (
          <MoreVertical size={11} style={{ color: theme.textFaint, flexShrink: 0, opacity: 0.6 }}
            onClick={e => { e.stopPropagation(); handleCtx(e as unknown as React.MouseEvent); }}
          />
        )}
      </div>

      {/* Expanded children + inline create input */}
      {entry.isFolder && expanded && (
        <>
          {entry.children?.map(child => (
            <FileTreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              theme={theme}
              activeFilePath={activeFilePath}
              onSelect={onSelect}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
            />
          ))}
          {creating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 6 + (depth + 1) * 14, paddingRight: 8, paddingTop: 2, paddingBottom: 2 }}>
              {creating === 'file'
                ? <File size={12} style={{ color: theme.textFaint, flexShrink: 0 }} />
                : <Folder size={12} style={{ color: theme.accent, flexShrink: 0 }} />}
              <input
                ref={inputRef}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmCreate(); if (e.key === 'Escape') { setCreating(null); setNewName(''); } }}
                onBlur={() => { confirmCreate(); }}
                placeholder={creating === 'file' ? 'filename.txt' : 'folder name'}
                style={{
                  flex: 1, background: theme.hover, color: theme.text,
                  border: `1px solid ${theme.accent}`, borderRadius: 4,
                  outline: 'none', fontSize: 11, padding: '2px 6px',
                }}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}

// ── Main Sidebar ───────────────────────────────────────────────────────────────
export default function Sidebar({
  notes, activeId, theme, settings, onSelect, onNew, onDelete, onPin, onDuplicate, onWidthChange,
  fileTree, activeFilePath, onFileSelect, onOpenFile, onOpenFolder, onCloseExplorer,
  onCreateFileInFolder, onCreateFolderInFolder,
}: Props) {
  const [search, setSearch] = useState('');
  const [noteCtx, setNoteCtx] = useState<{ id: string; x: number; y: number } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(settings.sidebarWidth);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = notes.filter(
    n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );
  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  // close open-menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(false);
    };
    if (openMenu) window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [openMenu]);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = settings.sidebarWidth;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const nw = Math.min(MAX_W, Math.max(MIN_W, startW.current + ev.clientX - startX.current));
      onWidthChange(nw);
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [settings.sidebarWidth, onWidthChange]);

  const NoteCard = ({ note }: { note: Note }) => {
    const isActive = note.id === activeId;
    const words = note.content.trim().split(/\s+/).filter(Boolean).length;
    return (
      <div
        onClick={() => onSelect(note.id)}
        onContextMenu={e => { e.preventDefault(); setNoteCtx({ id: note.id, x: e.clientX, y: e.clientY }); }}
        style={{
          padding: '8px 10px', cursor: 'pointer', borderRadius: 6, margin: '2px 6px',
          background: isActive ? theme.active : 'transparent',
          borderLeft: isActive ? `3px solid ${theme.accent}` : '3px solid transparent',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = theme.hover; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          {note.pinned && <Pin size={9} style={{ color: theme.accent, flexShrink: 0 }} />}
          <span style={{
            fontSize: 12, fontWeight: 600, color: isActive ? theme.accent : theme.text,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
          }}>
            {note.title || 'Untitled'}
          </span>
          <span style={{ fontSize: 9, color: theme.textFaint, flexShrink: 0 }}>
            {timeAgo(note.updatedAt)}
          </span>
        </div>
        <div style={{
          fontSize: 11, color: theme.textFaint, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {note.content.slice(0, 60) || 'Empty'}
        </div>
        <div style={{ fontSize: 9, color: theme.textFaint, marginTop: 3 }}>
          {words} words
        </div>
      </div>
    );
  };

  const SectionHeader = ({ label, count }: { label: string; count: number }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '6px 12px 2px', fontSize: 9, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: 1, color: theme.textFaint,
    }}>
      {label}
      <span style={{
        background: theme.hover, color: theme.textFaint,
        borderRadius: 8, padding: '0 4px', fontSize: 9,
      }}>{count}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexShrink: 0, position: 'relative' }}>
      {/* Body */}
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        background: theme.sidebar, borderRight: `1px solid ${theme.border}`,
        width: collapsed ? 0 : settings.sidebarWidth,
        minWidth: collapsed ? 0 : settings.sidebarWidth,
        transition: 'width 0.2s, min-width 0.2s', overflow: 'hidden',
      }}
        onClick={() => { noteCtx && setNoteCtx(null); }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '10px 10px 6px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: theme.accent, fontWeight: 800, fontSize: 14, letterSpacing: -0.5, whiteSpace: 'nowrap' }}>
              ✦ LofiPad
            </span>
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 4 }}>
              {/* New note */}
              <button
                onClick={onNew}
                title="New note (Ctrl+N)"
                style={{
                  display: 'flex', alignItems: 'center', gap: 3,
                  background: theme.accent, color: theme.accentText,
                  padding: '3px 8px', borderRadius: 5, border: 'none',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                }}
              >
                <Plus size={11} /> New
              </button>

              {/* Open dropdown */}
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button
                  onClick={() => setOpenMenu(m => !m)}
                  title="Open file or folder"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    background: theme.hover, color: theme.textMuted,
                    padding: '3px 8px', borderRadius: 5,
                    border: `1px solid ${theme.border}`,
                    cursor: 'pointer', fontSize: 11, fontWeight: 600,
                  }}
                >
                  <FolderOpen size={11} /> Open
                </button>
                {openMenu && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 4,
                    background: theme.toolbar, border: `1px solid ${theme.border}`,
                    borderRadius: 8, boxShadow: theme.shadow, padding: 4, minWidth: 180, zIndex: 200,
                  }}>
                    <button onClick={() => { onOpenFile(); setOpenMenu(false); }} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '7px 12px', background: 'none',
                      border: 'none', cursor: 'pointer', color: theme.text,
                      fontSize: 12, borderRadius: 5, textAlign: 'left',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = theme.hover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <File size={13} style={{ color: theme.accent }} /> Open File
                    </button>
                    <button onClick={() => { onOpenFolder(); setOpenMenu(false); }} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '7px 12px', background: 'none',
                      border: 'none', cursor: 'pointer', color: theme.text,
                      fontSize: 12, borderRadius: 5, textAlign: 'left',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = theme.hover; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <Folder size={13} style={{ color: theme.accent }} /> Open Folder
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={11} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: theme.textFaint }} />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', borderRadius: 6, outline: 'none',
                background: theme.hover, color: theme.text,
                border: `1px solid ${theme.border}`, caretColor: theme.accent,
                fontSize: 11, paddingLeft: 26, paddingRight: 8,
                paddingTop: 5, paddingBottom: 5, boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* ── Scrollable area ── */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: `${theme.scrollbar} transparent` }}>

          {/* Pinned notes */}
          {pinned.length > 0 && (
            <>
              <SectionHeader label="Pinned" count={pinned.length} />
              {pinned.map(n => <NoteCard key={n.id} note={n} />)}
            </>
          )}

          {/* All notes */}
          <SectionHeader label="Notes" count={unpinned.length} />
          {unpinned.length === 0 && (
            <div style={{ padding: '10px 12px', color: theme.textFaint, fontSize: 11 }}>
              {search ? 'No matches' : 'No notes yet. Click + New to start.'}
            </div>
          )}
          {unpinned.map(n => <NoteCard key={n.id} note={n} />)}

          {/* ── Explorer section ── */}
          {fileTree.length > 0 && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px 4px',
                borderTop: `1px solid ${theme.border}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <button onClick={() => setExplorerOpen(x => !x)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: theme.textFaint, display: 'flex' }}>
                    {explorerOpen
                      ? <ChevronDown size={12} />
                      : <ChevronRightIcon size={12} />}
                  </button>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: theme.textFaint }}>
                    Explorer
                  </span>
                </div>
                <button onClick={onCloseExplorer} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textFaint, fontSize: 11, padding: '0 2px' }} title="Close explorer">✕</button>
              </div>
              {explorerOpen && (
                <div style={{ paddingBottom: 8 }}>
                  {fileTree.map(entry => (
                    <FileTreeNode
                      key={entry.path}
                      entry={entry}
                      depth={0}
                      theme={theme}
                      activeFilePath={activeFilePath}
                      onSelect={onFileSelect}
                      onCreateFile={onCreateFileInFolder}
                      onCreateFolder={onCreateFolderInFolder}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Note context menu */}
      {noteCtx && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setNoteCtx(null)} />
          <div style={{
            position: 'fixed', left: noteCtx.x, top: noteCtx.y,
            zIndex: 200, background: theme.toolbar,
            border: `1px solid ${theme.border}`, borderRadius: 8,
            boxShadow: theme.shadow, padding: 4, minWidth: 180,
          }}>
            {[
              { icon: <Pin size={12} />, label: 'Pin / Unpin', action: () => { onPin(noteCtx.id); setNoteCtx(null); } },
              { icon: <Copy size={12} />, label: 'Duplicate', action: () => { onDuplicate(noteCtx.id); setNoteCtx(null); } },
              { icon: <FileText size={12} />, label: 'Export as .txt', action: () => { setNoteCtx(null); } },
              { icon: <Trash2 size={12} />, label: 'Delete', action: () => { onDelete(noteCtx.id); setNoteCtx(null); }, danger: true },
            ].map(item => (
              <button key={item.label} onClick={item.action} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '7px 10px', background: 'none',
                border: 'none', cursor: 'pointer',
                color: item.danger ? '#ef4444' : theme.text,
                fontSize: 12, borderRadius: 5, textAlign: 'left',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = theme.hover; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Drag resize handle */}
      {!collapsed && (
        <div
          onMouseDown={onDragStart}
          style={{
            position: 'absolute', right: -3, top: 0, bottom: 0, width: 6,
            cursor: 'col-resize', zIndex: 10,
          }}
        />
      )}

      {/* Collapse toggle tab */}
      <div
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'absolute',
          right: collapsed ? -20 : -20,
          top: '50%', transform: 'translateY(-50%)',
          width: 20, height: 48,
          background: theme.sidebar,
          border: `1px solid ${theme.border}`,
          borderLeft: 'none',
          borderRadius: '0 6px 6px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 5,
          color: theme.textFaint,
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </div>
    </div>
  );
}
