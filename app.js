(() => {
  const data = window.DEMO_DATA;

  const chatAreaEl = document.getElementById("chatArea");
  const notesFormEl = document.getElementById("notesForm");
  const notesInputEl = document.getElementById("notesInput");
  const getFeedbackBtnEl = document.getElementById("getFeedbackBtn");
  const feedbackIframeEl = document.getElementById("feedbackIframe");
  const feedbackOpenLinkEl = document.getElementById("feedbackOpenLink");

  const conversationState = {
    step: "awaiting-topic-consent"
  };

  function isYes(text) {
    const normalized = text.trim().toLowerCase();
    return ["yes", "y", "yeah", "yep", "sure", "ok", "okay"].includes(
      normalized
    );
  }

  function isNo(text) {
    const normalized = text.trim().toLowerCase();
    return ["no", "n", "nope", "nah"].includes(normalized);
  }

  function updateComposerForState() {
    if (!getFeedbackBtnEl) {
      return;
    }

    if (conversationState.step === "collecting-notes") {
      notesInputEl.placeholder = "Type your notes for this topic...";
      getFeedbackBtnEl.textContent = "Send notes";
      return;
    }

    notesInputEl.placeholder = "Type yes or no...";
    getFeedbackBtnEl.textContent = "Send";
  }

  function randomDelay() {
    return 1000 + Math.floor(Math.random() * 2001);
  }

  function scrollChatToBottom() {
    chatAreaEl.scrollTop = chatAreaEl.scrollHeight;
  }

  function createAvatar(sender) {
    const avatar = document.createElement("span");
    avatar.className = `avatar ${sender}`;
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = sender === "ai" ? "AI" : "You";
    return avatar;
  }

  function addMessage(content, sender, options = {}) {
    const row = document.createElement("div");
    row.className = `message-row ${sender}`;

    const bubble = document.createElement("div");
    bubble.className = `bubble ${sender}`;

    if (options.isHtml) {
      bubble.innerHTML = content;
    } else {
      bubble.textContent = content;
    }

    if (sender === "ai") {
      row.append(createAvatar("ai"), bubble);
    } else {
      row.append(bubble, createAvatar("user"));
    }

    chatAreaEl.appendChild(row);
    scrollChatToBottom();
  }

  function addTypingBubble() {
    const row = document.createElement("div");
    row.className = "message-row ai typing-row";

    const bubble = document.createElement("div");
    bubble.className = "bubble ai typing-bubble";

    const dotsWrap = document.createElement("span");
    dotsWrap.className = "typing-dots";

    for (let i = 0; i < 3; i += 1) {
      const dot = document.createElement("span");
      dot.className = "dot";
      dotsWrap.appendChild(dot);
    }

    bubble.appendChild(dotsWrap);
    row.append(createAvatar("ai"), bubble);
    chatAreaEl.appendChild(row);
    scrollChatToBottom();
    return row;
  }

  async function sendAiMessage(content, options = {}) {
    const typingBubble = addTypingBubble();
    await new Promise((resolve) => window.setTimeout(resolve, randomDelay()));
    typingBubble.remove();
    addMessage(content, "ai", options);
  }

  async function fetchFeedbackFromApi(notes) {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        notes,
        topicId: data.topicId
      })
    });

    if (!response.ok) {
      throw new Error("Feedback request failed");
    }

    const body = await response.json();
    if (!body || typeof body.reply !== "string" || !body.reply.trim()) {
      throw new Error("Invalid feedback response");
    }

    return body.reply.trim();
  }

  function wireGoogleFormValues() {
    if (!data.googleForm) {
      return;
    }

    if (feedbackIframeEl) {
      feedbackIframeEl.src = data.googleForm.iframeSrc;
    }

    if (feedbackOpenLinkEl) {
      feedbackOpenLinkEl.href = data.googleForm.openUrl;
    }
  }

  async function onNotesSubmit(event) {
    event.preventDefault();

    const userInput = notesInputEl.value.trim();
    if (!userInput) {
      return;
    }

    notesInputEl.value = "";

    addMessage(userInput, "user");

    if (conversationState.step === "awaiting-topic-consent") {
      if (isYes(userInput)) {
        await sendAiMessage(data.lessonHtml, { isHtml: true });
        await sendAiMessage(
          "Would you like to submit your notes now? Reply yes or no."
        );
        conversationState.step = "awaiting-notes-consent";
        updateComposerForState();
        return;
      }

      if (isNo(userInput)) {
        await sendAiMessage(
          "No problem. Let me know when you want to continue to the topic by replying yes."
        );
        return;
      }

      await sendAiMessage(
        "Please reply with yes or no so I can continue to the topic."
      );
      return;
    }

    if (conversationState.step === "awaiting-notes-consent") {
      if (isYes(userInput)) {
        conversationState.step = "collecting-notes";
        updateComposerForState();
        await sendAiMessage(
          "Great—type your notes in the text message area, then press Send notes."
        );
        return;
      }

      if (isNo(userInput)) {
        await sendAiMessage(
          "Okay. Reply yes when you are ready to submit notes."
        );
        return;
      }

      await sendAiMessage(
        "Please reply with yes or no. Do you want to submit notes now?"
      );
      return;
    }

    const notes = userInput;

    try {
      const feedback = await fetchFeedbackFromApi(notes);
      await sendAiMessage(feedback);
      await sendAiMessage(
        "If you want to send updated notes, type them in the text message area and press Send notes."
      );
    } catch (error) {
      await sendAiMessage(
        "You’re doing great—please try again in a moment so I can share feedback."
      );
    }
  }

  async function init() {
    wireGoogleFormValues();
    notesFormEl.addEventListener("submit", onNotesSubmit);
    updateComposerForState();
    await sendAiMessage(
      "Would you like to continue to the topic? Reply yes or no."
    );
  }

  init();
})();
