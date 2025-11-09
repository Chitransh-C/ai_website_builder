// src/components/Chatbot.tsx
'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  codeContext: {
    html: string;
    css: string;
    js: string;
  } | null;
}

export const Chatbot = ({ codeContext }: ChatbotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'assistant', content: "Hello! Ask me anything about the code." }]);
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !codeContext) return;

    const newUserMessage: Message = { role: 'user', content: userInput };
    // --- NEW: Create the full conversation history to send to the API ---
    const newMessages = [...messages, newUserMessage];
    
    setMessages(newMessages); // Update UI with user's message immediately
    setUserInput('');
    setIsLoading(true);

    try {
      // --- NEW: Send the entire `newMessages` array ---
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages, // Send the whole conversation
          codeContext: codeContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the AI.');
      }
      
      const data = await response.json();
      const aiMessage: Message = { role: 'assistant', content: data.answer };
      setMessages(prev => [...prev, aiMessage]); // Update UI with AI's response

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!codeContext) { return null; }

  return (
    
    <div className="z-50">
      {/* Chat Window */}
      <div className={`z-53 fixed bottom-24 right-4 sm:right-8 w-[90vw] max-w-lg h-[70vh] max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="flex justify-between items-center p-4 bg-indigo-600 text-white rounded-t-lg flex-shrink-0">
          <h3 className="text-lg font-semibold">AI Code Assistant</h3>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4 flex-grow overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                <div className="text-sm whitespace-pre-wrap">
  {msg.content.split(/(\d+\.\s)/).filter(Boolean).map((part, index) => {
    // This logic reassembles the number with its text on the same line
    if (index % 2 === 0) {
      // This is the text part
      return part;
    } else {
      // This is the number part (e.g., "1. "), so we don't add a line break before it
      return part;
    }
  }).reduce((acc, part, index) => {
    if (index % 2 === 1) {
      // If it's a number part, prepend a line break before it (except for the first one)
      acc.push(<br key={`br-${index}`}/>);
    }
    acc.push(part);
    return acc;
 }, [] as ReactNode[])}
</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                <p className="text-sm animate-pulse">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg flex-shrink-0">
          <div className="flex items-center">
            <input type="text" placeholder="Ask a question..." value={userInput} onChange={(e) => setUserInput(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
            <button type="submit" className="ml-3 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" disabled={isLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        </form>
      </div>

      {/* Floating Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="z-50 fixed bottom-4 right-4 sm:right-8 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-110" title="Open AI Assistant">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      </button>
    </div>
  )
}