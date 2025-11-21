/* DOM Elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const currentQuestionEl = document.getElementById("currentQuestion");

/* Replace this with your Cloudflare Worker URL */
const WORKER_URL = "YOUR_WORKER_URL_HERE";

/* Conversation history (LevelUp) */
const messages = [
  {
    role: "system",
    content: `
You are a helpful virtual beauty advisor for L'Oréal.

You ONLY answer questions about:
- L'Oréal makeup
- L'Oréal skincare
- L'Oréal haircare
- L'Oréal fragrances
- Beauty routines, product recommendations, and how to use L'Oréal items

If someone asks anything NOT related to beauty or L'Oréal, reply:
"I'm here to help with L'Oréal beauty products and routines only."

Keep your answers warm, friendly, short, and helpful.
    `
  }
];

/* Add message bubbles to chat */
function addMessage(text, sender = "ai") {
  const msg = document.createElement("div");
  msg.classList.add("msg", sender);
  msg.textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Initial greeting */
addMessage("👋 Hi! I’m your L’Oréal beauty assistant. Ask me about products or routines!", "ai");

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  // Show user bubble
  addMessage(text, "user");

  // Save to conversation history
  messages.push({ role: "user", content: text });

  // LevelUp: show latest question at top
  currentQuestionEl.textContent = `Latest question: "${text}"`;

  // Clear input
  userInput.value = "";

  // Temporary AI thinking bubble
  const thinking = document.createElement("div");
  thinking.classList.add("msg", "ai");
  thinking.textContent = "⏳ Thinking...";
  chatWindow.appendChild(thinking);

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content ||
                  "Sorry, I couldn’t generate a response.";

    thinking.remove();
    addMessage(reply, "ai");

    messages.push({ role: "assistant", content: reply });

  } catch (err) {
    thinking.remove();
    addMessage("⚠️ Error: Could not connect to the server.", "ai");
  }
});
