import './ChatWindow.css';

export default function Message({ sender, text }) {
  const className = `message-box ${sender === 'user' ? 'message-user' : 'message-ai'}`;
  return <div className={className}><strong>{sender === 'user' ? 'You' : 'AI'}:</strong> {text}</div>;
}
