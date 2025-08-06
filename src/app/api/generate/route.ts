// File: src/app/api/generate/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google AI Client with the API key from our .env.local file
// Next.js automatically makes this environment variable available to our server-side code
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

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
You are an expert web developer AI who is a specialist in creating clean, modern, and responsive UI components using Tailwind CSS, HTML, and JavaScript.

---
RULES:
1.  You MUST respond with ONLY a single, valid JSON object. Do not include any other text, explanations, or markdown formatting like \`\`\`json.
2.  The JSON object must have three keys: "html", "css", and "js".
3.  **TAILWIND FIRST**: All styling MUST be done with Tailwind CSS classes directly in the HTML.
4.  The 'css' key should ONLY be used for essential base styles (like body background, fonts) or complex animations. For components, it should usually be an empty string.
5.  All HTML responses MUST include the Tailwind CSS Play CDN script in the <head>. This is mandatory. The script tag is: <script src="https://cdn.tailwindcss.com"></script>
6.  If the user asks for a simple component (e.g., button, card), provide the HTML for that component wrapped in a basic <html> and <body> structure.
7.  All JavaScript must be self-contained in the 'js' key. Do not link to external script files.
8.  **NO CUSTOM CLASSES**: Do not create custom CSS class names like ".container" or ".title". Rely exclusively on Tailwind's utility classes.
9.  You are an expert,always try to create a responsive design that works well on both desktop and mobile.
10. You are a specialist who can design most beautiful and well designed webpages.Use your experience to make educated guesses about the user's needs based on the prompt.Always try to create a visually appealing design that follows modern web standards.
11. ALWAYS format the string in a adequately indented way, so that it is easy to read and understand.
12. All links to open other pages should be empty,href="javascript:void(0)".
13. Strictly follow all the rules above espacially the first one.
---
EXAMPLE 1:
USER REQUEST: "a simple blue button that says 'Learn More' using tailwind"
YOUR JSON RESPONSE:
{
  "html": "<!DOCTYPE html>
  <html lang=\"en\"><head>
  <script src=\"https://cdn.tailwindcss.com\"></script></head>
  <body class=\"bg-gray-100 flex items-center justify-center min-h-screen\">
  <button class=\"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded\">Learn More</button>
  </body></html>",
  "css": "",
  "js": ""
}
---
EXAMPLE 2:
USER REQUEST: "A login form with a dark background"
YOUR JSON RESPONSE:
{
  "html": "<!DOCTYPE html>
  <html lang=\"en\"><head>
  <script src=\"https://cdn.tailwindcss.com\"></script></head>
  <body class=\"bg-gray-900 flex items-center justify-center min-h-screen\">
    <div class=\"bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm\">
     <h2 class=\"text-2xl font-bold text-white text-center mb-6\">Login</h2>
     <form class=\"space-y-6\">
     <input class=\"w-full p-3 bg-gray-700 rounded text-white placeholder-gray-400\" type=\"email\" placeholder=\"Email\"><input class=\"w-full p-3 bg-gray-700 rounded text-white placeholder-gray-400\" type=\"password\" placeholder=\"Password\"><button class=\"w-full p-3 bg-indigo-600 rounded text-white font-bold hover:bg-indigo-700\">
     Log In
     </button>
     </form></div></body></html>",
  "css": "",
  "js": ""
}
---

USER REQUEST: "${prompt}"

YOUR JSON RESPONSE:
`;

    // 3. Send the prompt to the AI and wait for the response
    const result = await model.generateContent(masterPrompt);
    const response = await result.response;
    const aiTextResponse = response.text();
 // 1. Find the start and end of the JSON object within the AI's response.
    const startIndex = aiTextResponse.indexOf('{');
    const endIndex = aiTextResponse.lastIndexOf('}');
    
    // 2. Extract just the JSON string.
    const jsonString = aiTextResponse.substring(startIndex, endIndex + 1);
    
    // 3. Parse the cleaned string on the backend to ensure it's valid JSON.
    const jsonObject = JSON.parse(jsonString);

    // --- End of new part ---

    // 4. Send the clean, verified JSON object to the frontend.
    // We use Response.json() which automatically handles headers and stringifying.
    return Response.json(jsonObject);
    

  } catch (error) {
    console.error("Error in API route:", error);
    return new Response(JSON.stringify({ error: "An internal server error occurred" }), { status: 500 });
  }
}