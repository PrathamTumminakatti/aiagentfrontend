    import Message from './Message';
import InputBox from './InputBox';

export default function ChatWindow({ messages, onSend }) {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {messages.map((msg, index) => (
          <Message key={index} sender={msg.sender} text={msg.text} />
        ))}
      </div>
      <InputBox onSend={onSend} />
    </div>
  );
}
