// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Chatbot } from "@/components/Chatbot";
import { CopyButton } from "@/components/CopyButton";
// --- NEW: Define the structure for a history item ---
interface HistoryItem {
  prompt: string;
  code: {
    html: string;
    css: string;
    js: string;
  };
}
// Add this script constant at the top of your page.tsx file
const inspectorScript = `
  let lastHighlightedElement = null;
  const highlightStyle = '2px solid #3b82f6'; // blue-500

  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    // Remove previous highlight
    if (lastHighlightedElement) {
      lastHighlightedElement.style.outline = '';
    }
    // Add new highlight
    if (target && target instanceof HTMLElement) {
      target.style.outline = highlightStyle;
      lastHighlightedElement = target;
    }
  });

  document.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target;
    if (target && target instanceof HTMLElement) {
      // For now, we'll send the tag name. Later, we'll send a unique ID.
      const elementIdentifier = target.tagName;
      window.parent.postMessage({ type: 'elementClicked', element: elementIdentifier }, '*');
    }
  }, true); // Use capture phase to catch the click early
`;
export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<HistoryItem['code'] | null>(null);
  
  // --- NEW: State for session history ---
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isDevMode, setIsDevMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [isFocusMode, setIsFocusMode] = useState(false);
 const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const handleGenerateClick = async () => {
    setIsLoading(true);
    setAiResponse(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
      const data = await response.json();
      
      const newHistoryItem: HistoryItem = { prompt: prompt, code: data };
      
      // --- NEW: Update both the history and the current view ---
      setHistory(prevHistory => [...prevHistory, newHistoryItem]);
      setAiResponse(data);

    } catch (error) {
      console.error("Failed to fetch AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- NEW: Handler to switch to a historical item ---
  const handleHistoryClick = (item: HistoryItem) => {
    setPrompt(item.prompt);
    setAiResponse(item.code);
  };

  // This first useEffect is MODIFIED to inject our inspector script
 useEffect(() => {
    if (aiResponse) {
      let fullHtml = `
        <!DOCTYPE html><html lang="en">
        <head><style>${aiResponse.css}</style></head>
        <body>
          ${aiResponse.html}
          <script>${aiResponse.js}</script>
        </body>
        </html>`;

      // NEW: Only inject the inspector script if Dev Mode is ON
      if (isDevMode) {
        fullHtml = fullHtml.replace('</body>', `<script>${inspectorScript}</script></body>`);
      }
      
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe) { iframe.srcdoc = fullHtml; }
    }
  }, [aiResponse, isDevMode]); // NEW: Add isDevMode to the dependency array // This effect still runs when the AI response changes

  // This is a NEW useEffect to listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Optional: Check the origin for security
      // if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === 'elementClicked') {
        console.log('Element clicked inside iframe:', event.data.element);
        // In the next step, we will use this data to show the element's code
        alert(`You clicked on a <${event.data.element.toLowerCase()}> tag!`);
      }
    };

    window.addEventListener('message', handleMessage);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []); // The empty dependency array means this effect runs only once when the component mounts

 return (
    <>
      <div className="flex min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors">
        
        {/* --- History Sidebar (NOW COLLAPSIBLE) --- */}
        <aside className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${isHistoryOpen ? 'w-64' : 'w-20'}`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className={`text-lg font-semibold text-gray-800 dark:text-slate-200 ${!isHistoryOpen && 'hidden'}`}>History</h2>
            <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto flex-grow p-4">
            {history.length === 0 ? (
              <p className={`text-sm text-gray-500 dark:text-gray-400 ${!isHistoryOpen && 'hidden'}`}>Your generated components will appear here.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((item, index) => (
                  <li key={index}>
                    <button 
                      onClick={() => handleHistoryClick(item)}
                      className="w-full text-left p-2 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      title={item.prompt}
                    >
                      <span className="flex-shrink-0">📝</span>
                      <span className={`truncate ${!isHistoryOpen ? 'hidden' : ''}`}>{item.prompt}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* --- Main Content Area --- */}
        <main className="flex-1 p-4 sm:p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className={isFocusMode ? 'hidden' : 'block'}>
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-slate-200">AI Website Builder</h1>
                {/* FIX: Added the ThemeSwitcher back in */}
             { /*This will go inside the header div in page.tsx*/}
<div className="flex items-center gap-2">
  <label htmlFor="devModeToggle" className="text-sm text-gray-600 dark:text-gray-400">Dev Mode</label>
  <button
    id="devModeToggle"
    onClick={() => setIsDevMode(!isDevMode)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDevMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDevMode ? 'translate-x-6' : 'translate-x-1'}`}/>
  </button>
</div>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Enter a detailed description of the website or component you want to build.
              </p>

              <div className="mt-6 flex flex-col gap-4">
                <label htmlFor="prompt-textarea" className="block font-medium text-gray-700 dark:text-gray-300">Your Prompt</label>
                <textarea
                  id="prompt-textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A modern hero section with a dark background..."
                  className="text-gray-900 bg-white dark:bg-gray-800 dark:text-slate-100 dark:placeholder-gray-400 w-full h-32 p-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
                  disabled={isLoading}
                />
                <button
                  onClick={handleGenerateClick}
                  disabled={isLoading}
                  className="px-6 py-3 w-full sm:w-auto self-end font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {isLoading ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>
            
            <div className={isFocusMode ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-4 flex flex-col' : 'mt-8'}>
              {aiResponse && (
                <div className={`w-full h-full ${isFocusMode ? 'flex flex-col' : ''}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-200">Live Preview</h2>
                    <button onClick={() => setIsFocusMode(!isFocusMode)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" title={isFocusMode ? "Exit Fullscreen" : "Enter Fullscreen"}>
                      {isFocusMode ? ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> ) : ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11 3v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11-3v-4m0 0h-4m4 0l-5 5" /></svg> )}
                    </button>
                  </div>
                  <div className={`border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 ${isFocusMode ? 'flex-grow' : ''}`}>
                    <iframe id="preview-iframe" title="Live Preview" sandbox="allow-scripts" className="w-full h-full min-h-[24rem]"/>
                  </div>
                  <div className={isFocusMode ? 'hidden' : 'mt-6'}>
                    <div className="flex border-b border-gray-300 dark:border-gray-700">
                      <button onClick={() => setActiveTab('html')} className={`px-4 py-2 font-medium ${activeTab === 'html' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>HTML</button>
                      <button onClick={() => setActiveTab('css')} className={`px-4 py-2 font-medium ${activeTab === 'css' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>CSS</button>
                      <button onClick={() => setActiveTab('js')} className={`px-4 py-2 font-medium ${activeTab === 'js' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>JavaScript</button>
                    </div>
                    <div className="relative code-display bg-[#1e1e1e] rounded-b-md overflow-hidden">
                      {activeTab === 'html' && (
                        <>
                          <CopyButton textToCopy={aiResponse.html} />
                          <SyntaxHighlighter language="html" style={vscDarkPlus} customStyle={{ margin: 0 }}>{aiResponse.html}</SyntaxHighlighter>
                        </>
                      )}
                      {activeTab === 'css' && (
                        <>
                          {/* FIX: Changed to aiResponse.css */}
                          <CopyButton textToCopy={aiResponse.css} />
                          <SyntaxHighlighter language="css" style={vscDarkPlus} customStyle={{ margin: 0 }}>{aiResponse.css}</SyntaxHighlighter>
                        </>
                      )}
                      {activeTab === 'js' && (
                        <>
                          {/* FIX: Changed to aiResponse.js */}
                          <CopyButton textToCopy={aiResponse.js} />
                          <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0 }}>{aiResponse.js}</SyntaxHighlighter>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      <Chatbot codeContext={aiResponse} />
    </>
  );
}