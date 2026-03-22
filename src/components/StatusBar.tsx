import { Note, Theme, Settings } from '../types';

interface Props {
  note: Note | null;
  theme: Theme;
  settings: Settings;
  cursorLine: number;
  cursorCol: number;
  onToggleFind: () => void;
}

export default function StatusBar({ note, theme, settings, cursorLine, cursorCol, onToggleFind }: Props) {
  const content = note?.content ?? '';
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const lines = content.split('\n').length;
  const readTime = Math.max(1, Math.round(words / 200));

  const chip = (label: string, onClick?: () => void) => (
    <span
      key={label}
      onClick={onClick}
      style={{
        color: onClick ? theme.accent : theme.textMuted,
        cursor: onClick ? 'pointer' : 'default',
        padding: '0 4px',
        borderRadius: 3,
        fontSize: 11,
        whiteSpace: 'nowrap',
      }}
      title={onClick ? 'Click to toggle' : undefined}
    >
      {label}
    </span>
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 10px',
        background: theme.statusBar,
        borderTop: `1px solid ${theme.border}`,
        height: 24,
        flexShrink: 0,
        overflow: 'hidden',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden' }}>
        <span style={{ color: theme.text, fontWeight: 700, fontSize: 11, marginRight: 8, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>
          lofipad <span style={{ color: '#ff4444' }}>✦</span>
        </span>
        <span style={{ color: theme.textFaint, fontSize: 11, whiteSpace: 'nowrap' }}>{theme.emoji} {theme.label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden', flexShrink: 0 }}>
        {chip(`Ln ${cursorLine}, Col ${cursorCol}`)}
        <span style={{ color: theme.border, padding: '0 2px' }}>|</span>
        {chip(`${words}w`)}
        {chip(`${chars}ch`)}
        {chip(`${lines}ln`)}
        {chip(`~${readTime}m read`)}
        <span style={{ color: theme.border, padding: '0 2px' }}>|</span>
        {chip(`${settings.fontSize}px`)}
        {chip(settings.fontFamily.split(',')[0].replace(/'/g, ''))}
        <span style={{ color: theme.border, padding: '0 2px' }}>|</span>
        {chip('⌕ Find', onToggleFind)}
        {chip('Autosaved ✓')}
      </div>
    </div>
  );
}
