// src/app/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Chatbot } from "@/components/Chatbot";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ html: string; css: string; js: string; } | null>(null);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html');
  const [isFocusMode, setIsFocusMode] = useState(false);

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
      setAiResponse(data);
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (aiResponse) {
      const fullHtml = `
        <!DOCTYPE html><html lang="en">
        <head><style>${aiResponse.css}</style></head>
        <body>${aiResponse.html}<script>${aiResponse.js}</script></body>
        </html>`;
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe) { iframe.srcdoc = fullHtml; }
    }
  }, [aiResponse]);

  return (
    <main className="p-4 sm:p-8 md:p-12 min-h-screen bg-slate-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className={isFocusMode ? 'hidden' : 'block'}>
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-slate-200">
              AI Website Builder
            </h1>
           
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
              placeholder="e.g., A modern hero section with a dark background, a centered title, a subtitle, and a call-to-action button."
              className="text-gray-900 bg-white dark:bg-gray-800 dark:text-slate-100 dark:placeholder-gray-400 w-full h-32 p-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
              disabled={isLoading}
            />
            <button
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="px-6 py-3 w-full sm:w-auto self-end font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
                <button onClick={() => setIsFocusMode(!isFocusMode)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-slate-200 transition-colors" title={isFocusMode ? "Exit Fullscreen" : "Enter Fullscreen"}>
                  {isFocusMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11 3v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11-3v-4m0 0h-4m4 0l-5 5" /></svg>
                  )}
                </button>
              </div>

              <div className={`border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-slate-800 ${isFocusMode ? 'flex-grow' : ''}`}>
                <iframe id="preview-iframe" title="Live Preview" sandbox="allow-scripts" className="w-full h-full min-h-[24rem]"/>
              </div>

              <div className={isFocusMode ? 'hidden' : 'mt-6'}>
                <div className="flex border-b border-gray-300 dark:border-gray-700">
                  <button onClick={() => setActiveTab('html')} className={`px-4 py-2 font-medium transition-colors ${activeTab === 'html' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>HTML</button>
                  <button onClick={() => setActiveTab('css')} className={`px-4 py-2 font-medium transition-colors ${activeTab === 'css' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>CSS</button>
                  <button onClick={() => setActiveTab('js')} className={`px-4 py-2 font-medium transition-colors ${activeTab === 'js' ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>JavaScript</button>
                </div>
                <div className="code-display bg-[#1e1e1e] rounded-b-md overflow-hidden">
                  {activeTab === 'html' && <SyntaxHighlighter language="html" style={vscDarkPlus} customStyle={{ margin: 0 }}>{aiResponse.html}</SyntaxHighlighter>}
                  {activeTab === 'css' && <SyntaxHighlighter language="css" style={vscDarkPlus} customStyle={{ margin: 0 }}>{aiResponse.css}</SyntaxHighlighter>}
                  {activeTab === 'js' && <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0 }}>{aiResponse.js}</SyntaxHighlighter>}
                </div>
              </div>
            </div>
          )}
          <Chatbot codeContext={aiResponse} />
        </div>
      </div>
    </main>
  );
}