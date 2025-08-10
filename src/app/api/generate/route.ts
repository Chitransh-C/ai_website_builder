// File: src/app/api/generate/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI Client with the API key from our .env.local file
// Next.js automatically makes this environment variable available to our server-side code
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
// --- NEW, ROBUST PARSING FUNCTION ---
// src/app/api/generate/route.ts

function extractJsonContent(rawString: string) {
  // These new, more robust regexes do not depend on the order of keys.
  const extract = (key: string) => {
    // This regex looks for a key, a colon, and then captures the string in quotes.
    const regex = new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`);
    const match = rawString.match(regex);
    // It returns the captured content or an empty string if not found.
    return match ? match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\r/g, '\r') : "";
  };
  
  const extractArray = (key: string) => {
    const regex = new RegExp(`"${key}"\\s*:\\s*\\[([^\\]]*)\\]`);
    const match = rawString.match(regex);
    if (!match) return [];
    // It splits the captured content by commas and cleans it up.
    return match[1].split(',').map(s => s.trim().replace(/"/g, '')).filter(s => s);
  };

  const html = extract("html");
  const css = extract("css");
  const js = extract("js");
  const external_scripts = extractArray("external_scripts");

  if (html) { // We only need HTML to be present to consider it a success
    return { html, css, js, external_scripts };
  }
  
  throw new Error("Failed to extract HTML key from AI response.");
}
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), { status: 400 });
    }

    // --- This is the new AI-powered part ---

    // 1. Select the AI model we want to use
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});

    // 2. Craft a "master prompt" to give the AI instructions
    // This is called Prompt Engineering. We're telling the AI exactly how to behave.
    const masterPrompt = `
You are an expert web developer AI who is a specialist in creating clean, modern, and responsive UI components and complete websites using Tailwind CSS, HTML, and JavaScript with complete knowledge of all js libraries.

---
RULES:
1.  Insert placeholder images in appropriate sections using relevant alt text, such as <img src="https://picsum.photos/800/600" alt="Lorem Picsum 800x600"> but only 4 images for more use placehold.co <img src="https://placehold.co/800x600" alt="placeholder img">, ensuring they match the content context and maintain responsive sizing.
2.  The JSON object must have three keys: "html", "css","js", and "external_scripts".
3.  **TAILWIND FIRST**: All styling MUST be done with Tailwind CSS classes directly in the HTML.
4.  The 'css' key should ONLY be used for essential base styles (like body background, fonts) or complex animations. For components, it should usually be an empty string.
5.  All HTML responses MUST include the Tailwind CSS Play CDN script in the <head>. This is mandatory. The script tag is: <script src="https://cdn.tailwindcss.com"></script>
6.  If the user asks for a simple component (e.g., button, card), provide the HTML with js for that component providing the component with complete functionality.
7.  All JavaScript must be self-contained in the 'js' key,Check the user's prompt for any mention of external libraries (like Three.js, D3.js, GSAP, etc.). If a library is mentioned, you MUST add its public CDN URL to the "external_scripts" array.IF YOU can use jQuery ,Anime.js. If no external libraries are needed, return an empty array [].
8.  Don't use THREE.js or any other 3D libraries unless explicitly requested by the user. If the user asks for a 3D component, use CSS3D transforms or similar techniques.
9.  Just go completely nuts with the creativity, but always follow the rules above. USE js to make it interactive.
10.  You are an expert,always try to create a responsive and interactive design that works well on both desktop and mobile.
11. You are a specialist who can design most beautiful and well designed webpages.Use your experience to make educated guesses about the user's needs based on the prompt.Always try to create a visually appealing design that follows modern web standards.
12. ALWAYS format the string in a adequately indented way, so that it is easy to read and understand.
13. All links to open other pages should be empty,href="javascript:void(0)".
14.  **Do not use "import" statements.** If you need a library like Three.js, assume it is already available globally (e.g., as window.THREE or just THREE).
15. Add the correct code in the correct key, do not add all the code in a single key. divide the code in the correct keys.
16.  **CSS SCOPING**: Give the root HTML element a unique and random class name (e.g., "component-xyz"). EVERY CSS selector you write in the 'css' key MUST be prefixed with this unique class to ensure styles do not affect other components.
17.  **JS SCOPING**: All code in the 'js' key MUST be wrapped in an Immediately Invoked Function Expression (IIFE) like \`(() => { ... })();\` to prevent polluting the global scope.

---
---
EXAMPLE 1: An interactive modal/popup component
USER REQUEST: "a button that opens a modal with a title, some text, and a close button"
YOUR JSON RESPONSE:
{
  "html": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><script src=\"https://cdn.tailwindcss.com\"></script></head><body class=\"bg-slate-100\"><div class=\"component-modal-alpha p-8\"><button id=\"open-modal-btn\" class=\"bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded\">Open Modal</button><div id=\"modal-backdrop\" class=\"fixed inset-0 bg-black bg-opacity-50 hidden z-40\"></div><div id=\"modal-dialog\" class=\"fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 w-full max-w-md hidden z-50\"><h2 class=\"text-2xl font-bold mb-4\">Modal Title</h2><p class=\"text-gray-600 mb-6\">This is the content of the modal. You can put any information here.</p><button id=\"close-modal-btn\" class=\"bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded\">Close</button></div></div></body></html>",
  "css": ".component-modal-alpha #modal-dialog { transition: transform 0.3s ease-out, opacity 0.3s ease-out; }",
  "js": "(() => { const component = document.querySelector('.component-modal-alpha'); if (!component) return; const openBtn = component.querySelector('#open-modal-btn'); const closeBtn = component.querySelector('#close-modal-btn'); const backdrop = component.querySelector('#modal-backdrop'); const modal = component.querySelector('#modal-dialog'); const toggleModal = (show) => { if (show) { backdrop.classList.remove('hidden'); modal.classList.remove('hidden'); } else { backdrop.classList.add('hidden'); modal.classList.add('hidden'); } }; openBtn.addEventListener('click', () => toggleModal(true)); closeBtn.addEventListener('click', () => toggleModal(false)); backdrop.addEventListener('click', () => toggleModal(false)); })();",
  "external_scripts": []
}
---
EXAMPLE 2: A data visualization chart using an external library
USER REQUEST: "a simple doughnut chart using chart.js with labels for 'Sales', 'Marketing', and 'Dev'"
YOUR JSON RESPONSE:
{
  "html": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><script src=\"https://cdn.tailwindcss.com\"></script></head><body class=\"bg-gray-900 flex items-center justify-center min-h-screen\"><div class=\"component-chart-beta bg-white p-6 rounded-lg shadow-xl\"><canvas id=\"myDoughnutChart\" width=\"400\" height=\"400\"></canvas></div></body></html>",
  "css": "",
  "js": "(() => { const ctx = document.getElementById('myDoughnutChart'); if (!ctx || typeof Chart === 'undefined') return; const myChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Sales', 'Marketing', 'Development'], datasets: [{ label: 'Team Allocation', data: [300, 150, 200], backgroundColor: ['rgb(59, 130, 246)', 'rgb(239, 68, 68)', 'rgb(22, 163, 74)'], hoverOffset: 4 }] } }); })();",
  "external_scripts": ["https://cdn.jsdelivr.net/npm/chart.js"]
}
---
EXAMPLE 3: A responsive, animated image gallery
USER REQUEST: "a visually stunning, responsive 4-image gallery for a portfolio with hover effects"
YOUR JSON RESPONSE:
{
  "html": "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><script src=\"https://cdn.tailwindcss.com\"></script></head><body class=\"bg-black\"><div class=\"component-gallery-gamma container mx-auto px-4 py-8\"><h2 class=\"text-4xl font-bold text-center text-white mb-8\">Our Work</h2><div class=\"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 gallery-container\"><div class=\"group overflow-hidden rounded-lg\"><img src=\"https://picsum.photos/800/600?random=1\" alt=\"Random placeholder image 1\" class=\"w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110\"></div><div class=\"group overflow-hidden rounded-lg\"><img src=\"https://picsum.photos/800/600?random=2\" alt=\"Random placeholder image 2\" class=\"w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110\"></div><div class=\"group overflow-hidden rounded-lg\"><img src=\"https://picsum.photos/800/600?random=3\" alt=\"Random placeholder image 3\" class=\"w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110\"></div><div class=\"group overflow-hidden rounded-lg\"><img src=\"https://picsum.photos/800/600?random=4\" alt=\"Random placeholder image 4\" class=\"w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110\"></div></div></div></body></html>",
  "css": ".component-gallery-gamma .gallery-container { perspective: 1000px; } .component-gallery-gamma .group:hover { box-shadow: 0 25px 50px -12px rgba(255, 255, 255, 0.25); }",
  "js": "(() => { const items = document.querySelectorAll('.component-gallery-gamma .group'); items.forEach(item => { item.addEventListener('mousemove', (e) => { const { left, top, width, height } = item.getBoundingClientRect(); const x = (e.clientX - left) / width - 0.5; const y = (e.clientY - top) / height - 0.5;item.style.transform = 'rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg) scale(1.05)'; }); item.addEventListener('mouseleave', () => { item.style.transform = 'rotateY(0) rotateX(0) scale(1)'; }); }); })();",
  "external_scripts": []
}
---
----

USER REQUEST: "${prompt}"

YOUR JSON RESPONSE:
`;

    // 3. Send the prompt to the AI and wait for the response
   // --- Replace the old block with this ---
const result = await model.generateContent(masterPrompt);
const response = await result.response;
const aiTextResponse = response.text();
//console.log("--- RAW AI RESPONSE (BEFORE PARSING) ---");
     // console.log(aiTextResponse);
// Use our new, robust function to parse the AI's response
const jsonObject = extractJsonContent(aiTextResponse);

return Response.json(jsonObject);

  } catch (error) {
    console.error("Error in API route:", error);
    return new Response(JSON.stringify({ error: "An internal server error occurred" }), { status: 500 });
  }
}