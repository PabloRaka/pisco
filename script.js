const API_URL = "https://n8n.starcore.co.id/webhook/test_ocr";
//https://n8n.starcore.co.id/webhook/chatbot
//https://n8n.starcore.co.id/webhook-test/chatbot
//https://n8n.starcore.co.id/webhook-test/test_ocr
//https://n8n.starcore.co.id/webhook/test_ocr

const messagesContainer = document.getElementById("messages");
const inputField = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const filePreview = document.getElementById("filePreview"); // container preview

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
  const file = fileInput.files[0];

  if (!text && !file) return;

  if (text) addMessage(text, "user");
  if (file) addMessage(`📎 ${file.name}`, "user");

  // reset input
  inputField.value = "";
  inputField.style.height = "36px"; // biar balik 1 baris
  fileInput.value = "";
  filePreview.innerHTML = "";

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

    // 👉 tampilkan hasil sesuai type
    if (data.url && (!data.type || data.type === "image")) {
      addMessage(`<img src="${data.url}" alt="chart" />`, "bot", true);
    }

    if (data.ringkasan_chart) addMessage(data.ringkasan_chart, "bot");

    if (data.rekomendasi && Array.isArray(data.rekomendasi)) {
      const rekomHTML =
        "<ul>" + data.rekomendasi.map((r) => `<li>${r}</li>`).join("") + "</ul>";
      addMessage(rekomHTML, "bot", true);
    }

    if (data.reply && typeof data.reply === "string" && !data.url) {
      addMessage(data.reply, "bot", true);
    }

    // 👉 khusus untuk file tunggal
    if (data.type === "file") {
      const fileHTML = `
        📎 <strong>${data.title || "Dokumen"}</strong><br/>
        <a href="${data.url}" target="_blank" download>Download File</a>
      `;
      addMessage(fileHTML, "bot", true);
    }

    // 👉 khusus untuk multiple files
    if (data.files && Array.isArray(data.files)) {
      data.files.forEach(f => {
        const fileHTML = `
          📎 <strong>${f.title || "Dokumen"}</strong><br/>
          <a href="${f.url}" target="_blank" download>Download File</a>
        `;
        addMessage(fileHTML, "bot", true);
      });
    }

  } catch (err) {
    hideTyping();
    addMessage("❌ Gagal koneksi ke server", "bot");
  }
}

// Event listener
sendBtn.addEventListener("click", sendMessage);
inputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // cegah newline default
    sendMessage();
  }
});

fileInput.addEventListener("change", () => {
  filePreview.innerHTML = ""; // reset preview kalau ganti file
  const files = Array.from(fileInput.files);

  files.forEach((file, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("file-item");

    if (file.type.startsWith("image/")) {
      // preview gambar
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.width = "50px";
      img.style.height = "50px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "6px";
      wrapper.appendChild(img);
    } else {
      // preview nama file
      const div = document.createElement("div");
      div.textContent = `📎 ${file.name}`;
      div.style.fontSize = "12px";
      div.style.background = "#f0f0f0";
      div.style.padding = "4px 6px";
      div.style.borderRadius = "4px";
      wrapper.appendChild(div);
    }

    // ❌ tombol cancel
    const removeBtn = document.createElement("span");
    removeBtn.textContent = "✖";
    removeBtn.style.marginLeft = "6px";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.color = "red";
    removeBtn.onclick = () => {
      const dt = new DataTransfer();
      Array.from(fileInput.files).forEach((f, i) => {
        if (i !== index) dt.items.add(f);
      });
      fileInput.files = dt.files;
      wrapper.remove();
    };

    wrapper.appendChild(removeBtn);
    filePreview.appendChild(wrapper);
  });
});
