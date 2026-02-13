(function () {
  const lessonTitleEl = document.getElementById("lessonTitle");
  const lessonParagraphEl = document.getElementById("lessonParagraph");
  const notesTextEl = document.getElementById("notesText");
  const presetSelectorEl = document.getElementById("presetSelector");
  const chatAreaEl = document.getElementById("chatArea");
  const feedbackBtn = document.getElementById("feedbackBtn");
  const resetBtn = document.getElementById("resetBtn");
  const feedbackIframe = document.getElementById("feedbackIframe");
  const feedbackLink = document.getElementById("feedbackLink");

  const defaultPresetId = DEMO.presets[0].id;
  let selectedPresetId = defaultPresetId;

  function getPresetById(id) {
    return DEMO.presets.find((preset) => preset.id === id) || DEMO.presets[0];
  }

  function renderNeutralChat() {
    chatAreaEl.innerHTML = "";
    const bubble = document.createElement("div");
    bubble.className = "bubble neutral";
    bubble.textContent = "Ready when you are.";
    chatAreaEl.appendChild(bubble);
  }

  function renderAiMessages(messages) {
    chatAreaEl.innerHTML = "";
    messages.forEach((message) => {
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.textContent = message;
      chatAreaEl.appendChild(bubble);
    });
    chatAreaEl.scrollTop = chatAreaEl.scrollHeight;
  }

  function setActivePreset(id) {
    selectedPresetId = id;
    const preset = getPresetById(id);
    notesTextEl.value = preset.notesText;

    Array.from(presetSelectorEl.querySelectorAll(".preset-btn")).forEach((button) => {
      button.classList.toggle("active", button.dataset.presetId === id);
    });

    renderNeutralChat();
  }

  function renderPresetButtons() {
    presetSelectorEl.innerHTML = "";
    DEMO.presets.forEach((preset) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "preset-btn";
      button.dataset.presetId = preset.id;
      button.textContent = preset.label;
      button.addEventListener("click", () => setActivePreset(preset.id));
      presetSelectorEl.appendChild(button);
    });
  }

  function showTyping() {
    chatAreaEl.innerHTML = "";
    const typingBubble = document.createElement("div");
    typingBubble.className = "bubble";

    const dots = document.createElement("span");
    dots.className = "typing";
    dots.textContent = "...";

    typingBubble.appendChild(dots);
    chatAreaEl.appendChild(typingBubble);
  }

  feedbackBtn.addEventListener("click", () => {
    feedbackBtn.disabled = true;
    showTyping();

    const waitMs = Math.floor(Math.random() * 401) + 800;
    const preset = getPresetById(selectedPresetId);

    window.setTimeout(() => {
      renderAiMessages(preset.aiMessages);
      feedbackBtn.disabled = false;
    }, waitMs);
  });

  resetBtn.addEventListener("click", () => {
    feedbackBtn.disabled = false;
    setActivePreset(defaultPresetId);
  });

  function init() {
    lessonTitleEl.textContent = DEMO.lessonTitle;
    lessonParagraphEl.textContent = DEMO.lessonParagraph;

    feedbackIframe.src = DEMO.googleForm.iframeSrc;
    feedbackLink.href = DEMO.googleForm.openUrl;

    renderPresetButtons();
    setActivePreset(defaultPresetId);
  }

  init();
})();
