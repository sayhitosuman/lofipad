import { useRef, useEffect, useCallback, useState } from 'react';
import { Theme, Settings } from '../types';

interface Props {
  content: string;
  onChange: (v: string) => void;
  theme: Theme;
  settings: Settings;
  onCursorChange: (line: number, col: number) => void;
}

export default function Editor({ content, onChange, theme, settings, onCursorChange }: Props) {
  const textareaRef = useRef<HTMLDivElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const [currentLine, setCurrentLine] = useState(1);
  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (textareaRef.current && content !== textareaRef.current.innerHTML && !isInternalChange.current) {
      textareaRef.current.innerHTML = content || '';
    }
  }, [content]);

  // Sync scroll of line numbers with textarea and absolute overlay layers
  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (lineNumRef.current) lineNumRef.current.scrollTop = ta.scrollTop;
    setEditorScrollTop(ta.scrollTop);
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.addEventListener('scroll', syncScroll);
    return () => ta.removeEventListener('scroll', syncScroll);
  }, [syncScroll]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    isInternalChange.current = true;
    onChange(e.currentTarget.innerHTML);
    setTimeout(() => { isInternalChange.current = false; }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Check if we're inside a list for better Enter/Tab behavior
    const sel = window.getSelection();
    let isInList = false;
    if (sel && sel.rangeCount > 0) {
      const node = sel.getRangeAt(0).commonAncestorContainer;
      const element = node.nodeType === 3 ? node.parentElement : node as Element;
      if (element && (element as Element).closest('li')) {
        isInList = true;
      }
    }

    if (e.key === 'Enter') {
      if (isInList) return; // Let browser handle Enter in lists
      e.preventDefault();
      document.execCommand('insertText', false, '\n');
    }
    // simple tab handler for rich text
    if (e.key === 'Tab') {
      if (isInList) return; // Let browser handle Tab in lists (indent)
      e.preventDefault();
      document.execCommand('insertText', false, ' '.repeat(settings.tabSize));
    }
  };

  const updateCursor = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !textareaRef.current) return;
    const range = sel.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(textareaRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    
    // Calculate cursor line by matching newlines before the cursor 
    // Since we physically insert \n, toString() includes them!
    const beforeText = preSelectionRange.toString();
    const lineNum = (beforeText.match(/\n/g) || []).length + 1;
    const col = beforeText.length - beforeText.lastIndexOf('\n');
    
    setCurrentLine(lineNum);
    onCursorChange(lineNum, col);
  };

  // high performance line calculation using regex instead of slow DOM parser
  const getLineCount = (html: string) => {
    // Match actual newline characters AND block endings that create physical layouts
    const blocksOrNewlines = html.match(/\n|<\/p>|<\/div>|<\/h[1-6]>|<br\s*\/?>/gi);
    return (blocksOrNewlines ? blocksOrNewlines.length : 0) + 1;
  };
  
  const lineCount = getLineCount(content);
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  const fontSize = settings.fontSize;
  const lineHeightPx = settings.lineHeight * fontSize;

  const maxWidth = { narrow: '520px', medium: '700px', wide: '960px', full: '100%' }[settings.editorWidth];
  const lineNumChars = String(lineCount).length;
  const gutterWidth = Math.max(40, lineNumChars * 9 + 24);

  const PADDING_LEFT = 20;
  const PADDING_TOP = 12;




  // Render Editor component
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: theme.editor, position: 'relative' }}>
      {/* ── Line numbers gutter (VS Code style) ── */}
      {settings.showLineNumbers && (
        <div
          ref={lineNumRef}
          style={{
            width: gutterWidth,
            paddingTop: PADDING_TOP,
            background: theme.editor,
            borderRight: `1px solid ${theme.border}`,
            overflowY: 'hidden',
            flexShrink: 0,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: Math.max(10, fontSize - 1),
            color: theme.lineNum,
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          {lines.map((num) => (
            <div key={num} style={{
              paddingRight: 12,
              paddingLeft: 8,
              lineHeight: `${lineHeightPx}px`,
              height: lineHeightPx,
              color: num === currentLine ? theme.accent : theme.lineNum,
              fontWeight: num === currentLine ? 600 : 400,
              opacity: num === currentLine ? 1 : 0.5,
            }}>
              {num}
            </div>
          ))}
        </div>
      )}

      {/* ── Editor area ── */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', overflow: 'hidden', background: theme.editor, position: 'relative' }}>
        <div style={{ width: '100%', maxWidth, height: '100%', position: 'relative' }}>

          {/* ── Current line highlight ── */}
          {settings.highlightCurrentLine && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: PADDING_TOP + (currentLine - 1) * lineHeightPx - editorScrollTop,
                left: 0, right: 0,
                height: lineHeightPx,
                background: theme.currentLineBg,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />
          )}

          {/* ── ContentEditable ── */}
          <div
            ref={textareaRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onSelect={updateCursor}
            onClick={updateCursor}
            onKeyUp={updateCursor}
            spellCheck={settings.spellCheck}
            style={{
              fontFamily: settings.fontFamily,
              fontSize,
              lineHeight: settings.lineHeight,
              letterSpacing: 'normal',
              fontWeight: settings.fontWeight,
              fontStyle: settings.fontStyle ?? 'normal',
              textDecoration: settings.textDecoration ?? 'none',
              textAlign: (settings.textAlign ?? 'left') as React.CSSProperties['textAlign'],
              textTransform: settings.textTransform as React.CSSProperties['textTransform'],
              color: theme.text,
              caretColor: theme.accent,
              background: 'transparent',
              outline: 'none',
              border: 'none',
              width: '100%',
              height: '100%',
              whiteSpace: settings.wordWrap ? 'pre-wrap' : 'pre',
              overflowWrap: settings.wordWrap ? 'break-word' : 'normal',
              tabSize: settings.tabSize,
              padding: `${PADDING_TOP}px ${PADDING_LEFT}px`,
              overflowY: 'auto',
              overflowX: settings.wordWrap ? 'hidden' : 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: `${theme.scrollbar} transparent`,
              position: 'relative',
              zIndex: 2,
            }}
          />
        </div>
      </div>
    </div>
  );
}
