/* DOM Elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const currentQuestionEl = document.getElementById("currentQuestion");

/* Cloudflare Worker URL (replace this with your Worker URL) */
const WORKER_URL = "YOUR_WORKER_URL_HERE";

/* Conversation history (LevelUp: maintain history) */
const messages = [
  {
    role: "system",
    content: `
You are a helpful virtual beauty advisor for L'Oréal.

You ONLY answer questions related to:
- L'Oréal makeup, skincare, haircare, and fragrances
- Beauty routines, ingredients, and how to use L'Oréal products
- Personalized product and routine recommendations

If a question is not related to beauty or L'Oréal, respond with:
"I'm here to help with L'Oréal products, routines, and beauty-related questions."

Keep answers friendly, concise, and easy to understand.
    `
  }
];

/* Helper: add messages to the chat window */
function addMessage(text, sender = "ai") {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg", sender);
  msgDiv.textContent = text;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Initial greeting */
addMessage("👋 Hi! I’m your L’Oréal beauty assistant. Ask me about products or routines.", "ai");

/* Form submit handler */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  // Show user message bubble
  addMessage(text, "user");
  messages.push({ role: "user", content: text });

  // LevelUp: show the latest question above the chat
  currentQuestionEl.textContent = `Latest question: "${text}"`;

  // Clear input
  userInput.value = "";

  // Temporary "thinking" message
  const thinking = document.createElement("div");
  thinking.classList.add("msg", "ai");
  thinking.textContent = "⏳ Thinking...";
  chatWindow.appendChild(thinking);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Send to Cloudflare Worker (which forwards to OpenAI)
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn’t generate a response.";

    // Remove thinking bubble
    thinking.remove();

    // Show AI reply
    addMessage(reply, "ai");
    messages.push({ role: "assistant", content: reply });
  } catch (error) {
    thinking.remove();
    addMessage("⚠️ Oops, I couldn’t reach the server. Please try again.", "ai");
  }
});
