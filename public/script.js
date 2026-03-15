const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const attachmentInput = document.getElementById("attachment-input");
const fileNameText = document.getElementById("file-name");
const chatBox = document.getElementById("chat-box");
const submitButton = form?.querySelector("button[type='submit']");

if (
  !form ||
  !input ||
  !attachmentInput ||
  !fileNameText ||
  !chatBox ||
  !submitButton
) {
  throw new Error("Required chat elements are missing in the HTML.");
}

function formatChatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function appendMessage(role, text, fileName) {
  const normalizedRole = role === "bot" ? "assistant" : role;
  const isAssistant = normalizedRole === "assistant";

  const wrapper = document.createElement("div");
  wrapper.className = `chat-message chat-message--${isAssistant ? "assistant" : "user"}`;

  const avatar = document.createElement("div");
  avatar.className = `chat-avatar chat-avatar--${isAssistant ? "assistant" : "user"}`;
  const avatarIcon = document.createElement("i");
  avatarIcon.className = isAssistant ? "ph ph-robot" : "ph ph-user";
  avatar.appendChild(avatarIcon);

  const body = document.createElement("div");
  body.className = "chat-message-body";

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble chat-bubble--${isAssistant ? "assistant" : "user"}`;

  if (fileName) {
    const attachment = document.createElement("div");
    attachment.className = "msg-attachment";
    const icon = document.createElement("i");
    icon.className = "ph ph-paperclip";
    attachment.appendChild(icon);
    attachment.append(` ${fileName}`);
    bubble.appendChild(attachment);
  }

  if (text) {
    const textNode = document.createElement("div");
    textNode.textContent = text;
    bubble.appendChild(textNode);
  }

  const time = document.createElement("div");
  time.className = `chat-time${isAssistant ? "" : " chat-time--user"}`;
  time.textContent = formatChatTime(new Date());

  body.appendChild(bubble);
  body.appendChild(time);
  wrapper.appendChild(avatar);
  wrapper.appendChild(body);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  return wrapper;
}

function getSelectedAttachment() {
  return attachmentInput.files && attachmentInput.files.length > 0
    ? attachmentInput.files[0]
    : null;
}

function updateSelectedFileLabel() {
  const selectedAttachment = getSelectedAttachment();
  fileNameText.textContent = selectedAttachment
    ? `File dipilih: ${selectedAttachment.name}`
    : "Pilih file untuk diunggah";
}

function clearSelectedAttachment() {
  attachmentInput.value = "";
  updateSelectedFileLabel();
}

function setSubmittingState(isSubmitting) {
  input.disabled = isSubmitting;
  attachmentInput.disabled = isSubmitting;
  submitButton.disabled = isSubmitting;
}

async function sendTextMessage(userMessage) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: [{ role: "user", text: userMessage }]
    })
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function sendImageMessage(userMessage, imageFile) {
  const formData = new FormData();
  formData.append("message", userMessage);
  formData.append("image", imageFile);

  const response = await fetch("/generate/text-from-image", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function sendDocumentMessage(userMessage, documentFile) {
  const formData = new FormData();
  formData.append("message", userMessage);
  formData.append("document", documentFile);

  const response = await fetch("/generate/text-from-document", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function getResponseText(payload) {
  const resultText = typeof payload?.result === "string" ? payload.result.trim() : "";
  const messageText = typeof payload?.message === "string" ? payload.message.trim() : "";
  return resultText || messageText;
}

attachmentInput.addEventListener("change", () => {
  updateSelectedFileLabel();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userMessage = input.value.trim();
  const selectedAttachment = getSelectedAttachment();

  if (!userMessage) {
    return;
  }

  if (
    selectedAttachment &&
    !selectedAttachment.type.startsWith("image/") &&
    !selectedAttachment.type.startsWith("application/") &&
    !selectedAttachment.type.startsWith("text/")
  ) {
    appendMessage("bot", "File yang diunggah harus berupa gambar atau dokumen.");
    clearSelectedAttachment();
    return;
  }

  appendMessage("user", userMessage, selectedAttachment?.name);
  input.value = "";
  input.focus();
  setSubmittingState(true);

  const thinkingMessage = appendMessage("assistant", "Thinking...");

  try {
    let payload;
    if (selectedAttachment) {
      if (selectedAttachment.type.startsWith("image/")) {
        payload = await sendImageMessage(userMessage, selectedAttachment);
      } else {
        payload = await sendDocumentMessage(userMessage, selectedAttachment);
      }
    } else {
      payload = await sendTextMessage(userMessage);
    }

    const responseText = getResponseText(payload);
    const bubble = thinkingMessage.querySelector(".chat-bubble");
    if (bubble) {
      bubble.textContent = responseText || "Sorry, no response received.";
    }
  } catch (error) {
    console.error("Chat request failed:", error);
    const bubble = thinkingMessage.querySelector(".chat-bubble");
    if (bubble) {
      bubble.textContent = "Failed to get response from server.";
    }
  } finally {
    setSubmittingState(false);
    clearSelectedAttachment();
  }
});

updateSelectedFileLabel();
