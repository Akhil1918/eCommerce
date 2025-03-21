import React, { useState } from "react";
import { FaUserCircle, FaPaperPlane } from "react-icons/fa";

const contacts = [
  { id: 1, name: "Robo Cop", lastMessage: "Hey, you're arrested!" },
  { id: 2, name: "Optimus", lastMessage: "Wanna grab a beer?" },
  { id: 3, name: "Skynet", lastMessage: "Seen that canned piece of s?" },
];

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(contacts[0]);
  const [messages, setMessages] = useState([
    { text: "Hello dude!", sender: "me" },
    { text: "Hey! How's it going?", sender: "them" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, sender: "me" }]);
    setInput("");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-200 to-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-xl p-5 border-r border-gray-300">
        <h2 className="text-xl font-bold mb-5 text-gray-800">Chats</h2>
        <ul>
          {contacts.map((contact) => (
            <li
              key={contact.id}
              className={`p-3 flex items-center gap-3 rounded-xl transition-all cursor-pointer ${
                selectedChat.id === contact.id
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
              onClick={() => setSelectedChat(contact)}
            >
              <FaUserCircle size={30} className="text-gray-700" />
              <div>
                <p className="font-semibold">{contact.name}</p>
                <p className="text-sm text-gray-500">{contact.lastMessage}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Box */}
      <div className="flex-1 flex flex-col bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Chat Header */}
        <div className="p-5 bg-gray-300 flex items-center gap-3 shadow-md">
          <FaUserCircle size={35} className="text-gray-700" />
          <h2 className="text-lg font-bold text-gray-900">{selectedChat.name}</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-xs p-3 rounded-xl shadow-md ${
                msg.sender === "me"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-300 text-gray-900"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div className="p-4 border-t flex items-center bg-gray-100">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="ml-3 bg-blue-500 text-white p-3 rounded-full shadow-md hover:bg-blue-600 transition-all"
          >
            <FaPaperPlane size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
