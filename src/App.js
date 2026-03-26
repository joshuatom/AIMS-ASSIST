import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

// 1. Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite", 
  systemInstruction: {
    parts: [{ text: "You are MindBot, the official assistant for Mind Flayers University. You provide details on Admissions, Programmes, Facilities, and Placements with a professional yet slightly mysterious tone." }],
  },
});

// ─────────────────────────────────────────────
// TYPEWRITER COMPONENT
// ─────────────────────────────────────────────
const Typewriter = ({ text, speed = 10 }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText(""); 
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <ReactMarkdown className="markdown-content">{displayedText}</ReactMarkdown>;
};

// Helper for AI calls
const callAI = async (prompt, systemInstruction) => {
  try {
    const combinedPrompt = `${systemInstruction}\n\nUser Request: ${prompt}`;
    const result = await model.generateContent(combinedPrompt);
    return result.response.text();
  } catch (error) { return "❌ Error: High psionic interference. Check API Connection."; }
};

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    
    :root {
      --bg: #fdfbf7;
      --white: #ffffff;
      --sidebar-bg: #f4f7fa;
      --accent: #0ea5e9;
      --border: #e2e8f0;
      --text-main: #0f172a;
      --text-dim: #64748b;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text-main); font-family: 'Plus Jakarta Sans', sans-serif; height: 100vh; overflow: hidden; }
    .app-shell { display: flex; height: 100vh; padding: 10px; gap: 10px; }
    
    .sidebar { width: 280px; background: var(--sidebar-bg); border: 1px solid var(--border); border-radius: 20px; padding: 30px 15px; display: flex; flex-direction: column; }
    .sidebar-logo { font-size: 22px; font-weight: 800; padding: 0 15px 35px; color: var(--text-main); display: flex; align-items: center; gap: 10px; }
    .sidebar-logo span { color: var(--accent); }
    .logo-orb { width: 10px; height: 10px; background: var(--accent); border-radius: 50%; box-shadow: 0 0 8px var(--accent); }

    .nav-item { padding: 14px 18px; border-radius: 12px; cursor: pointer; color: var(--text-dim); transition: 0.2s; font-weight: 600; margin-bottom: 4px; border: 1px solid transparent; }
    .nav-item:hover { background: var(--white); color: var(--accent); }
    .nav-item.active { background: var(--white); color: var(--accent); border-color: var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.03); }

    .main-content { flex: 1; padding: 40px; overflow-y: auto; background: var(--white); border: 1px solid var(--border); border-radius: 20px; }
    .header-tag { font-family: 'JetBrains Mono'; font-size: 11px; color: var(--accent); letter-spacing: 2px; font-weight: 600; margin-bottom: 8px; }
    h1 { font-size: 44px; font-weight: 800; letter-spacing: -1.5px; margin-bottom: 30px; }

    .glass-card { background: var(--bg); border: 1px solid var(--border); border-radius: 20px; padding: 35px; }
    .btn-action { padding: 14px 28px; border-radius: 12px; border: none; font-weight: 700; cursor: pointer; background: var(--accent); color: white; transition: 0.2s; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3); }
    .btn-action:hover { opacity: 0.9; transform: translateY(-1px); }

    .chat-sidebar { width: 380px; background: var(--white); border: 1px solid var(--border); border-radius: 20px; display: flex; flex-direction: column; overflow: hidden; }
    .chat-header { padding: 20px; border-bottom: 1px solid var(--border); background: var(--sidebar-bg); display: flex; justify-content: space-between; align-items: center; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .msg { padding: 12px 16px; border-radius: 15px; font-size: 14px; max-width: 85%; line-height: 1.5; }
    .msg-bot { background: var(--sidebar-bg); color: var(--text-main); align-self: flex-start; border-bottom-left-radius: 2px; }
    .msg-user { background: var(--accent); color: white; align-self: flex-end; border-bottom-right-radius: 2px; }

    .chat-input-wrap { padding: 15px; background: var(--sidebar-bg); border-top: 1px solid var(--border); display: flex; gap: 8px; }
    .input-box { flex: 1; background: var(--white); border: 1px solid var(--border); padding: 12px; border-radius: 10px; outline: none; }
    .markdown-content p { margin-bottom: 10px; }
  `}</style>
);

// ─────────────────────────────────────────────
// SIDEBAR CHAT COMPONENT
// ─────────────────────────────────────────────
function SidebarChat() {
  const [messages, setMessages] = useState([{ role: 'bot', text: "Connection established with the Hive Mind. How can I help you?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendChat = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const result = await callAI(userText, "Mind Flayers University Assistant.");
      setMessages(prev => [...prev, { role: 'bot', text: result }]);
    } catch { setMessages(prev => [...prev, { role: 'bot', text: "Psionic signal lost." }]); }
    finally { setLoading(false); }
  };

  return (
    <aside className="chat-sidebar">
      <div className="chat-header">
        <span style={{fontWeight: 800}}>Mind Fley <span>v2.5</span></span>
        <div style={{fontSize: '11px', color: '#10b981', fontWeight: 600}}>CONNECTED</div>
      </div>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg msg-${m.role}`}>
            {m.role === 'bot' && i === messages.length - 1 ? <Typewriter text={m.text} /> : <ReactMarkdown>{m.text}</ReactMarkdown>}
          </div>
        ))}
        {loading && <div className="msg msg-bot">Reading thoughts...</div>}
        <div ref={scrollRef} />
      </div>
      <div className="chat-input-wrap">
        <input className="input-box" placeholder="Ask the cortex..." value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendChat()} />
        <button className="btn-action" style={{padding: '10px 18px', boxShadow: 'none'}} onClick={sendChat}>➤</button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────
// MAIN APP COMPONENT
// ─────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("admissions");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async (topic) => {
    setLoading(true);
    const prompts = {
      admissions: "Provide the 2026 admission summary for Mind Flayers University.",
      programmes: "List the psionic-ready programmes available.",
      placements: "Describe student success outcomes and recruiting partners."
    };
    const out = await callAI(prompts[topic], "Institutional info.");
    setContent(out);
    setLoading(false);
  };

  return (
    <>
      <GlobalStyle />
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-logo"><div className="logo-orb" /> Mind<span>Flayers</span></div>
          <nav>
            {['admissions', 'programmes', 'facilities', 'placements'].map(tab => (
              <div 
                key={tab} 
                className={`nav-item ${activeTab === tab ? 'active' : ''}`} 
                onClick={() => { setActiveTab(tab); setContent(""); }}
              >
                {tab.toUpperCase()}
              </div>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          <div className="header-tag">Official Student Portal 2026</div>
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          
          <div className="glass-card">
            <p style={{color: 'var(--text-dim)', fontSize: '18px', marginBottom: '30px'}}>
              Retrieving high-priority {activeTab} information.
            </p>
            
            {activeTab === 'facilities' ? (
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                {['Psionic Labs', 'Grand Library', 'Dimension Arena', 'Zenith Hostels'].map(f => (
                  <div key={f} style={{padding: '25px', background: 'var(--white)', borderRadius: '15px', border: '1px solid var(--border)', textAlign: 'center', fontWeight: 600, color: 'var(--accent)'}}>{f}</div>
                ))}
              </div>
            ) : (
              <button className="btn-action" onClick={() => fetchData(activeTab)} disabled={loading}>
                {loading ? "Establishing Link..." : `Access ${activeTab} Cortex`}
              </button>
            )}

            {content && (
              <div style={{marginTop: '35px', paddingTop: '30px', borderTop: '1px solid var(--border)', fontSize: '16px', color: '#475569', lineHeight: '1.7'}}>
                <Typewriter text={content} />
              </div>
            )}
          </div>
        </main>

        <SidebarChat />
      </div>
    </>
  );
}