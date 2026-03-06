(() => {
  const data = window.DEMO_DATA;

  const chatAreaEl = document.getElementById("chatArea");
  const actionButtonsEl = document.getElementById("actionButtons");
  const notesFormEl = document.getElementById("notesForm");
  const notesInputEl = document.getElementById("notesInput");
  const getFeedbackBtnEl = document.getElementById("getFeedbackBtn");
  const feedbackIframeEl = document.getElementById("feedbackIframe");
  const feedbackOpenLinkEl = document.getElementById("feedbackOpenLink");

  const conversationState = {
    topicIndex: 0,
    lessonShown: false,
    hasRequestedFeedbackForTopic: false,
    isSubmittingFeedback: false
  };

  function currentTopic() {
    return data.topics[conversationState.topicIndex];
  }

  function hasNextTopic() {
    return conversationState.topicIndex < data.topics.length - 1;
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

  function setFeedbackButtonState() {
    const disabled =
      !conversationState.lessonShown || conversationState.isSubmittingFeedback;
    getFeedbackBtnEl.disabled = disabled;
    notesInputEl.disabled = conversationState.isSubmittingFeedback;
  }

  function clearActionButtons() {
    actionButtonsEl.innerHTML = "";
  }

  function createActionButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pill-button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function renderActionButtons() {
    clearActionButtons();

    if (!conversationState.lessonShown) {
      actionButtonsEl.appendChild(
        createActionButton("Yes", async () => {
          addMessage("Yes", "user");
          conversationState.lessonShown = true;
          setFeedbackButtonState();
          renderActionButtons();
          await sendAiMessage(currentTopic().lessonHtml, { isHtml: true });
        })
      );
      return;
    }

    if (conversationState.hasRequestedFeedbackForTopic && hasNextTopic()) {
      actionButtonsEl.appendChild(
        createActionButton("Next subject", async () => {
          addMessage("Next subject", "user");
          conversationState.topicIndex += 1;
          conversationState.lessonShown = false;
          conversationState.hasRequestedFeedbackForTopic = false;
          notesInputEl.value = "";
          setFeedbackButtonState();
          renderActionButtons();
          await sendAiMessage(
            `Are you ready to learn about ${currentTopic().title}?`
          );
        })
      );
    }
  }

  async function fetchFeedbackFromApi(notes, topicId) {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        topicId,
        notes
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

    const notes = notesInputEl.value.trim();
    if (!notes || !conversationState.lessonShown) {
      return;
    }

    addMessage(notes, "user");

    conversationState.isSubmittingFeedback = true;
    setFeedbackButtonState();

    try {
      const feedback = await fetchFeedbackFromApi(notes, currentTopic().id);
      conversationState.hasRequestedFeedbackForTopic = true;
      await sendAiMessage(feedback);
      renderActionButtons();
    } catch (error) {
      await sendAiMessage(
        "You’re doing great—please try again in a moment so I can share feedback."
      );
    } finally {
      conversationState.isSubmittingFeedback = false;
      setFeedbackButtonState();
    }
  }

  async function init() {
    wireGoogleFormValues();
    notesFormEl.addEventListener("submit", onNotesSubmit);
    setFeedbackButtonState();
    renderActionButtons();
    await sendAiMessage(`Are you ready to learn about ${currentTopic().title}?`);
  }

  init();
})();
