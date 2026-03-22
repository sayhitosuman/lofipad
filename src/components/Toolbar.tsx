import { useState, useRef, useEffect } from 'react';
import { Theme, Settings, FONTS } from '../types';
import {
  Minus, Plus, WrapText, Download, Upload,
  Maximize2, Minimize2, Hash, Settings as SettingsIcon,
  ChevronDown, Type, Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Copy, Scissors, ClipboardPaste, Strikethrough,
  RotateCcw, RotateCw, CaseSensitive,
  Heading, Link, Link2Off, List, ListOrdered,
  Eraser, Image as ImageIcon,
} from 'lucide-react';

interface Props {
  theme: Theme;
  settings: Settings;
  onSettingsChange: (s: Partial<Settings>) => void;
  onExport: () => void;
  onImport: () => void;
  onToggleFocus: () => void;
  noteTitle: string;
  onTitleChange: (t: string) => void;
  onOpenSettings: () => void;
  onNewNote: () => void;
  isReadOnly?: boolean;
}

export default function Toolbar({
  theme, settings, onSettingsChange,
  onExport, onImport, onToggleFocus, noteTitle, onTitleChange, onOpenSettings, isReadOnly,
}: Props) {
  const [showFonts, setShowFonts] = useState(false);
  const [showSizeInput, setShowSizeInput] = useState(false);
  const [sizeInputVal, setSizeInputVal] = useState(String(settings.fontSize));
  
  const [showSelSizeInput, setShowSelSizeInput] = useState(false);
  const [selSizeInputVal, setSelSizeInputVal] = useState('16');
  
  const [showTextCaseMenu, setShowTextCaseMenu] = useState(false);
  const [showHeadings, setShowHeadings] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [textColor, setTextColor] = useState(theme.text);
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const selSizeInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    fontSize: '3',
    fontName: settings.fontFamily,
    isLink: false,
    bulletList: false,
    orderedList: false,
  });

  useEffect(() => {
    setSizeInputVal(String(settings.fontSize));
  }, [settings.fontSize]);

  useEffect(() => {
    if (showSizeInput && sizeInputRef.current) sizeInputRef.current.focus();
  }, [showSizeInput]);

  useEffect(() => {
    if (showSelSizeInput && selSizeInputRef.current) selSizeInputRef.current.focus();
  }, [showSelSizeInput]);

  useEffect(() => {
    const handleSelection = () => {
      let block = document.queryCommandValue('formatBlock') || 'p';
      if (block.toLowerCase() === 'div') block = 'p'; 
      
      let currentFont = document.queryCommandValue('fontName') || settings.fontFamily;
      currentFont = currentFont.replace(/['"]/g, '');

      let isLink = false;
      let bulletList = document.queryCommandState('insertUnorderedList');
      let orderedList = document.queryCommandState('insertOrderedList');

      const sel = window.getSelection();
      let exactPx = '';
      if (sel && sel.rangeCount > 0) {
        let node = sel.getRangeAt(0).commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentElement as Node;
        if (node && node instanceof Element) {
          const isEditor = node.closest && node.closest('div[contenteditable="true"]');
          if (isEditor) {
            savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
            const computed = window.getComputedStyle(node).fontSize;
            if (computed && computed.endsWith('px')) {
              exactPx = parseInt(computed, 10).toString();
            }
            isLink = !!node.closest('a');
          }
        }
      }

      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        fontSize: document.queryCommandValue('fontSize') || String(settings.fontSize),
        fontName: currentFont,
        isLink,
        bulletList,
        orderedList,
      });
      
      let fs = document.queryCommandValue('fontSize');
      if (fs) {
        if (fs.endsWith('px')) fs = parseInt(fs, 10).toString();
        else if (fs === '1') fs = '10';
        else if (fs === '2') fs = '13';
        else if (fs === '3') fs = '16';
        else if (fs === '4') fs = '18';
        else if (fs === '5') fs = '24';
        else if (fs === '6') fs = '32';
        else if (fs === '7') fs = '48';
      }

      if (document.activeElement !== selSizeInputRef.current) {
        setSelSizeInputVal(exactPx || fs || String(settings.fontSize));
      }
    };
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, [settings.fontFamily, settings.fontSize]);

  const closeDropdowns = () => {
    setShowFonts(false);
    setShowTextCaseMenu(false);
    setShowHeadings(false);
    setShowLinkInput(false);
    setShowImageInput(false);
  };

  const execAction = (action: 'copy' | 'cut' | 'paste' | 'selectAll' | 'undo' | 'redo') => {
    const editor = document.querySelector('div[contenteditable="true"]') as HTMLElement;
    if (!editor) return;
    editor.focus();
    switch (action) {
      case 'copy': document.execCommand('copy'); break;
      case 'cut': document.execCommand('cut'); break;
      case 'paste':
        navigator.clipboard.readText().then(text => {
          document.execCommand('insertText', false, text);
        }).catch(() => {
          document.execCommand('paste');
        });
        break;
      case 'selectAll': document.execCommand('selectAll'); break;
      case 'undo': document.execCommand('undo'); break;
      case 'redo': document.execCommand('redo'); break;
    }
  };

  const applyFormat = (command: string, value?: string) => {
    const editor = document.querySelector('div[contenteditable="true"]') as HTMLElement;
    if (editor) editor.focus();
    try { document.execCommand('styleWithCSS', false, "true"); } catch(e) {}
    document.execCommand(command, false, value);
    setTimeout(() => {
      document.dispatchEvent(new Event('selectionchange'));
      if (editor) editor.dispatchEvent(new Event('input', { bubbles: true }));
    }, 10);
  };

  const applyInlineSize = (sizePx: number) => {
    const editor = document.querySelector('div[contenteditable="true"]') as HTMLElement;
    if (editor) editor.focus();
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
    try { document.execCommand('styleWithCSS', false, "false"); } catch(e) {}
    document.execCommand('fontSize', false, "7");
    const fonts = editor.querySelectorAll('font[size="7"]');
    fonts.forEach((f: any) => {
      f.removeAttribute('size');
      f.style.fontSize = `${sizePx}px`;
    });
    try { document.execCommand('styleWithCSS', false, "true"); } catch(e) {}
    setTimeout(() => {
      document.dispatchEvent(new Event('selectionchange'));
      if (editor) editor.dispatchEvent(new Event('input', { bubbles: true }));
    }, 10);
  };

  const applyInlineHeading = (headingPreset: number) => {
    if (headingPreset === 0) {
      applyInlineSize(settings.fontSize); 
      if (document.queryCommandState('bold')) { applyFormat('bold'); }
    } else {
      applyInlineSize(headingPreset);
      if (!document.queryCommandState('bold')) { applyFormat('bold'); }
    }
  };

  const commitFontSize = () => {
    const v = parseInt(sizeInputVal, 10);
    if (!isNaN(v) && v >= 8 && v <= 72) {
      onSettingsChange({ fontSize: v });
    } else {
      setSizeInputVal(String(settings.fontSize));
    }
    setShowSizeInput(false);
  };

  const commitSelFontSize = () => {
    const v = parseInt(selSizeInputVal, 10);
    if (!isNaN(v) && v >= 8 && v <= 128) {
      applyInlineSize(v);
    } else {
      document.dispatchEvent(new Event('selectionchange'));
    }
    setShowSelSizeInput(false);
  };

  const changeFont = (fontFamily: string) => {
    applyFormat('fontName', fontFamily);
    setShowFonts(false);
  };

  const addLink = () => {
    if (!linkUrl) return;
    let url = linkUrl;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
    }
    applyFormat('createLink', url);
    setLinkUrl('');
    setShowLinkInput(false);
  };

  const addImage = () => {
    if (!imageUrl) return;
    applyFormat('insertImage', imageUrl);
    setImageUrl('');
    setShowImageInput(false);
  };

  const Btn = ({
    children, onClick, active = false, title = '', disabled = false,
  }: {
    children: React.ReactNode; onClick: () => void; active?: boolean; title?: string; disabled?: boolean;
  }) => (
    <button
      title={title}
      disabled={disabled}
      onMouseDown={e => { e.preventDefault(); }}
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 5, minWidth: 28, height: 26,
        background: active ? theme.accent : theme.hover,
        color: active ? theme.accentText : theme.textMuted,
        border: `1px solid ${active ? theme.accent : theme.border}`,
        cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0, fontSize: 11, fontWeight: 600,
        padding: '0 6px', gap: 4, whiteSpace: 'nowrap',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.15s, color 0.15s',
        position: 'relative'
      }}
    >
      {children}
    </button>
  );

  const Sep = () => (
    <div style={{ width: 1, height: 18, background: theme.border, flexShrink: 0, margin: '0 2px' }} />
  );

  const alignOptions = [
    { val: 'justifyLeft' as const, icon: <AlignLeft size={13} />, label: 'Left', prop: 'justifyLeft' as const },
    { val: 'justifyCenter' as const, icon: <AlignCenter size={13} />, label: 'Center', prop: 'justifyCenter' as const },
    { val: 'justifyRight' as const, icon: <AlignRight size={13} />, label: 'Right', prop: 'justifyRight' as const },
  ];

  const headingsOptions = [
    { label: 'Normal Text', val: 0 },
    { label: 'Heading 1', val: 32 },
    { label: 'Heading 2', val: 24 },
    { label: 'Heading 3', val: 18 },
  ];

  return (
    <div
      style={{ background: theme.toolbar, borderBottom: `1px solid ${theme.border}`, flexShrink: 0, userSelect: 'none' }}
      onClick={closeDropdowns}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '0 10px', height: 40,
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <input
          type="text"
          value={noteTitle}
          onChange={e => onTitleChange(e.target.value)}
          onClick={e => e.stopPropagation()}
          readOnly={isReadOnly}
          placeholder="Untitled"
          style={{
            background: 'transparent', outline: 'none', border: 'none',
            color: theme.text, fontWeight: 700, fontSize: 14,
            flex: 1, minWidth: 0, caretColor: theme.accent,
            fontFamily: 'inherit',
          }}
        />
        {isReadOnly && (
          <span style={{
            padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
            background: theme.hover, color: theme.accent, border: `1px solid ${theme.accent}`,
            flexShrink: 0,
          }}>
            READ-ONLY
          </span>
        )}
        <Sep />
        <Btn onClick={onImport} title="Import file as note"><Upload size={13} /></Btn>
        <Btn onClick={onExport} title="Export as .txt"><Download size={13} /></Btn>
        <Sep />
        <Btn onClick={onToggleFocus} active={settings.focusMode} title="Focus mode">
          {settings.focusMode ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
        </Btn>
        <Btn onClick={onOpenSettings} title="Settings (Ctrl+,)"><SettingsIcon size={13} /></Btn>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '0 10px', height: 'auto', minHeight: 36, flexWrap: 'wrap',
        paddingBottom: 4, paddingTop: 4
      }}>
        <Btn onClick={() => execAction('undo')} title="Undo (Ctrl+Z)"><RotateCcw size={13} /></Btn>
        <Btn onClick={() => execAction('redo')} title="Redo (Ctrl+Y)"><RotateCw size={13} /></Btn>
        <Sep />
        <Btn onClick={() => execAction('cut')} title="Cut (Ctrl+X)"><Scissors size={13} /></Btn>
        <Btn onClick={() => execAction('copy')} title="Copy (Ctrl+C)"><Copy size={13} /></Btn>
        <Btn onClick={() => execAction('paste')} title="Paste (Ctrl+V)"><ClipboardPaste size={13} /></Btn>
        <Sep />
        <div style={{ position: 'relative' }}>
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={e => { e.stopPropagation(); closeDropdowns(); setShowHeadings(h => !h); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'space-between',
              height: 26, width: 105, padding: '0 8px', borderRadius: 5,
              background: theme.hover, color: theme.textMuted,
              border: `1px solid ${theme.border}`, cursor: 'pointer',
              fontSize: 11, flexShrink: 0,
            }}
          >
            <Heading size={11} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
              Headings
            </span>
            <ChevronDown size={10} style={{ flexShrink: 0 }} />
          </button>
          {showHeadings && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: theme.toolbar, border: `1px solid ${theme.border}`,
              borderRadius: 8, boxShadow: theme.shadow,
              padding: 4, zIndex: 9999, minWidth: 140,
            }} onClick={e => e.stopPropagation()}>
              {headingsOptions.map(h => (
                <button key={h.val} onMouseDown={e => e.preventDefault()} onClick={() => { applyInlineHeading(h.val); setShowHeadings(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '6px 10px', background: 'none',
                    border: 'none', cursor: 'pointer', color: theme.text,
                    fontSize: 12, borderRadius: 5, textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = theme.hover; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  {h.val !== 0 ? <strong style={{ fontSize: h.val === 32?16:h.val===24?14:13 }}>{h.label}</strong> : <span>{h.label}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <Sep />
        <Btn onClick={() => applyInlineSize(Math.max(8, parseInt(selSizeInputVal,10) - 1))} title="Decrease Selection Size"><Minus size={11} /></Btn>
        {showSelSizeInput ? (
          <input
            ref={selSizeInputRef}
            value={selSizeInputVal}
            onChange={e => setSelSizeInputVal(e.target.value)}
            onBlur={commitSelFontSize}
            onKeyDown={e => { if (e.key === 'Enter') commitSelFontSize(); if (e.key === 'Escape') { setShowSelSizeInput(false); document.dispatchEvent(new Event('selectionchange')); } }}
            onClick={e => e.stopPropagation()}
            style={{
              width: 36, height: 24, textAlign: 'center', fontSize: 11, fontWeight: 600,
              background: theme.hover, color: theme.text, border: `1px solid ${theme.accent}`,
              borderRadius: 4, outline: 'none', padding: 0,
            }}
          />
        ) : (
          <span
            onClick={e => { e.stopPropagation(); setShowSelSizeInput(true); }}
            title="Click to type Selection Size (8–128)"
            style={{
              fontSize: 11, color: theme.textMuted, minWidth: 30, textAlign: 'center',
              flexShrink: 0, cursor: 'pointer', padding: '2px 4px', borderRadius: 4,
              background: theme.hover, border: `1px solid ${theme.border}`, fontWeight: 600,
              lineHeight: '22px',
            }}
          >
            {selSizeInputVal}
          </span>
        )}
        <Btn onClick={() => applyInlineSize(Math.min(128, parseInt(selSizeInputVal,10) + 1))} title="Increase Selection Size"><Plus size={11} /></Btn>
        <Sep />
        <div style={{ position: 'relative' }}>
          <button
            onMouseDown={e => e.preventDefault()}
            onClick={e => { e.stopPropagation(); closeDropdowns(); setShowFonts(f => !f); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'space-between',
              height: 26, width: 115, padding: '0 8px', borderRadius: 5,
              background: theme.hover, color: theme.textMuted,
              border: `1px solid ${theme.border}`, cursor: 'pointer',
              fontSize: 11, flexShrink: 0,
            }}
          >
            <Type size={11} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
              {FONTS.find(f => f.value.replace(/['"]/g, '') === activeFormats.fontName || activeFormats.fontName.includes(f.value.split(',')[0].replace(/['"]/g, '')))?.label || 'Font'}
            </span>
            <ChevronDown size={10} style={{ flexShrink: 0 }} />
          </button>
          {showFonts && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: theme.toolbar, border: `1px solid ${theme.border}`,
              borderRadius: 8, boxShadow: theme.shadow,
              padding: 4, zIndex: 9999, minWidth: 180,
              maxHeight: 260, overflowY: 'auto',
            }} onClick={e => e.stopPropagation()}>
              {FONTS.map(f => {
                const isMatch = f.value.replace(/['"]/g, '') === activeFormats.fontName || activeFormats.fontName.includes(f.value.split(',')[0].replace(/['"]/g, ''));
                return (
                  <button key={f.value} onMouseDown={e => e.preventDefault()} onClick={() => changeFont(f.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '6px 10px', background: isMatch ? theme.active : 'none',
                      border: 'none', cursor: 'pointer', color: isMatch ? theme.accent : theme.text,
                      fontSize: 12, borderRadius: 5, textAlign: 'left', fontFamily: f.value,
                    }}
                    onMouseEnter={e => { if (!isMatch) e.currentTarget.style.background = theme.hover; }}
                    onMouseLeave={e => { if (!isMatch) e.currentTarget.style.background = 'none'; }}
                  >
                    {f.label}
                    {f.mono && <span style={{ fontSize: 9, color: theme.textFaint, marginLeft: 'auto' }}>mono</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <Sep />
        <label
          title="Text Color"
          onMouseDown={e => e.preventDefault()}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 5, minWidth: 28, height: 26,
            background: theme.hover, color: theme.textMuted,
            border: `1px solid ${theme.border}`, cursor: 'pointer',
            padding: '0 6px', position: 'relative'
          }}
        >
          <div style={{
            width: 14, height: 14, borderRadius: 3, background: textColor || theme.text,
            border: '1px solid rgba(0,0,0,0.3)', pointerEvents: 'none'
          }} />
          <input
            type="color"
            value={textColor !== theme.text ? textColor : "#000000"}
            onChange={e => {
              setTextColor(e.target.value);
              applyFormat('foreColor', e.target.value);
            }}
            style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
          />
        </label>
        <Sep />
        <Btn onClick={() => applyFormat('bold')} active={activeFormats.bold} title="Bold selected text"><Bold size={13} /></Btn>
        <Btn onClick={() => applyFormat('italic')} active={activeFormats.italic} title="Italic selected text"><Italic size={13} /></Btn>
        <Btn onClick={() => applyFormat('underline')} active={activeFormats.underline} title="Underline selected text"><Underline size={13} /></Btn>
        <Btn onClick={() => applyFormat('strikeThrough')} active={activeFormats.strikeThrough} title="Strikethrough selected text"><Strikethrough size={13} /></Btn>
        <Sep />
        <div style={{ position: 'relative' }}>
          <Btn onClick={() => { closeDropdowns(); setShowTextCaseMenu(m => !m); }} title="Text case">
            <CaseSensitive size={13} />
            <ChevronDown size={9} />
          </Btn>
          {showTextCaseMenu && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: theme.toolbar, border: `1px solid ${theme.border}`,
              borderRadius: 8, boxShadow: theme.shadow,
              padding: 4, zIndex: 9999, minWidth: 140,
            }} onClick={e => e.stopPropagation()}>
              {([
                { label: 'Normal', value: 'none' as const },
                { label: 'UPPERCASE', value: 'uppercase' as const },
                { label: 'lowercase', value: 'lowercase' as const },
                { label: 'Capitalize', value: 'capitalize' as const },
              ]).map(opt => (
                <button
                  key={opt.value}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => { onSettingsChange({ textTransform: opt.value }); setShowTextCaseMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    width: '100%', padding: '6px 10px',
                    background: settings.textTransform === opt.value ? theme.active : 'none',
                    border: 'none', cursor: 'pointer',
                    color: settings.textTransform === opt.value ? theme.accent : theme.text,
                    fontSize: 12, borderRadius: 5, textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (settings.textTransform !== opt.value) e.currentTarget.style.background = theme.hover; }}
                  onMouseLeave={e => { if (settings.textTransform !== opt.value) e.currentTarget.style.background = 'none'; }}
                >
                  {settings.textTransform === opt.value && '✓ '}{opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <Sep />
        <div style={{ position: 'relative' }}>
          <Btn active={activeFormats.isLink} onClick={() => { 
            if (activeFormats.isLink) {
              applyFormat('unlink');
            } else {
              closeDropdowns(); 
              setShowLinkInput(true); 
            }
          }} title={activeFormats.isLink ? "Remove Link" : "Add Hyperlink"}>
            {activeFormats.isLink ? <Link2Off size={13} /> : <Link size={13} />}
          </Btn>
          {showLinkInput && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: theme.toolbar, border: `1px solid ${theme.border}`,
              borderRadius: 8, boxShadow: theme.shadow,
              padding: 8, zIndex: 9999, minWidth: 220,
              display: 'flex', gap: 6
            }} onClick={e => e.stopPropagation()}>
              <input
                autoFocus
                placeholder="https://example.com"
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addLink(); if (e.key === 'Escape') setShowLinkInput(false); }}
                style={{
                  flex: 1, height: 26, padding: '0 8px', borderRadius: 4,
                  background: theme.hover, color: theme.text, border: `1px solid ${theme.border}`,
                  fontSize: 12, outline: 'none'
                }}
              />
              <Btn onClick={addLink} active title="Apply Link">Add</Btn>
            </div>
          )}
        </div>
        <Sep />
        <Btn onClick={() => applyFormat('insertUnorderedList')} active={activeFormats.bulletList} title="Bullet List"><List size={13} /></Btn>
        <Btn onClick={() => applyFormat('insertOrderedList')} active={activeFormats.orderedList} title="Numbered List"><ListOrdered size={13} /></Btn>
        <Sep />
        <Btn onClick={() => applyFormat('removeFormat')} title="Clear Formatting"><Eraser size={13} /></Btn>
        <div style={{ position: 'relative' }}>
          <Btn onClick={() => { closeDropdowns(); setShowImageInput(true); }} title="Insert Image from URL">
            <ImageIcon size={13} />
          </Btn>
          {showImageInput && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: theme.toolbar, border: `1px solid ${theme.border}`,
              borderRadius: 8, boxShadow: theme.shadow,
              padding: 8, zIndex: 9999, minWidth: 220,
              display: 'flex', gap: 6
            }} onClick={e => e.stopPropagation()}>
              <input
                autoFocus
                placeholder="https://example.com/image.png"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addImage(); if (e.key === 'Escape') setShowImageInput(false); }}
                style={{
                  flex: 1, height: 26, padding: '0 8px', borderRadius: 4,
                  background: theme.hover, color: theme.text, border: `1px solid ${theme.border}`,
                  fontSize: 12, outline: 'none'
                }}
              />
              <Btn onClick={addImage} active title="Insert">Add</Btn>
            </div>
          )}
        </div>
        <Sep />
        {alignOptions.map(a => (
          <Btn key={a.val} onClick={() => applyFormat(a.val)} active={activeFormats[a.prop]} title={`Align ${a.label}`}>{a.icon}</Btn>
        ))}
        <Sep />
        <span style={{ fontSize: 11, color: theme.textFaint, flexShrink: 0 }}>Global:</span>
        <Btn onClick={() => onSettingsChange({ fontSize: Math.max(8, settings.fontSize - 1) })} title="Decrease global font size"><Minus size={11} /></Btn>
        {showSizeInput ? (
          <input
            ref={sizeInputRef}
            value={sizeInputVal}
            onChange={e => setSizeInputVal(e.target.value)}
            onBlur={commitFontSize}
            onKeyDown={e => { if (e.key === 'Enter') commitFontSize(); if (e.key === 'Escape') { setSizeInputVal(String(settings.fontSize)); setShowSizeInput(false); } }}
            onClick={e => e.stopPropagation()}
            style={{
              width: 36, height: 24, textAlign: 'center', fontSize: 11, fontWeight: 600,
              background: theme.hover, color: theme.text, border: `1px solid ${theme.accent}`,
              borderRadius: 4, outline: 'none', padding: 0,
            }}
          />
        ) : (
          <span
            onClick={e => { e.stopPropagation(); setShowSizeInput(true); }}
            title="Click to type font size (8–72)"
            style={{
              fontSize: 11, color: theme.textMuted, minWidth: 30, textAlign: 'center',
              flexShrink: 0, cursor: 'pointer', padding: '2px 4px', borderRadius: 4,
              background: theme.hover, border: `1px solid ${theme.border}`, fontWeight: 600,
              lineHeight: '22px',
            }}
          >
            {settings.fontSize}
          </span>
        )}
        <Btn onClick={() => onSettingsChange({ fontSize: Math.min(72, settings.fontSize + 1) })} title="Increase global font size"><Plus size={11} /></Btn>
        <Sep />
        <Btn onClick={() => onSettingsChange({ wordWrap: !settings.wordWrap })} active={settings.wordWrap} title="Word wrap"><WrapText size={13} /></Btn>
        <Btn onClick={() => onSettingsChange({ showLineNumbers: !settings.showLineNumbers })} active={settings.showLineNumbers} title="Line numbers"><Hash size={13} /></Btn>
      </div>
    </div>
  );
}
