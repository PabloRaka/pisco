const API_URL = "https://n8n.starcore.co.id/webhook/chatbot";
//https://n8n.starcore.co.id/webhook/chatbot
//https://n8n.starcore.co.id/webhook-test/chatbot

const messagesContainer = document.getElementById("messages");
const inputField = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Tambah pesan ke chatbox
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
  time.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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

// Kirim pesan ke server
async function sendMessage() {
  const text = inputField.value.trim();
  const file = document.getElementById("fileInput").files[0];

  if (!text && !file) return;

  if (text) addMessage(text, "user");
  if (file) addMessage(`📎 ${file.name}`, "user");

  inputField.value = "";
  document.getElementById("fileInput").value = "";

  showTyping();

  try {
    const formData = new FormData();
    formData.append("message", text || "");
    if (file) formData.append("file", file);

    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    hideTyping();

    // tampilkan hasil
    if (data.url) addMessage(`<img src="${data.url}" alt="chart" />`, "bot", true);
    if (data.ringkasan_chart) addMessage(data.ringkasan_chart, "bot");
    if (data.rekomendasi && Array.isArray(data.rekomendasi)) {
      const rekomHTML =
        "<ul>" + data.rekomendasi.map((r) => `<li>${r}</li>`).join("") + "</ul>";
      addMessage(rekomHTML, "bot", true);
    }
    if (data.reply && typeof data.reply === "string" && !data.url) {
      addMessage(data.reply, "bot", true);
    }
  } catch (err) {
    hideTyping();
    addMessage("❌ Gagal koneksi ke server", "bot");
  }
}

// Toggle chatbox
//const toggleBtn = document.getElementById("chat-toggle");
//const chatbox = document.getElementById("chatbox");

//toggleBtn.addEventListener("click", () => {
//  chatbox.classList.toggle("hidden");
//});

// Event listener
sendBtn.addEventListener("click", sendMessage);
inputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
