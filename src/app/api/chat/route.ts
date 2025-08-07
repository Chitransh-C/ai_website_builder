// src/app/api/chat/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_CHAT_KEY as string);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // We now expect the full message history
    const { messages, codeContext } = body;

    if (!messages || messages.length === 0 || !codeContext) {
      return Response.json({ error: "Messages and code context are required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // --- NEW: Format the conversation history for the AI ---
    const formattedHistory = messages.map((msg: ChatMessage) => 
      `- ${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    // --- NEW: The master prompt now includes the chat history ---
    const masterPrompt = `
      You are a friendly and expert AI Code Assistant. Your user has generated a website component and is asking questions about it.
      Your job is to answer the user's latest question based on the provided code context and the history of the conversation so far.
      if you are providing code format it as markdown code block with the language specified.
      Be clear, concise, and helpful.

      ---
      CODE CONTEXT THE USER IS ASKING ABOUT:
      HTML: ${codeContext.html}
      CSS: ${codeContext.css}
      JAVASCRIPT: ${codeContext.js}
      ---
      CONVERSATION HISTORY:
      ${formattedHistory}
      ---

      Based on the history and context, provide a helpful response to the last user message.

      YOUR HELPFUL RESPONSE:
    `;

    const result = await model.generateContent(masterPrompt);
    const response = await result.response;
    const text = response.text();

    return Response.json({ answer: text });

  } catch (error) {
    console.error("Error in chat API route:", error);
    return Response.json({ error: "An internal server error occurred" }, { status: 500 });
  }
}