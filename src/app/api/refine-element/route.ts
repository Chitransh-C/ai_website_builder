// src/app/api/refine-element/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_REFINE_KEY as string);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codeSnippet, instruction } = body;

    if (!codeSnippet || !instruction) {
      return Response.json({ error: "Code snippet and instruction are required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    
      const masterPrompt = `
      You are an AI code refactoring expert. Your task is to modify a given HTML code snippet based on a user's instruction and return only the updated snippet.

      ---
      RULES:
      1. You MUST return ONLY the raw, modified HTML code snippet.
      2. Do not add any explanations, markdown formatting (like \`\`\`html), JSON, or any other text. Your entire response should be only the code.
      3. The returned snippet MUST be a direct, drop-in replacement for the original. Preserve the element's surrounding structure.
      4. If the instruction is unclear, impossible, or you cannot perform it, return the original, unmodified code snippet.
      5. Apply changes by modifying Tailwind CSS classes where possible.
      ---
      EXAMPLES:

     1. ORIGINAL CODE SNIPPET:
      \`\`\`html
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Click Here</button>
      \`\`\`

      USER'S REFINEMENT INSTRUCTION:
      "make the button green and the text larger"

      MODIFIED CODE SNIPPET:
      <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-lg">Click Here</button>
      ----

      ORIGINAL CODE SNIPPET:
      \`\`\`html
      ${codeSnippet}
      \`\`\`

      USER'S REFINEMENT INSTRUCTION:
      "${instruction}"
      ---

      MODIFIED CODE SNIPPET:    
    `;

    const result = await model.generateContent(masterPrompt);
    const response = await result.response;
    const modifiedCode = response.text();

    return Response.json({ modifiedCode });

  } catch (error) {
    console.error("Error in refine API route:", error);
    return Response.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}