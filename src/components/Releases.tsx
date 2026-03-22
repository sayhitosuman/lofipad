import { useEffect, useState } from 'react';
import { Theme, Settings } from '../types';
import { ExternalLink, ShieldCheck, Download, AlertCircle, Info, ChevronRight, Github } from 'lucide-react';

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  assets: {
    name: string;
    browser_download_url: string;
    size: number;
  }[];
}

interface Props {
  theme: Theme;
  settings: Settings;
  onBack: () => void;
}

export default function Releases({ theme, settings, onBack }: Props) {
  const [release, setRelease] = useState<GitHubRelease | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.github.com/repos/sayhitosuman/lofipad/releases/latest')
      .then(res => res.json())
      .then(data => {
        if (data.assets) {
          setRelease(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const msiAsset = release?.assets.find(a => a.name.endsWith('.msi'));
  const exeAsset = release?.assets.find(a => a.name.endsWith('.exe') && !a.name.includes('setup'));

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      color: theme.text,
      fontFamily: settings.fontFamily,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 20px',
      overflowY: 'auto',
    }}>
      <div style={{ maxWidth: 800, width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 42, height: 42, borderRadius: 10, background: theme.accent, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px ${theme.accent}40`, color: theme.accentText
            }}>
              <span style={{ fontSize: 24, fontWeight: 800 }}>✦</span>
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>LofiPad Desktop</h1>
              <p style={{ margin: 0, color: theme.textMuted, fontSize: 13 }}>Built for focus, designed for speed.</p>
            </div>
          </div>
          <button onClick={onBack} style={{
            background: theme.hover, color: theme.text, border: `1px solid ${theme.border}`,
            padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s', fontWeight: 600
          }}>
            Back to Web Editor
          </button>
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gap: 24 }}>
          
          {/* Download Card */}
          <div style={{
            background: theme.sidebar, borderRadius: 20, padding: 40,
            border: `1px solid ${theme.border}`, boxShadow: theme.shadow,
            textAlign: 'center', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: theme.accent }}></div>
            
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Latest Stable Version</h2>
            {loading ? (
              <p style={{ color: theme.textMuted }}>Fetching latest release...</p>
            ) : release ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 30, color: theme.textFaint, fontSize: 14 }}>
                  <span>Tag: {release.tag_name}</span>
                  <span>•</span>
                  <span>Published: {new Date(release.published_at).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  {msiAsset && (
                    <a href={msiAsset.browser_download_url} style={{
                      background: theme.accent, color: theme.accentText,
                      padding: '16px 32px', borderRadius: 12, fontWeight: 700, fontSize: 18,
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10,
                      boxShadow: `0 10px 20px ${theme.accent}30`, transition: 'transform 0.2s'
                    }} 
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      <Download size={22} />
                      Download for Windows (.msi)
                      <span style={{ fontSize: 13, opacity: 0.8, fontWeight: 400 }}>{formatSize(msiAsset.size)}</span>
                    </a>
                  )}
                  <p style={{ fontSize: 13, color: theme.accent, fontWeight: 600, margin: 0 }}>
                    ⭐ Standard Installer (Recommended)
                  </p>

                  <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                    {exeAsset && (
                      <a href={exeAsset.browser_download_url} style={{
                        color: theme.textMuted, textDecoration: 'none', fontSize: 13,
                        padding: '6px 12px', borderRadius: 6, border: `1px solid ${theme.border}`,
                        display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = theme.hover}>
                        Download Portable (.exe) {formatSize(exeAsset.size)}
                      </a>
                    )}
                    <a href={release.html_url} target="_blank" rel="noreferrer" style={{
                      color: theme.textMuted, textDecoration: 'none', fontSize: 13,
                      padding: '6px 12px', borderRadius: 6, border: `1px solid ${theme.border}`,
                      display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = theme.hover}>
                      <Github size={14} /> View Source
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <p style={{ color: theme.textMuted }}>No releases found yet. Check back soon!</p>
            )}
          </div>

          {/* Security / Student Team Card */}
          <div style={{
            background: `${theme.accent}08`, borderRadius: 20, padding: 30,
            border: `1px solid ${theme.accent}20`, display: 'flex', gap: 20
          }}>
            <div style={{ color: theme.accent, flexShrink: 0 }}>
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: 18, fontWeight: 700 }}>Why is Windows warning me?</h3>
              <p style={{ margin: 0, fontSize: 14, color: theme.textMuted, lineHeight: 1.6 }}>
                LofiPad is an **Open Source** project built by a team of students. 🎓 
                Because we are an independent team and provide this for free, we cannot yet afford the $300/year Microsoft Security Certificate.
              </p>
              <div style={{ marginTop: 15, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: theme.accent, color: theme.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, marginTop: 2 }}>1</div>
                  <span style={{ fontSize: 14 }}>When prompted, click <strong style={{color: theme.text}}>More Info</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: theme.accent, color: theme.accentText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, marginTop: 2 }}>2</div>
                  <span style={{ fontSize: 14 }}>Select <strong style={{color: theme.text}}>Run Anyway</strong> to continue installation.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <ExternalLink size={14} color={theme.accent} />
                  <a href="https://github.com/sayhitosuman/lofipad" target="_blank" rel="noreferrer" style={{ fontSize: 13, color: theme.accent, textDecoration: 'none', fontWeight: 600 }}>
                    Verify the code yourself on GitHub →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { icon: <AlertCircle size={18} />, title: "Full Offline", desc: "No internet? No problem. All notes stay on your machine." },
              { icon: <ChevronRight size={18} />, title: "Ultra Light", desc: "Less than 10MB installer. No heavy background processes." },
              { icon: <Info size={18} />, title: "Privacy First", desc: "We ever track your data. Your notes are 100% yours." }
            ].map((f, i) => (
              <div key={i} style={{ padding: 24, borderRadius: 16, background: theme.hover, border: `1px solid ${theme.border}` }}>
                <div style={{ color: theme.accent, marginBottom: 12 }}>{f.icon}</div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700 }}>{f.title}</h4>
                <p style={{ margin: 0, fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 60, textAlign: 'center', color: theme.textFaint, fontSize: 12 }}>
          <p>© {new Date().getFullYear()} LofiPad Student Team • Open Source Software</p>
        </div>
      </div>
    </div>
  );
}
