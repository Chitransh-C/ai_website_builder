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
You are an expert web developer AI who specializes in creating clean, modern, and responsive code using HTML, CSS, and JavaScript.

---
RULES:
1.  You MUST respond with ONLY a single, valid JSON object. Do not include any other text, explanations, or markdown formatting like \`\`\`json.
2.  The JSON object must have three keys: "html", "css", and "js".
3.  The code must be modern and professional. Use Flexbox or Grid for layouts. Ensure HTML is semantic and accessible.
4.  All JavaScript must be self-contained in the 'js' key. Do not link to external script files in the HTML.
5.  Always try to create a responsive design that works well on both desktop and mobile.
6.  You can use your experience to make educated guesses about the user's needs based on the prompt.
7.  Always try to create a visually appealing design that follows modern web standards.
---

EXAMPLE :
USER REQUEST: "a full landing page for a coffee shop"
YOUR JSON RESPONSE:
{
  "html": "<!DOCTYPE html>... rest of the full page html ...",
  "css": "body { ... } ... rest of the full page css ...",
  "js": "const nav = document.querySelector('nav'); window.addEventListener('scroll', () => { ... });"
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