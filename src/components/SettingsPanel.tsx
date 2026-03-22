import { Theme, Settings, FONTS, THEMES } from '../types';
import { X } from 'lucide-react';

interface Props {
  theme: Theme;
  settings: Settings;
  onSettingsChange: (s: Partial<Settings>) => void;
  onClose: () => void;
}

export default function SettingsPanel({ theme, settings, onSettingsChange, onClose }: Props) {
  const Section = ({ label }: { label: string }) => (
    <div style={{ color: theme.textFaint, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '14px 0 6px' }}>
      {label}
    </div>
  );

  const Row = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${theme.border}` }}>
      <div>
        <div style={{ color: theme.text, fontSize: 12 }}>{label}</div>
        {hint && <div style={{ color: theme.textFaint, fontSize: 10 }}>{hint}</div>}
      </div>
      <div>{children}</div>
    </div>
  );

  const Toggle = ({ val, onChange }: { val: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!val)}
      style={{
        width: 38, height: 20, borderRadius: 10,
        background: val ? theme.accent : theme.hover,
        border: `1px solid ${val ? theme.accent : theme.border}`,
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: 'white',
        position: 'absolute', top: 2,
        left: val ? 20 : 2,
        transition: 'left 0.2s',
      }} />
    </button>
  );

  const Slider = ({
    val, min, max, step, onChange, format,
  }: {
    val: number; min: number; max: number; step: number;
    onChange: (v: number) => void; format?: (v: number) => string;
  }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="range" min={min} max={max} step={step} value={val}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: 110, accentColor: theme.accent }}
      />
      <span style={{ color: theme.textMuted, fontSize: 11, minWidth: 36, textAlign: 'right' }}>
        {format ? format(val) : val}
      </span>
    </div>
  );

  const Select = ({ val, options, onChange }: { val: string; options: { label: string; value: string }[]; onChange: (v: string) => void }) => (
    <select
      value={val}
      onChange={e => onChange(e.target.value)}
      style={{
        background: theme.hover, color: theme.text,
        border: `1px solid ${theme.border}`, borderRadius: 5,
        padding: '3px 8px', fontSize: 11, outline: 'none',
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: theme.sidebar, border: `1px solid ${theme.border}`,
          borderRadius: 12, boxShadow: theme.shadow,
          width: 440, maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0,
        }}>
          <span style={{ color: theme.text, fontWeight: 700, fontSize: 14 }}>⚙️ Settings</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 18px 18px', scrollbarWidth: 'thin', scrollbarColor: `${theme.scrollbar} transparent` }}>

          {/* Theme */}
          <Section label="Theme" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 4 }}>
            {THEMES.map(t => (
              <button
                key={t.name}
                onClick={() => onSettingsChange({ theme: t.name })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 8px', borderRadius: 7,
                  background: settings.theme === t.name ? theme.active : theme.hover,
                  border: `1px solid ${settings.theme === t.name ? theme.accent : theme.border}`,
                  cursor: 'pointer', fontSize: 11, color: settings.theme === t.name ? theme.accent : theme.text,
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.accent, flexShrink: 0 }} />
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* Font */}
          <Section label="Font" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5, marginBottom: 4 }}>
            {FONTS.map(f => (
              <button
                key={f.value}
                onClick={() => onSettingsChange({ fontFamily: f.value })}
                style={{
                  padding: '5px 8px', borderRadius: 6, textAlign: 'left',
                  background: settings.fontFamily === f.value ? theme.active : theme.hover,
                  border: `1px solid ${settings.fontFamily === f.value ? theme.accent : theme.border}`,
                  cursor: 'pointer', fontSize: 12, fontFamily: f.value,
                  color: settings.fontFamily === f.value ? theme.accent : theme.text,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Typography */}
          <Section label="Typography" />
          <Row label="Font Size" hint={`${settings.fontSize}px`}>
            <Slider val={settings.fontSize} min={10} max={36} step={1} onChange={v => onSettingsChange({ fontSize: v })} />
          </Row>
          <Row label="Line Height" hint={String(settings.lineHeight)}>
            <Slider val={settings.lineHeight} min={1.2} max={2.8} step={0.1} onChange={v => onSettingsChange({ lineHeight: v })} format={v => v.toFixed(1)} />
          </Row>
          <Row label="Letter Spacing">
            <Slider val={settings.letterSpacing} min={-1} max={6} step={0.1} onChange={v => onSettingsChange({ letterSpacing: v })} format={v => v.toFixed(1)} />
          </Row>
          <Row label="Font Weight">
            <Select
              val={String(settings.fontWeight)}
              onChange={v => onSettingsChange({ fontWeight: Number(v) })}
              options={[
                { label: 'Thin (100)', value: '100' },
                { label: 'Light (300)', value: '300' },
                { label: 'Regular (400)', value: '400' },
                { label: 'Medium (500)', value: '500' },
                { label: 'Semibold (600)', value: '600' },
                { label: 'Bold (700)', value: '700' },
              ]}
            />
          </Row>
          <Row label="Text Case">
            <Select
              val={settings.textTransform}
              onChange={v => onSettingsChange({ textTransform: v as Settings['textTransform'] })}
              options={[
                { label: 'Normal', value: 'none' },
                { label: 'UPPERCASE', value: 'uppercase' },
                { label: 'lowercase', value: 'lowercase' },
                { label: 'Capitalize', value: 'capitalize' },
              ]}
            />
          </Row>
          <Row label="Font Style">
            <Select
              val={settings.fontStyle ?? 'normal'}
              onChange={v => onSettingsChange({ fontStyle: v as Settings['fontStyle'] })}
              options={[
                { label: 'Normal', value: 'normal' },
                { label: 'Italic', value: 'italic' },
              ]}
            />
          </Row>
          <Row label="Text Decoration">
            <Select
              val={settings.textDecoration ?? 'none'}
              onChange={v => onSettingsChange({ textDecoration: v as Settings['textDecoration'] })}
              options={[
                { label: 'None', value: 'none' },
                { label: 'Underline', value: 'underline' },
                { label: 'Strikethrough', value: 'line-through' },
              ]}
            />
          </Row>
          <Row label="Text Align">
            <Select
              val={settings.textAlign ?? 'left'}
              onChange={v => onSettingsChange({ textAlign: v as Settings['textAlign'] })}
              options={[
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ]}
            />
          </Row>
          <Row label="Tab Size">
            <Select
              val={String(settings.tabSize)}
              onChange={v => onSettingsChange({ tabSize: Number(v) })}
              options={[
                { label: '2 spaces', value: '2' },
                { label: '4 spaces', value: '4' },
                { label: '8 spaces', value: '8' },
              ]}
            />
          </Row>

          {/* Spacing */}
          <Section label="Spacing" />
          <Row label="Paragraph Spacing" hint={`${settings.paragraphSpacing}px`}>
            <Slider val={settings.paragraphSpacing} min={0} max={32} step={1} onChange={v => onSettingsChange({ paragraphSpacing: v })} format={v => `${v}px`} />
          </Row>

          {/* Layout */}
          <Section label="Layout" />
          <Row label="Editor Width">
            <Select
              val={settings.editorWidth}
              onChange={v => onSettingsChange({ editorWidth: v as Settings['editorWidth'] })}
              options={[
                { label: 'Narrow (520px)', value: 'narrow' },
                { label: 'Medium (700px)', value: 'medium' },
                { label: 'Wide (960px)', value: 'wide' },
                { label: 'Full width', value: 'full' },
              ]}
            />
          </Row>
          <Row label="Sidebar Width">
            <Slider val={settings.sidebarWidth} min={180} max={400} step={10} onChange={v => onSettingsChange({ sidebarWidth: v })} format={v => `${v}px`} />
          </Row>

          {/* Editor */}
          <Section label="Editor" />
          <Row label="Word Wrap">
            <Toggle val={settings.wordWrap} onChange={v => onSettingsChange({ wordWrap: v })} />
          </Row>
          <Row label="Line Numbers">
            <Toggle val={settings.showLineNumbers} onChange={v => onSettingsChange({ showLineNumbers: v })} />
          </Row>
          <Row label="Highlight Current Line">
            <Toggle val={settings.highlightCurrentLine} onChange={v => onSettingsChange({ highlightCurrentLine: v })} />
          </Row>
          <Row label="Cursor Style">
            <Select
              val={settings.cursorStyle}
              onChange={v => onSettingsChange({ cursorStyle: v as Settings['cursorStyle'] })}
              options={[
                { label: 'Bar (|)', value: 'bar' },
                { label: 'Block (█)', value: 'block' },
                { label: 'Underline (_)', value: 'underline' },
              ]}
            />
          </Row>
          <Row label="Spell Check">
            <Toggle val={settings.spellCheck} onChange={v => onSettingsChange({ spellCheck: v })} />
          </Row>
          <Row label="Focus Mode" hint="Hides sidebar">
            <Toggle val={settings.focusMode} onChange={v => onSettingsChange({ focusMode: v })} />
          </Row>

          {/* UI */}
          <Section label="Interface" />
          <Row label="Status Bar">
            <Toggle val={settings.showStatusBar} onChange={v => onSettingsChange({ showStatusBar: v })} />
          </Row>
          <Row label="Sidebar">
            <Toggle val={settings.showSidebar} onChange={v => onSettingsChange({ showSidebar: v })} />
          </Row>
          <Row label="Autosave" hint="Saves on every keystroke">
            <Toggle val={settings.autosave} onChange={v => onSettingsChange({ autosave: v })} />
          </Row>

          {/* Shortcuts */}
          <Section label="Keyboard Shortcuts" />
          <div style={{ fontSize: 11, color: theme.textMuted, lineHeight: 1.9 }}>
            {[
              ['Ctrl+N', 'New note'],
              ['Ctrl+F', 'Find & Replace'],
              ['Ctrl+,', 'Settings'],
              ['Ctrl+D', 'Duplicate note'],
              ['Ctrl+\\', 'Toggle sidebar'],
              ['Ctrl+S', 'Save (auto)'],
              ['Tab', 'Indent'],
              ['Shift+Tab', 'Unindent'],
            ].map(([key, desc]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: `1px solid ${theme.border}` }}>
                <span style={{ color: theme.text, fontFamily: 'monospace', background: theme.hover, padding: '0 5px', borderRadius: 3 }}>{key}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
