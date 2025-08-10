// src/app/api/refine-element/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_REFINE_KEY as string);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // We now expect the full original component code and the instruction
    const { originalCode, instruction } = body;

    if (!originalCode || !instruction) {
      return Response.json({ error: "Original code and instruction are required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // This is the new, more powerful master prompt for refining
    const masterPrompt = `
      You are an expert AI code refactoring assistant. Your task is to intelligently modify a given web component (composed of HTML, CSS, JS, and external scripts) based on a user's instruction.

      ---
      RULES:
      1. Your response MUST be ONLY a single, valid JSON object with the keys "html", "css", "js", and "external_scripts".
      2. Do not add any explanations or markdown formatting.
      3. The returned code should be a complete, drop-in replacement for the original.
      4. Only modify the parts of the code necessary to fulfill the request. For example, if the change is only to the CSS, return the original, unchanged HTML and JS.
      5. If the user's request requires a new external library, add its CDN URL to the "external_scripts" array.
      6. Ensure all CSS and JS remains properly scoped according to the original code's conventions.
      ---
      ---
      EXAMPLE:
      ORIGINAL COMPONENT CODE:
      {
        "html": "<!DOCTYPE html><html lang=\"en\"><head><script src=\"https://cdn.tailwindcss.com\"></script></head><body class=\"bg-gray-100 flex items-center justify-center min-h-screen\"><div class=\"component-a1b2\"><button class=\"my-button bg-blue-500 text-white p-2 rounded\">Show Alert</button></div></body></html>",
        "css": ".component-a1b2 .my-button { font-weight: bold; }",
        "js": "(() => { const btn = document.querySelector('.component-a1b2 .my-button'); if(btn) { btn.addEventListener('click', () => alert('Hello!')); } })();",
        "external_scripts": []
      }

      USER'S REFINEMENT INSTRUCTION:
      "Change the alert message to 'Goodbye' and make the button text red"

      YOUR MODIFIED JSON RESPONSE:
      {
        "html": "<!DOCTYPE html><html lang=\"en\"><head><script src=\"https://cdn.tailwindcss.com\"></script></head><body class=\"bg-gray-100 flex items-center justify-center min-h-screen\"><div class=\"component-a1b2\"><button class=\"my-button bg-blue-500 text-red-500 p-2 rounded\">Show Alert</button></div></body></html>",
        "css": ".component-a1b2 .my-button { font-weight: bold; }",
        "js": "(() => { const btn = document.querySelector('.component-a1b2 .my-button'); if(btn) { btn.addEventListener('click', () => alert('Goodbye')); } })();",
        "external_scripts": []
      }
      ---
      ORIGINAL COMPONENT CODE:
      ${JSON.stringify(originalCode, null, 2)}
      ---
      USER'S REFINEMENT INSTRUCTION:
      "${instruction}"
      ---

      YOUR MODIFIED JSON RESPONSE:
    `;

    const result = await model.generateContent(masterPrompt);
    const response = await result.response;
    const text = response.text();

    // We expect a full JSON object now, so we can send it directly
    return new Response(text, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in refine API route:", error);
    return Response.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}