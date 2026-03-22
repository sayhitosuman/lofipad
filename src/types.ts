export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  drawingData?: string;
  pinned: boolean;
  tags?: string[];
}

export interface FileEntry {
  name: string;
  path: string;
  content?: string; // only for files
  children?: FileEntry[]; // only for folders
  isFolder: boolean;
  expanded?: boolean;
}

export type ThemeName =
  | 'lofi-dark'
  | 'lofi-light'
  | 'midnight'
  | 'forest'
  | 'ocean'
  | 'sunset'
  | 'paper'
  | 'nord'
  | 'dracula'
  | 'rose'
  | 'solarized'
  | 'monokai';

export interface Theme {
  name: ThemeName;
  label: string;
  emoji: string;
  bg: string;
  sidebar: string;
  toolbar: string;
  editor: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  accent: string;
  accentText: string;
  hover: string;
  active: string;
  statusBar: string;
  scrollbar: string;
  shadow: string;
  lineNum: string;
  selectionBg: string;
  indentGuide: string;
  indentGuideActive: string;
  currentLineBg: string;
}

export interface Settings {
  theme: ThemeName;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  tabSize: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
  showStatusBar: boolean;
  showSidebar: boolean;
  spellCheck: boolean;
  autosave: boolean;
  focusMode: boolean;
  letterSpacing: number;
  editorWidth: 'narrow' | 'medium' | 'wide' | 'full';
  highlightCurrentLine: boolean;
  showIndentGuides: boolean;
  cursorStyle: 'bar' | 'block' | 'underline';
  sidebarWidth: number;
  paragraphSpacing: number;
  showMinimap: boolean;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textAlign: 'left' | 'center' | 'right';
}

export const FONTS: { label: string; value: string; mono: boolean }[] = [
  { label: 'Inter', value: 'Inter, sans-serif', mono: false },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif", mono: false },
  { label: 'DM Sans', value: "'DM Sans', sans-serif", mono: false },
  { label: 'Lora', value: "'Lora', serif", mono: false },
  { label: 'Playfair Display', value: "'Playfair Display', serif", mono: false },
  { label: 'Merriweather', value: "'Merriweather', serif", mono: false },
  { label: 'Crimson Text', value: "'Crimson Text', serif", mono: false },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace", mono: true },
  { label: 'IBM Plex Mono', value: "'IBM Plex Mono', monospace", mono: true },
  { label: 'Inconsolata', value: "'Inconsolata', monospace", mono: true },
  { label: 'Fira Code', value: "'Fira Code', monospace", mono: true },
  { label: 'Source Serif 4', value: "'Source Serif 4', serif", mono: false },
];

export const THEMES: Theme[] = [
  {
    name: 'lofi-dark',
    label: 'Lofi Dark',
    emoji: '🎵',
    bg: '#1a1a2e',
    sidebar: '#16213e',
    toolbar: '#0f3460',
    editor: '#1a1a2e',
    text: '#e0e0e0',
    textMuted: '#a0a0b8',
    textFaint: '#5a5a7a',
    border: '#2a2a4a',
    accent: '#e94560',
    accentText: '#fff',
    hover: '#2a2a4a',
    active: '#3a2a4a',
    statusBar: '#0f3460',
    scrollbar: '#3a3a5a',
    shadow: '0 8px 32px rgba(0,0,0,0.5)',
    lineNum: '#4a4a6a',
    selectionBg: '#e9456030',
    indentGuide: '#2a2a4a',
    indentGuideActive: '#e9456050',
    currentLineBg: '#ffffff06',
  },
  {
    name: 'lofi-light',
    label: 'Lofi Light',
    emoji: '☀️',
    bg: '#f5f0eb',
    sidebar: '#ede8e2',
    toolbar: '#ddd8d0',
    editor: '#f5f0eb',
    text: '#2c2c2c',
    textMuted: '#6b6560',
    textFaint: '#aaa5a0',
    border: '#d5d0ca',
    accent: '#c0392b',
    accentText: '#fff',
    hover: '#e5e0da',
    active: '#d8d0c8',
    statusBar: '#ddd8d0',
    scrollbar: '#c5c0ba',
    shadow: '0 8px 32px rgba(0,0,0,0.12)',
    lineNum: '#b0aba5',
    selectionBg: '#c0392b20',
    indentGuide: '#d5d0ca',
    indentGuideActive: '#c0392b40',
    currentLineBg: '#00000005',
  },
  {
    name: 'midnight',
    label: 'Midnight',
    emoji: '🌙',
    bg: '#0d0d0d',
    sidebar: '#111111',
    toolbar: '#161616',
    editor: '#0d0d0d',
    text: '#d4d4d4',
    textMuted: '#888888',
    textFaint: '#444444',
    border: '#222222',
    accent: '#7c6af7',
    accentText: '#fff',
    hover: '#1e1e1e',
    active: '#2a2a2a',
    statusBar: '#161616',
    scrollbar: '#333333',
    shadow: '0 8px 32px rgba(0,0,0,0.7)',
    lineNum: '#404040',
    selectionBg: '#7c6af730',
    indentGuide: '#252525',
    indentGuideActive: '#7c6af760',
    currentLineBg: '#ffffff04',
  },
  {
    name: 'forest',
    label: 'Forest',
    emoji: '🌿',
    bg: '#1a2318',
    sidebar: '#1e2a1b',
    toolbar: '#243021',
    editor: '#1a2318',
    text: '#d4e8c2',
    textMuted: '#8aaa78',
    textFaint: '#4a6a3a',
    border: '#2a3a28',
    accent: '#5dba40',
    accentText: '#fff',
    hover: '#243020',
    active: '#2e3a2c',
    statusBar: '#243021',
    scrollbar: '#3a5038',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
    lineNum: '#4a6a48',
    selectionBg: '#5dba4030',
    indentGuide: '#2a3a28',
    indentGuideActive: '#5dba4060',
    currentLineBg: '#ffffff05',
  },
  {
    name: 'ocean',
    label: 'Ocean',
    emoji: '🌊',
    bg: '#0a1628',
    sidebar: '#0d1e36',
    toolbar: '#112444',
    editor: '#0a1628',
    text: '#cce8ff',
    textMuted: '#7aaed4',
    textFaint: '#3a6a94',
    border: '#1a2e4a',
    accent: '#00b4d8',
    accentText: '#fff',
    hover: '#142040',
    active: '#1e2a50',
    statusBar: '#112444',
    scrollbar: '#2a4a6a',
    shadow: '0 8px 32px rgba(0,0,0,0.5)',
    lineNum: '#3a5a7a',
    selectionBg: '#00b4d830',
    indentGuide: '#1a2e4a',
    indentGuideActive: '#00b4d860',
    currentLineBg: '#ffffff05',
  },
  {
    name: 'sunset',
    label: 'Sunset',
    emoji: '🌅',
    bg: '#1e1010',
    sidebar: '#251515',
    toolbar: '#2e1c1c',
    editor: '#1e1010',
    text: '#f4d0b0',
    textMuted: '#c49070',
    textFaint: '#7a5040',
    border: '#3a2020',
    accent: '#ff6b35',
    accentText: '#fff',
    hover: '#2e1818',
    active: '#3a2020',
    statusBar: '#2e1c1c',
    scrollbar: '#5a3030',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
    lineNum: '#6a4040',
    selectionBg: '#ff6b3530',
    indentGuide: '#3a2020',
    indentGuideActive: '#ff6b3560',
    currentLineBg: '#ffffff05',
  },
  {
    name: 'paper',
    label: 'Paper',
    emoji: '📄',
    bg: '#faf8f3',
    sidebar: '#f2efea',
    toolbar: '#eae7e0',
    editor: '#faf8f3',
    text: '#1a1a1a',
    textMuted: '#555555',
    textFaint: '#aaaaaa',
    border: '#dedbd5',
    accent: '#2563eb',
    accentText: '#fff',
    hover: '#eeebe5',
    active: '#e4e1da',
    statusBar: '#eae7e0',
    scrollbar: '#ccc9c2',
    shadow: '0 8px 32px rgba(0,0,0,0.08)',
    lineNum: '#c0bdb8',
    selectionBg: '#2563eb20',
    indentGuide: '#dedbd5',
    indentGuideActive: '#2563eb40',
    currentLineBg: '#00000004',
  },
  {
    name: 'nord',
    label: 'Nord',
    emoji: '❄️',
    bg: '#2e3440',
    sidebar: '#272c36',
    toolbar: '#232830',
    editor: '#2e3440',
    text: '#eceff4',
    textMuted: '#9aa0b0',
    textFaint: '#5a6070',
    border: '#3b4252',
    accent: '#88c0d0',
    accentText: '#2e3440',
    hover: '#3b4252',
    active: '#434c5e',
    statusBar: '#232830',
    scrollbar: '#4c566a',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
    lineNum: '#4c566a',
    selectionBg: '#88c0d030',
    indentGuide: '#3b4252',
    indentGuideActive: '#88c0d060',
    currentLineBg: '#ffffff05',
  },
  {
    name: 'dracula',
    label: 'Dracula',
    emoji: '🧛',
    bg: '#282a36',
    sidebar: '#21222c',
    toolbar: '#191a21',
    editor: '#282a36',
    text: '#f8f8f2',
    textMuted: '#bd93f9',
    textFaint: '#6272a4',
    border: '#3d3f4f',
    accent: '#ff79c6',
    accentText: '#282a36',
    hover: '#3d3f4f',
    active: '#454661',
    statusBar: '#191a21',
    scrollbar: '#44475a',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
    lineNum: '#6272a4',
    selectionBg: '#ff79c630',
    indentGuide: '#3d3f4f',
    indentGuideActive: '#ff79c660',
    currentLineBg: '#ffffff05',
  },
  {
    name: 'rose',
    label: 'Rose Pine',
    emoji: '🌹',
    bg: '#191724',
    sidebar: '#1f1d2e',
    toolbar: '#26233a',
    editor: '#191724',
    text: '#e0def4',
    textMuted: '#908caa',
    textFaint: '#524f67',
    border: '#2a2742',
    accent: '#ebbcba',
    accentText: '#191724',
    hover: '#26233a',
    active: '#312e45',
    statusBar: '#26233a',
    scrollbar: '#3a3750',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
    lineNum: '#524f67',
    selectionBg: '#ebbcba30',
    indentGuide: '#2a2742',
    indentGuideActive: '#ebbcba50',
    currentLineBg: '#ffffff05',
  },
  {
    name: 'solarized',
    label: 'Solarized',
    emoji: '🌞',
    bg: '#002b36',
    sidebar: '#073642',
    toolbar: '#073642',
    editor: '#002b36',
    text: '#839496',
    textMuted: '#657b83',
    textFaint: '#586e75',
    border: '#073642',
    accent: '#268bd2',
    accentText: '#fdf6e3',
    hover: '#073642',
    active: '#0a4555',
    statusBar: '#073642',
    scrollbar: '#094050',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
    lineNum: '#405060',
    selectionBg: '#268bd230',
    indentGuide: '#073642',
    indentGuideActive: '#268bd260',
    currentLineBg: '#ffffff04',
  },
  {
    name: 'monokai',
    label: 'Monokai',
    emoji: '🎨',
    bg: '#272822',
    sidebar: '#1e1f1a',
    toolbar: '#1e1f1a',
    editor: '#272822',
    text: '#f8f8f2',
    textMuted: '#cfcfc2',
    textFaint: '#75715e',
    border: '#3e3d32',
    accent: '#a6e22e',
    accentText: '#272822',
    hover: '#3e3d32',
    active: '#49483e',
    statusBar: '#1e1f1a',
    scrollbar: '#49483e',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
    lineNum: '#75715e',
    selectionBg: '#a6e22e30',
    indentGuide: '#3e3d32',
    indentGuideActive: '#a6e22e60',
    currentLineBg: '#ffffff04',
  },
];

export const DEFAULT_SETTINGS: Settings = {
  theme: 'lofi-dark',
  fontFamily: 'Inter, sans-serif',
  fontSize: 15,
  lineHeight: 1.7,
  tabSize: 2,
  wordWrap: true,
  showLineNumbers: true,
  showStatusBar: true,
  showSidebar: true,
  spellCheck: false,
  autosave: true,
  focusMode: false,
  letterSpacing: 0,
  editorWidth: 'wide',
  highlightCurrentLine: true,
  showIndentGuides: true,
  cursorStyle: 'bar',
  sidebarWidth: 260,
  paragraphSpacing: 0,
  showMinimap: false,
  textTransform: 'none',
  fontWeight: 400,
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'left',
};
