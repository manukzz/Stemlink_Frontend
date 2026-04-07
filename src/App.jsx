import { useState } from 'react'

function App() {
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState([]); // Stores { role, content }
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready');

  const API_BASE = import.meta.env.VITE_API_URL;

  // 1. Handle PDF Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('Uploading & Indexing...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/index-pdf`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setStatus(`Success: ${data.message}`);
    } catch (err) {
      setStatus('Upload failed.');
    }
  };

  // 2. Handle QA
  const handleAsk = async () => {
    if (!question.trim()) return;

    const userMsg = { role: 'user', content: question };
    setChat([...chat, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.content }),
      });
      const data = await res.json();
      
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer, 
        citations: data.citations 
      }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'assistant', content: 'Error connecting to API.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Class 12 Multi-Agent RAG</h1>
      
      {/* Upload Section */}
      <div style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
        <input type="file" accept=".pdf" onChange={handleFileUpload} />
        <p><small>Status: {status}</small></p>
      </div>

      {/* Chat History */}
      <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #eee', padding: '1rem' }}>
        {chat.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '1rem' }}>
            <div style={{ display: 'inline-block', padding: '10px', borderRadius: '10px', background: msg.role === 'user' ? '#007bff' : '#f1f1f1', color: msg.role === 'user' ? 'white' : 'black' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <p>Agent is thinking...</p>}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', marginTop: '1rem' }}>
        <input style={{ flex: 1, padding: '10px' }} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question..." />
        <button onClick={handleAsk} style={{ padding: '10px 20px' }}>Send</button>
      </div>
    </div>
  )
}

export default App