import React, { useState, useRef } from 'react';
import './index.css';

const API_BASE_URL = 'https://internal-docs-api.onrender.com'; // Replace with actual backend link

export default function App() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef();
  const [urlInput, setUrlInput] = useState('');


  const handleSend = async () => {
    if (!question.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      const data = await res.json();

      setMessages([...messages, { role: "user", content: question }, { role: "ai", content: data.answer }]);
      setQuestion("");
    } catch (err) {
      console.error("Chat error:", err);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE_URL}/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setUploadedDocs([...uploadedDocs, selectedFile.name]);
          setSelectedFile(null);
          setUploadProgress(0);
        } else {
          alert("Upload failed!");
        }
      };

      xhr.onerror = () => {
        alert("Upload failed!");
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };
  const handleLinkUpload = async () => {
  if (!urlInput.trim()) return;

  try {
    const res = await fetch(`${API_BASE_URL}/upload-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlInput }),
    });

    const data = await res.json();

    if (res.ok) {
      setUploadedDocs([...uploadedDocs, data.filename || 'Link uploaded']);
      setUrlInput('');
    } else {
      alert("Link upload failed!");
    }
  } catch (err) {
    console.error("Link upload error:", err);
  }
};


  const handleDelete = async (filename, index) => {
    try {
      const res = await fetch(`${API_BASE_URL}/delete?filename=${encodeURIComponent(filename)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const updatedDocs = [...uploadedDocs];
        updatedDocs.splice(index, 1);
        setUploadedDocs(updatedDocs);
      } else {
        alert("Delete failed!");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setSelectedFile(file);
  };

  return (
    <div className="container">
      <header className="header">
  <img src="/emo.png" alt="Logo" className="logo" />
  <span>UR Bro <small>(Internal Docs Q&A Agent)</small></span>
</header>


      <div className="main-content">
        <div className="left-panel">
          <div
  className="upload-box"
  onDragOver={(e) => e.preventDefault()}
  onDrop={handleDrop}
  onClick={() => fileInputRef.current.click()}
>
  <h3>📤 Drag & Drop File or Click Here</h3>

  {/* Hidden File Input */}
  <input
    type="file"
    ref={fileInputRef}
    style={{ display: 'n>one' }}
    onChange={(e) => setSelectedFile(e.target.files[0])}
  />

  {/* Show selected file name */}
  <span className="file-name">{selectedFile?.name || "No file chosen"}</span>
  <button onClick={(e) => { e.stopPropagation(); handleUpload(); }} className="upload-final-btn">
    Upload ⬆
  </button>

  {/* Progress Bar */}
  {uploadProgress > 0 && (
    <div className="progress-bar">
      <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
    </div>
  )}

  {/* Link Upload Section */}
  <div className="link-upload" onClick={(e) => e.stopPropagation()}>
    <input
      type="text"
      placeholder="Paste Notion, Google Docs, or Confluence link"
      value={urlInput}
      onChange={(e) => setUrlInput(e.target.value)}
      className="link-input"
    />
    <button onClick={handleLinkUpload} className="link-upload-btn">
      Upload from Link 🔗
    </button>
  </div>
</div>


          <div className="docs-box">
            <h3>📄 Uploaded Documents</h3>
            <ul>
              {uploadedDocs.map((doc, i) => (
                <li key={i} className="doc-item">
                  {doc}
                  <button className="delete-btn" onClick={() => handleDelete(doc, i)}>🗑️</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="right-panel">
          <div className="chat-box">
            {messages.map((msg, i) => (
  <div key={i} className={`chat-bubble ${msg.role}`}>
    <div className="bubble-content">
      {msg.role === 'user' ? '🧑 You' : '🤖 AI'}: {msg.content}
    </div>
  </div>
))}

          </div>

          <div className="input-section">
            <input
              type="text"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
