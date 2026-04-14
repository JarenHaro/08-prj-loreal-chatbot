/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
let loadingMessageElement = null;

// Show the first assistant message in the chat window.
chatWindow.innerHTML = "";
addMessage("ai", "👋 Hello! How can I help you today?");

// This helper adds a new message to the chat window.
function addMessage(type, text) {
  const row = document.createElement("div");
  row.className = `msg-row ${type}`;

  const bubble = document.createElement("div");
  bubble.className = `msg-bubble ${type}`;
  bubble.textContent = text;

  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return row;
}

function showLoadingMessage() {
  loadingMessageElement = addMessage("ai", "⏳ Let me check that for you...");
}

function hideLoadingMessage() {
  if (loadingMessageElement && loadingMessageElement.parentNode) {
    loadingMessageElement.parentNode.removeChild(loadingMessageElement);
  }

  loadingMessageElement = null;
}
const worker_url = "https://loreal-worker.jaren-haro05.workers.dev/"; // Replace with your Cloudflare Worker URL
/* Handle form submit */
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userMessage = userInput.value.trim();

  if (userMessage === "") {
    return;
  }

  // Show the user's message first.
  addMessage("user", userMessage);
  userInput.value = "";

  showLoadingMessage();
  try {
    const response = await fetch(worker_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful L'Oréal assistant. Answer questions about products, services, routines, and recommendations in a friendly way. You can also provide links to the L'Oréal website for more information. If you don't know the answer, say you don't know instead of making something up. Also, try not to list things too long, i want shorter, to the point responses.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_completion_tokens: 300,
      }),
    });

    const data = await response.json();
    const botMessage = data.choices[0].message.content;

    // Show the assistant's reply in the chat window.
    hideLoadingMessage();
    addMessage("ai", botMessage);
  } catch (error) {
    console.error("API error:", error);
    hideLoadingMessage();
    addMessage(
      "ai",
      "Sorry, I could not get a response right now. Please try again.",
    );
  }
});
