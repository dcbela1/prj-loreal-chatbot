const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const currentQuestionEl = document.getElementById("currentQuestion");

// Replace this with your Cloudflare Worker URL later
const WORKER_URL = "YOUR_WORKER_URL_HERE";

// Conversation history (LevelUp: maintains context)
const messages = [
  {
    role: "system",
    content: `
You are a helpful L'Oréal beauty advisor.
You ONLY answer questions about L'Oréal makeup, skincare, haircare, fragrances, and routines.
If asked anything unrelated, you must reply:
"I'm here to help with L'Oréal beauty products and routines only."`
  }
];

function addMessage(text, sender = "ai") {
  const msg = document.createElement("div");
  msg.classList.add("msg", sender);
  msg.textContent = text;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

addMessage("👋 Hi! I'm your L'Oréal beauty assistant.", "ai");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  messages.push({ role: "user", content: text });

  // LevelUp: show latest question
  currentQuestionEl.textContent = `Latest question: "${text}"`;

  userInput.value = "";

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
                  "Sorry, no response.";

    thinking.remove();
    addMessage(reply, "ai");
    messages.push({ role: "assistant", content: reply });

  } catch (err) {
    thinking.remove();
    addMessage("⚠️ Could not connect.", "ai");
  }
});
