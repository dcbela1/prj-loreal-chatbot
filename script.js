// ===== Grab DOM elements =====
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const currentQuestionEl = document.getElementById("currentQuestion");

// ===== Your Cloudflare Worker URL =====
const WORKER_URL = "https://lingering-cherry-b621.dcbela.workers.dev";

// ===== Conversation history (for LevelUp + multi-turn chat) =====
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

// ===== Helper to add a message bubble =====
function addMessage(text, sender = "ai") {
  const msg = document.createElement("div");
  msg.classList.add("msg", sender);
  msg.textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ===== Initial greeting =====
addMessage("👋 Hi! I’m your L’Oréal beauty assistant. Ask me about products or routines!", "ai");

// ===== Handle form submit =====
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  // Show user bubble
  addMessage(text, "user");

  // Save user message to conversation history
  messages.push({ role: "user", content: text });

  // Show latest question at the top (LevelUp)
  if (currentQuestionEl) {
    currentQuestionEl.textContent = `Latest question: "${text}"`;
  }

  // Clear input
  userInput.value = "";

  // Show temporary "thinking" bubble
  const thinking = document.createElement("div");
  thinking.classList.add("msg", "ai");
  thinking.textContent = "⏳ Thinking...";
  chatWindow.appendChild(thinking);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Send request to your Cloudflare Worker
    const res = await fetch(WORKER_URL, {
      method: "POST",
      // no custom headers so the browser avoids a CORS preflight
      body: JSON.stringify({ messages })
    });

    // If the response itself failed (non-2xx)
    if (!res.ok) {
      thinking.remove();
      addMessage("⚠️ Server error. Please try again.", "ai");
      return;
    }
const data = await res.json();

let reply;
if (data.error) {
  reply = `⚠️ OpenAI error: ${data.error}`;
} else {
  reply =
    data?.choices?.[0]?.message?.content ||
    "Sorry, I couldn’t generate a response.";
}
  
    // Remove "thinking" and show real reply
    thinking.remove();
    addMessage(reply, "ai");

    // Save assistant reply to conversation history
    messages.push({ role: "assistant", content: reply });
  } catch (err) {
    // Network / CORS / other error
    thinking.remove();
    addMessage("⚠️ Error: Could not connect to the server.", "ai");
    console.error("Chat error:", err);
  }
});
