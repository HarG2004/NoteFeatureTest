(() => {
  const data = window.DEMO_DATA;

  const State = {
    GREETING: 0,
    WAITING_FOR_NOTES: 1
  };

  const chatAreaEl = document.getElementById("chatArea");
  const quickRepliesEl = document.getElementById("quickReplies");
  const composerFormEl = document.getElementById("composerForm");
  const messageInputEl = document.getElementById("messageInput");
  const rubricTopicEl = document.getElementById("rubricTopic");
  const rubricListEl = document.getElementById("rubricList");
  const feedbackIframeEl = document.getElementById("feedbackIframe");
  const feedbackOpenLinkEl = document.getElementById("feedbackOpenLink");

  let conversationState = State.GREETING;
  let rubricStatus = buildNeutralRubricStatus();

  function randomDelay() {
    return 1000 + Math.floor(Math.random() * 2001);
  }

  function normalizeText(value) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenize(value) {
    const normalized = normalizeText(value);
    return normalized ? normalized.split(" ") : [];
  }

  function containsSynonym(tokensSet, normalizedText, synonym) {
    const normalizedSynonym = normalizeText(synonym);
    if (!normalizedSynonym) {
      return false;
    }

    if (normalizedSynonym.includes(" ")) {
      return normalizedText.includes(normalizedSynonym);
    }

    if (tokensSet.has(normalizedSynonym)) {
      return true;
    }

    for (const token of tokensSet) {
      if (
        (token.length >= 4 && normalizedSynonym.startsWith(token)) ||
        (normalizedSynonym.length >= 4 && token.startsWith(normalizedSynonym))
      ) {
        return true;
      }
    }

    return false;
  }

  function getTopicTokenSet() {
    const topicText = [
      data.topicName,
      data.topicParagraph,
      ...(data.teachingBullets || [])
    ].join(" ");

    return new Set(tokenize(topicText));
  }

  function isSomewhatRelatedToTopic(text) {
    const noteTokens = tokenize(text);
    const topicTokens = getTopicTokenSet();

    const relatedTokenCount = noteTokens.filter((token) => topicTokens.has(token)).length;
    return relatedTokenCount >= 2;
  }

  function buildNeutralRubricStatus() {
    return data.keyPoints.map((point) => ({
      id: point.id,
      label: point.label,
      status: "neutral"
    }));
  }

  function renderRubric() {
    rubricTopicEl.textContent = `Topic: ${data.topicName}`;
    rubricListEl.innerHTML = "";

    rubricStatus.forEach((item) => {
      const li = document.createElement("li");
      li.className = "rubric-item";

      const label = document.createElement("span");
      label.textContent = item.label;

      const status = document.createElement("span");
      status.className = `rubric-status ${item.status}`;
      if (item.status === "detected") {
        status.textContent = "✅ Mentioned";
      } else if (item.status === "could-add") {
        status.textContent = "➕ Could add";
      } else {
        status.textContent = "• Not checked";
      }

      li.append(label, status);
      rubricListEl.appendChild(li);
    });
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

  function addMessage(text, sender) {
    const row = document.createElement("div");
    row.className = `message-row ${sender}`;

    const bubble = document.createElement("div");
    bubble.className = `bubble ${sender}`;
    bubble.textContent = text;

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

  async function sendAiMessage(text) {
    const typingBubble = addTypingBubble();
    await new Promise((resolve) => window.setTimeout(resolve, randomDelay()));
    typingBubble.remove();
    addMessage(text, "ai");
  }

  async function sendAiMessages(messages) {
    for (const message of messages) {
      await sendAiMessage(message);
    }
  }

  function setQuickReplies(labels) {
    quickRepliesEl.innerHTML = "";

    labels.forEach((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.dataset.value = label;
      quickRepliesEl.appendChild(button);
    });
  }

  function analyzeNotes(text) {
    const normalizedText = normalizeText(text);
    const tokensSet = new Set(tokenize(text));

    return data.keyPoints.map((point) => ({
      id: point.id,
      label: point.label,
      status: point.synonyms.some((synonym) =>
        containsSynonym(tokensSet, normalizedText, synonym)
      )
        ? "detected"
        : "could-add"
    }));
  }

  function buildNotesFeedback(results, noteText) {
    const detected = results.filter((item) => item.status === "detected");
    const couldAdd = results.filter((item) => item.status === "could-add");
    const somewhatRelated = detected.length > 0 || isSomewhatRelatedToTopic(noteText);

    if (somewhatRelated) {
      const messages = [
        "Nice work—your notes connect to the topic and are on the right track.",
        "If you want to make them even stronger, you could add a little more detail."
      ];

      if (couldAdd.some((item) => item.id === "clear-thinking-evidence")) {
        messages.push("Suggestion: explain how your idea uses clear thinking and evidence.");
      }

      if (couldAdd.some((item) => item.id === "test-observations-data")) {
        messages.push("Suggestion: include how testing produced observations, data, or results.");
      }

      return messages;
    }

    return [
      "Thanks for sharing your notes.",
      `To help them match this topic even more, try adding one line about ${data.topicName} and how evidence or testing supports an idea.`,
      "Tip: even a short note is enough as long as it connects to the lesson."
    ];
  }

  function buildTeachingSequence() {
    const bulletMessage = data.teachingBullets.map((bullet) => `• ${bullet}`).join("\n");
    return [
      data.teachingIntro,
      data.topicParagraph,
      bulletMessage,
      data.notesPrompt
    ];
  }

  async function handleGreetingInput(rawInput) {
    const input = rawInput.trim().toLowerCase();

    if (input === "not now") {
      await sendAiMessage(data.notReadyReply);
      setQuickReplies(["Yes", "Not now"]);
      return;
    }

    if (input === "yes") {
      setQuickReplies([]);
      await sendAiMessages(buildTeachingSequence());
      conversationState = State.WAITING_FOR_NOTES;
      setQuickReplies(["Send revised notes", "Restart"]);
      return;
    }

    await sendAiMessage(data.readyReminder);
    setQuickReplies(["Yes", "Not now"]);
  }

  async function handleNotesSubmission(text) {
    rubricStatus = analyzeNotes(text);
    renderRubric();

    const feedbackMessages = buildNotesFeedback(rubricStatus, text);
    await sendAiMessages(feedbackMessages);

    conversationState = State.WAITING_FOR_NOTES;
    setQuickReplies(["Send revised notes", "Restart"]);
  }

  async function handleNotesModeInput(rawInput) {
    const input = rawInput.trim().toLowerCase();

    if (input === "restart") {
      await restartLesson();
      return;
    }

    if (input === "send revised notes") {
      await sendAiMessage("Go ahead! Send your revised notes when you're ready.");
      conversationState = State.WAITING_FOR_NOTES;
      setQuickReplies(["Send revised notes", "Restart"]);
      messageInputEl.focus();
      return;
    }

    await handleNotesSubmission(rawInput);
  }

  async function handleUserInput(rawInput) {
    const text = rawInput.trim();
    if (!text) {
      return;
    }

    addMessage(text, "user");

    if (conversationState === State.GREETING) {
      await handleGreetingInput(text);
      return;
    }

    await handleNotesModeInput(text);
  }

  async function restartLesson() {
    conversationState = State.GREETING;
    rubricStatus = buildNeutralRubricStatus();
    renderRubric();

    chatAreaEl.innerHTML = "";
    setQuickReplies(["Yes", "Not now"]);
    await sendAiMessage(data.greeting);
  }

  async function onQuickReplyClick(event) {
    const btn = event.target.closest("button[data-value]");
    if (!btn) {
      return;
    }

    await handleUserInput(btn.dataset.value);
  }

  async function onComposerSubmit(event) {
    event.preventDefault();
    const text = messageInputEl.value;
    messageInputEl.value = "";
    await handleUserInput(text);
    messageInputEl.focus();
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

  async function init() {
    wireGoogleFormValues();
    renderRubric();

    quickRepliesEl.addEventListener("click", onQuickReplyClick);
    composerFormEl.addEventListener("submit", onComposerSubmit);

    await restartLesson();
  }

  init();
})();
