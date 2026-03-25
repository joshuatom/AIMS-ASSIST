import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

// 1. Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

// Helper for AI calls
const callAI = async (prompt, systemInstruction) => {
  const combinedPrompt = `${systemInstruction}\n\nUser Request: ${prompt}`;
  const result = await model.generateContent(combinedPrompt);
  const response = await result.response;
  return response.text();
};

// ─────────────────────────────────────────────
// GLOBAL STYLES (Restored & Enhanced)
// ─────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');
    
    :root {
      --bg: #0a0a0f;
      --surface: #12121a;
      --surface2: #1a1a26;
      --border: #2a2a3d;
      --accent: #7c6dfa;
      --accent2: #fa6d8a;
      --accent3: #6dfac8;
      --accent4: #fac96d;
      --text: #e8e8f0;
      --muted: #6e6e8a;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; line-height: 1.5; }

    .app-shell { display: flex; min-height: 100vh; }
    
    .sidebar {
      width: 260px; background: var(--surface); border-right: 1px solid var(--border);
      display: flex; flex-direction: column; padding: 24px 0; position: sticky; top: 0; height: 100vh;
    }

    .sidebar-logo { padding: 0 20px 20px; font-size: 22px; font-weight: 800; border-bottom: 1px solid var(--border); }
    .sidebar-logo span { color: var(--accent); }

    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 14px 20px; cursor: pointer;
      color: var(--muted); font-weight: 600; transition: 0.2s;
    }
    .nav-item:hover { background: var(--surface2); color: var(--text); }
    .nav-item.active { color: var(--accent); background: rgba(124, 109, 250, 0.1); border-right: 4px solid var(--accent); }

    .main-content { flex: 1; padding: 40px; overflow-y: auto; max-width: 1200px; margin: 0 auto; }

    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .input, .textarea, .select {
      width: 100%; background: #000; border: 1px solid var(--border);
      border-radius: 8px; padding: 12px; color: var(--text); font-family: inherit; margin-bottom: 10px; outline: none;
    }
    .input:focus { border-color: var(--accent); }

    .btn { padding: 10px 20px; border-radius: 8px; border: none; font-weight: 700; cursor: pointer; transition: 0.2s; font-family: inherit; }
    .btn-primary { background: var(--accent); color: white; }
    .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
    .btn-sm { padding: 5px 10px; font-size: 12px; }
    
    .ai-output { 
      background: #000; border: 1px solid var(--border); border-radius: 12px; padding: 20px; 
      font-family: 'DM Mono', monospace; font-size: 13px; line-height: 1.6; margin-top: 15px; color: #b0b0cc;
      overflow-x: auto;
    }

    .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .table th { text-align: left; font-size: 11px; color: var(--muted); padding: 12px; border-bottom: 1px solid var(--border); text-transform: uppercase; }
    .table td { padding: 12px; border-bottom: 1px solid var(--border); font-size: 14px; }

    .progress-bar { background: var(--surface2); height: 8px; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; transition: width 0.5s ease; }

    .badge-pill { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; }
    .bg-safe { background: rgba(109, 250, 200, 0.1); color: var(--accent3); border: 1px solid var(--accent3); }
    .bg-warn { background: rgba(250, 201, 109, 0.1); color: var(--accent4); border: 1px solid var(--accent4); }
    .bg-danger { background: rgba(250, 109, 138, 0.1); color: var(--accent2); border: 1px solid var(--accent2); }
  `}</style>
);

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const DSA_TOPICS = ["Arrays", "Strings", "Linked List", "Trees", "DP", "Graphs"];
const SKILL_LIST = ["Python", "Java", "React", "SQL", "System Design"];

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function SmartNotes() {
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async (type) => {
    setLoading(true);
    const prompts = {
      notes: `Create engineering study notes for: ${topic}.`,
      exam: `Create 2-mark and 16-mark Q&A for: ${topic}.`
    };
    try {
      const res = await callAI(prompts[type], "You are a senior engineering professor.");
      setOutput(res);
    } catch { setOutput("❌ Error generating notes."); }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>📚 Smart Notes</h2>
      <textarea className="textarea" placeholder="Enter topic..." value={topic} onChange={e => setTopic(e.target.value)} />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={() => generate('notes')}>Generate Notes</button>
        <button className="btn btn-secondary" onClick={() => generate('exam')}>Exam Q&A</button>
      </div>
      {loading && <p style={{ marginTop: '10px' }}>AI is writing...</p>}
      {output && <div className="ai-output"><ReactMarkdown>{output}</ReactMarkdown></div>}
    </div>
  );
}

function AttendancePredictor() {
  const [subjects, setSubjects] = useState([
    { name: "Maths", total: 45, attended: 38 },
    { name: "Physics", total: 40, attended: 28 },
  ]);
  const [newSub, setNewSub] = useState({ name: "", total: "", attended: "" });

  const addSubject = () => {
    if (!newSub.name || !newSub.total || !newSub.attended) return;
    setSubjects([...subjects, { name: newSub.name, total: +newSub.total, attended: +newSub.attended }]);
    setNewSub({ name: "", total: "", attended: "" });
  };

  const calcPercent = (att, tot) => tot > 0 ? ((att / tot) * 100).toFixed(1) : 0;
  const canSkip = (att, tot) => {
    const target = 0.75;
    const pct = att / tot;
    if (pct < target) return { skip: 0, need: Math.ceil((target * tot - att) / (1 - target)) };
    return { skip: Math.floor((att / target) - tot), need: 0 };
  };

  return (
    <div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead><tr><th>Subject</th><th>Attended</th><th>Total</th><th>%</th><th>Suggestion</th></tr></thead>
          <tbody>
            {subjects.map((s, i) => {
              const pct = calcPercent(s.attended, s.total);
              const { skip, need } = canSkip(s.attended, s.total);
              return (
                <tr key={i}>
                  <td>{s.name}</td><td>{s.attended}</td><td>{s.total}</td>
                  <td style={{ color: pct >= 75 ? 'var(--accent3)' : 'var(--accent2)' }}>{pct}%</td>
                  <td>{pct >= 75 ? `Skip ${skip} classes` : `Attend ${need} more`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3>Add Subject</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <input className="input" placeholder="Name" value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} />
          <input className="input" type="number" placeholder="Total" value={newSub.total} onChange={e => setNewSub({...newSub, total: e.target.value})} />
          <input className="input" type="number" placeholder="Attended" value={newSub.attended} onChange={e => setNewSub({...newSub, attended: e.target.value})} />
          <button className="btn btn-primary" onClick={addSubject}>Add</button>
        </div>
      </div>
    </div>
  );
}

function ExamPlanner() {
  const [exams, setExams] = useState([{ name: "", date: "" }]);
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true);
    const list = exams.map(e => `${e.name} on ${e.date}`).join(", ");
    try {
      const res = await callAI(`Plan for: ${list}`, "Create a day-by-day study schedule.");
      setPlan(res);
    } catch { setPlan("Error."); }
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>📅 Exam Planner</h2>
      {exams.map((e, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input className="input" placeholder="Subject" value={e.name} onChange={val => {
            const newExams = [...exams]; newExams[i].name = val.target.value; setExams(newExams);
          }} />
          <input className="input" type="date" value={e.date} onChange={val => {
            const newExams = [...exams]; newExams[i].date = val.target.value; setExams(newExams);
          }} />
        </div>
      ))}
      <button className="btn btn-primary" onClick={generatePlan} disabled={loading}>{loading ? "Planning..." : "Generate Schedule"}</button>
      {plan && <div className="ai-output"><ReactMarkdown>{plan}</ReactMarkdown></div>}
    </div>
  );
}

function PlacementTracker() {
  const [dsa, setDsa] = useState({ Arrays: 10, Strings: 5 });
  const [skills, setSkills] = useState(["Python"]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const getFeedback = async () => {
    setLoading(true);
    const res = await callAI(`DSA: ${JSON.stringify(dsa)}, Skills: ${skills.join(",")}`, "Give a 5-point career assessment.");
    setFeedback(res);
    setLoading(false);
  };

  return (
    <div className="card">
      <h2>🧠 Placement Prep</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
        <div>
          {DSA_TOPICS.map(t => (
            <div key={t} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{t}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setDsa({...dsa, [t]: (dsa[t] || 0) + 1})}>+ {dsa[t] || 0}</button>
            </div>
          ))}
        </div>
        <div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={getFeedback} disabled={loading}>
            {loading ? "Analyzing..." : "Get AI Career Feedback"}
          </button>
          {feedback && <div className="ai-output"><ReactMarkdown>{feedback}</ReactMarkdown></div>}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP SHELL
// ─────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("notes");

  return (
    <>
      <GlobalStyle />
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar-logo">campus<span>OS</span></div>
          <nav style={{ marginTop: '20px' }}>
            <div className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>📚 Smart Notes</div>
            <div className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>🧮 Attendance</div>
            <div className={`nav-item ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => setActiveTab('planner')}>📅 Exam Planner</div>
            <div className={`nav-item ${activeTab === 'placement' ? 'active' : ''}`} onClick={() => setActiveTab('placement')}>🧠 Placement Tracker</div>
          </nav>
        </aside>

        <main className="main-content">
          <header style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px' }}>Terminal_<em>Dashboard</em></h1>
            <p style={{ color: 'var(--muted)' }}>// Engineering Survival Kit active — March 2026</p>
          </header>

          {activeTab === 'notes' && <SmartNotes />}
          {activeTab === 'attendance' && <AttendancePredictor />}
          {activeTab === 'planner' && <ExamPlanner />}
          {activeTab === 'placement' && <PlacementTracker />}
        </main>
      </div>
    </>
  );
}