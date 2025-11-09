**AI Website Builder 🚀**
A powerful, AI-driven tool that generates and refines web components in real-time. Built with Next.js and the Google Gemini API, this application allows users to go from a simple text prompt to a fully functional, styled, and interactive web component with just a few clicks.

Live Demo: [Link to your Vercel deployment]

✨ Key Features
1)  This project is a feature-rich Minimum Viable Product (MVP) that showcases a wide range of modern web development and AI      integration techniques:

2)  AI Code Generation: Leverages the Google Gemini API to generate HTML, CSS, and JavaScript from natural language prompts.

3)  Live Preview: Instantly renders the generated code in a secure, sandboxed <iframe> for immediate visual feedback.

4)  Interactive Element Inspector: A "Developer Mode" that allows users to hover over and select any element in the live          preview to see its specific code.

5)  Iterative Refinement: Users can select a generated element and provide follow-up instructions (e.g., "make this button        green") to the AI, which then refines just that part of the code.

6)  External Library Support: The AI can intelligently detect when a prompt requires an external library (like Chart.js,          GSAP, or Leaflet.js) and automatically include the necessary CDN links for both JS and CSS.

7) Conversational AI Chatbot: A floating chatbot that maintains conversation history, allowing users to ask follow-up            questions to understand the generated code.

8)  Session History: Automatically saves all generated components in a session history, allowing users to revisit and switch      between their past creations.

**Polished UI:**

Dark/Light Mode: A theme switcher for user comfort.

Collapsible Sidebar: A responsive history panel that can be collapsed to maximize workspace.

Utility Features: Includes "Copy to Clipboard" for each code block and a fullscreen "Focus Mode" for the preview.

**🛠️ Tech Stack**
Framework: Next.js (with App Router)

Language: TypeScript

Styling: Tailwind CSS

AI Model: Google Gemini Pro

UI Components: React with Hooks

Syntax Highlighting: react-syntax-highlighter

Deployment: Vercel

🚀 Getting Started
To run this project on your local machine, follow these steps.

Prerequisites
Node.js (v18 or later)

npm or yarn

Installation
Clone the repository:

git clone https://github.com/your-username/ai-website-builder.git
cd ai-website-builder

Install dependencies:

npm install

Set up environment variables:

Create a new file in the root of your project named .env.local.

Add your Google Gemini API key to this file:

GEMINI_API_KEY=your_secret_api_key_here

Run the development server:

npm run dev

Open http://localhost:3000 with your browser to see the result.

🔮 Future Work
This project has a solid foundation that can be extended with many more professional features, such as:

User Accounts: Allowing users to sign up and save their components to a database.

Component Export: A feature to download the generated code as a clean .zip file.

Full Page Composition: A drag-and-drop interface to assemble multiple generated components into a complete webpage.
