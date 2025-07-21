import React, { useState, useEffect, useRef } from "react";
import "./index.css";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notionLink, setNotionLink] = useState("");
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]); // Stores chat bubbles
  const chatEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/list-docs`);
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please choose a file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const res = await fetch(`${API_BASE_URL}/refresh-docs`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(data.message || data.error);
      fetchDocuments();
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleLinkSubmit = async () => {
    if (!notionLink.trim()) {
      alert("Please enter a link.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/process-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: notionLink }),
      });
      const data = await res.json();
      alert(data.message || data.error);
      fetchDocuments();
      setNotionLink("");
    } catch (err) {
      console.error("Link error:", err);
    }
  };

  const handleAskQuestion = async () => {
    if (!query.trim()) return;

    // Add user message to chat
    const userMessage = { text: query, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");

    try {
      const res = await fetch(`${API_BASE_URL}/ask-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      const aiMessage = { text: data.answer || "No response.", sender: "ai" };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error asking question:", err);
      setMessages((prev) => [
        ...prev,
        { text: "Error talking to AI.", sender: "ai" },
      ]);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`Delete "${filename}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/delete-doc?filename=${filename}`, {
        method: "DELETE",
      });
      const data = await res.json();
      alert(data.message || data.error);
      fetchDocuments();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">😎UR BRO</div>

      <div className="main-container">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="upload-box">
            <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
            <button onClick={handleUpload} className="upload-btn">Upload</button>
          </div>

          <div className="link-box">
            <input
              type="text"
              placeholder="Paste Notion/Google Docs/Confluence link"
              value={notionLink}
              onChange={(e) => setNotionLink(e.target.value)}
            />
            <button onClick={handleLinkSubmit}>Add Link</button>
          </div>

          <div className="doc-list">
            <h3>Indexed Documents</h3>
            <ul>
              {documents.map((doc, idx) => (
                <li key={idx}>
                  <span>{doc}</span>
                  <button className="delete-btn" onClick={() => handleDelete(doc)}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Panel (Chat Window) */}
        <div className="right-panel">
          <div className="response-window">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-bubble ${msg.sender === "user" ? "user" : "ai"}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="query-bar">
            <input
              type="text"
              placeholder="Ask something..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
            />
            <button onClick={handleAskQuestion}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
