// src/hooks/useInspector.ts
'use client'

import { useState, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

// Define the shape of the AI's code response and History items
export interface CodeState {
  html: string;
  css: string;
  js: string;
  external_scripts?: string[];
  external_styles?: string[]
}
export interface HistoryItem {
  prompt: string;
  code: CodeState;
}

// The inspector script that will be injected into the iframe
const inspectorScript = `
{
  let lastHighlightedElement = null;
  const highlightStyle = '2px solid #3b82f6';
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (lastHighlightedElement) { lastHighlightedElement.style.outline = ''; }
    if (target && target instanceof HTMLElement) {
      target.style.outline = highlightStyle;
      lastHighlightedElement = target;
    }
  });
  document.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    const target = e.target;
    if (target && target instanceof HTMLElement) {
      const elementId = target.getAttribute('data-id');
      window.parent.postMessage({ type: 'elementClicked', elementId: elementId }, '*');
    }
  }, true);
}
`;

// Our custom hook
export const useInspector = (
  aiResponse: CodeState | null,
  isDevMode: boolean,
  setAiResponse: Dispatch<SetStateAction<CodeState | null>>,
  setHistory: Dispatch<SetStateAction<HistoryItem[]>>
) => {
  const [processedHtml, setProcessedHtml] = useState<string | null>(null);
  const [codeMap, setCodeMap] = useState<Map<string, string>>(new Map());
  const [selectedElementCode, setSelectedElementCode] = useState<string | null>(null);
  const [refineInstruction, setRefineInstruction] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  // Effect to process the raw HTML, add IDs, and create the map
// This single, consolidated useEffect handles all iframe and inspector logic
  useEffect(() => {
    // 1. If there's no AI response, do nothing and clear the iframe.
    if (!aiResponse) {
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe) iframe.srcdoc = '<html><head></head><body></body></html>';
      return;
    }

    // 2. Parse the AI's full HTML document
    const parser = new DOMParser();
    const doc = parser.parseFromString(aiResponse.html, "text/html");
    const newCodeMap = new Map<string, string>();
    let elementCounter = 0;

    // 3. Add unique IDs to every element in the body for the inspector
    doc.body.querySelectorAll('*').forEach((el) => {
      const id = `ai-element-${elementCounter++}`;
      el.setAttribute('data-id', id);
      newCodeMap.set(id, el.outerHTML);
    });
     if (aiResponse.external_scripts && aiResponse.external_scripts.length > 0) {
      aiResponse.external_scripts.forEach(scriptUrl => {
        const scriptTag = doc.createElement('script');
        scriptTag.src = scriptUrl;
         
        doc.head.appendChild(scriptTag);
      });
    }
    if (aiResponse.external_styles) {
       aiResponse.external_styles.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        doc.head.appendChild(link);
      });
    }
    // 4. Create style and script elements to inject
    const styleElement = doc.createElement('style');
    styleElement.textContent = aiResponse.css;
    doc.head.appendChild(styleElement);

    const scriptElement = doc.createElement('script');
    scriptElement.defer = true;
    scriptElement.textContent = aiResponse.js;
    doc.body.appendChild(scriptElement);

    if (isDevMode) {
      const inspectorElement = doc.createElement('script');
      inspectorElement.textContent = inspectorScript;
      doc.body.appendChild(inspectorElement);
    }
    
    // 5. Update the iframe with the modified, complete HTML document
    const finalHtml = doc.documentElement.outerHTML;
    setProcessedHtml(doc.documentElement.outerHTML);
    setCodeMap(newCodeMap);
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.srcdoc = finalHtml;
    }

    // 6. Set up the message listener for clicks
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'elementClicked') {
        const elementId = event.data.elementId;
        if (elementId) {
          const codeForElement = newCodeMap.get(elementId);
          setSelectedElementCode(codeForElement || null);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    
    // 7. Cleanup: Reset selection and remove listener when component changes
    return () => {
      window.removeEventListener('message', handleMessage);
      setSelectedElementCode(null);
    };

  }, [aiResponse, isDevMode]); // This effect now correctly depends on aiResponse and isDevMode
  
  // The full refine logic
  // This is the NEW version that can refine HTML, CSS, and JS
  const handleRefineClick = async () => {
    // We now need the full aiResponse, not just the selected snippet
    if (!refineInstruction || !aiResponse) return;
    
    setIsRefining(true);
    try {
      const response = await fetch('/api/refine-element', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalCode: aiResponse, // Send the full component code for context
          instruction: refineInstruction,
        }),
      });

      if (!response.ok) { throw new Error('Failed to refine element'); }

      // The API now returns the complete, updated code object
      const refinedCode = await response.json();
      
      // Update the parent component's state with the new, fully refined code
      setAiResponse(refinedCode);
      
      // Update the history with the new version
      setHistory(prevHistory => {
        const newHistory = [...prevHistory];
        // Find the index of the item we just refined
        const currentIndex = newHistory.findIndex(item => item.code.html === aiResponse.html && item.code.css === aiResponse.css);
        if (currentIndex !== -1) {
          // Replace the old code with the new refined code
          newHistory[currentIndex] = { ...newHistory[currentIndex], code: refinedCode };
        }
        return newHistory;
      });
      
      setSelectedElementCode(null);
      setRefineInstruction("");
    } catch (error) {
      console.error("Failed to refine element:", error);
      alert("Sorry, the refinement failed. Please try again.");
    } finally {
      setIsRefining(false);
    }
  };
  // Return everything the HomePage component needs
  return {
    selectedElementCode,
    setSelectedElementCode,
    refineInstruction,
    setRefineInstruction,
    handleRefineClick,
    isRefining,
  };
};