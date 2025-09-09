const API_URL = "https://n8n.starcore.co.id/webhook/chatbot";
const messagesContainer = document.getElementById("messages");
const inputField = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Tambah pesan
function addMessage(text, sender, isHTML = false) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("message-wrapper", sender);

  const bubble = document.createElement("div");
  bubble.classList.add("message");
  if (isHTML) {
    bubble.innerHTML = text;
  } else {
    bubble.textContent = text;
  }

  const time = document.createElement("div");
  time.classList.add("timestamp");
  time.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  wrapper.appendChild(bubble);
  wrapper.appendChild(time);
  messagesContainer.appendChild(wrapper);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Typing indicator
function showTyping() {
  const typing = document.createElement("div");
  typing.id = "typing";
  typing.classList.add("message-wrapper", "bot");
  typing.innerHTML = `<div class="message typing">
    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
  </div>`;
  messagesContainer.appendChild(typing);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
function hideTyping() {
  const typing = document.getElementById("typing");
  if (typing) typing.remove();
}

// Kirim pesan
async function sendMessage() {
  const text = inputField.value.trim();
  if (!text) return;

  addMessage(text, "user");
  inputField.value = "";

  // tampilkan typing
  showTyping();

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();

    // hapus typing, tampilkan balasan
    hideTyping();
    addMessage(data.reply || "Bot tidak merespon", "bot", true);
  } catch (err) {
    hideTyping();
    addMessage("❌ Gagal koneksi ke server", "bot");
  }
}

// Event listener
sendBtn.addEventListener("click", sendMessage);
inputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
