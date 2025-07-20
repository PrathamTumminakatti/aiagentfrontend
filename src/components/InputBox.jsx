import { useState } from 'react';

export default function InputBox({ onSend }) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex p-2 border-t bg-white">
      <input
        type="text"
        className="flex-1 p-2 border rounded-l-lg outline-none"
        placeholder="Ask your question..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className="bg-blue-600 text-white px-4 rounded-r-lg"
        onClick={handleSend}
      >
        Send
      </button>
    </div>
  );
}
