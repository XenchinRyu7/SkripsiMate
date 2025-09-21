import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  // Listen for menu events from Electron
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onMenuNewProject(() => {
        setPrompt('');
        setResponse('');
      });

      window.electronAPI.onMenuSaveProject(async () => {
        const data = { prompt, response, timestamp: new Date().toISOString() };
        const filePath = await window.electronAPI.saveFile(data);
        if (filePath) {
          alert(`Project saved to: ${filePath}`);
        }
      });

      window.electronAPI.onMenuOpenProject(async () => {
        const result = await window.electronAPI.openFile();
        if (result) {
          setPrompt(result.data.prompt || '');
          setResponse(result.data.response || '');
        }
      });
    }
  }, [prompt, response]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      // Simulate API call (replace with actual Gemini API)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResponse(`AI Response for: "${prompt}"\n\nThis is a placeholder response. In the actual implementation, this would be the response from the Gemini API.`);
    } catch (error) {
      setResponse('Error: Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>SkripsiMate</h1>
        <p>AI-Powered Thesis Planning</p>
      </header>

      <main className="App-main">
        <div className="input-section">
          <h2>Enter Your Thesis Prompt</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your thesis topic or research question..."
              rows={4}
              className="prompt-input"
            />
            <button 
              type="submit" 
              disabled={loading || !prompt.trim()}
              className="submit-button"
            >
              {loading ? 'Generating...' : 'Generate Thesis Plan'}
            </button>
          </form>
        </div>

        {response && (
          <div className="response-section">
            <h2>Generated Thesis Plan</h2>
            <div className="response-content">
              <pre>{response}</pre>
            </div>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Built with Electron + React</p>
        <p>Version 1.0.0</p>
      </footer>
    </div>
  );
}

export default App;
