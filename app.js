(() => {
  const data = window.DEMO_DATA;

  const State = {
    GREETING: 0,
    TEACHING_CONFIRM: 1,
    UNDERSTANDING_CHECK: 2,
    NOTES_INSTRUCTIONS: 3,
    NOTES_MODE: 4,
    CONTINUE: 5
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
    return 800 + Math.floor(Math.random() * 401);
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

    return tokensSet.has(normalizedSynonym);
  }

  function buildNeutralRubricStatus() {
    return data.keyPoints.map((point) => ({
      id: point.id,
      label: point.label,
      status: "neutral"
    }));
  }

  function renderRubric() {
    rubricTopicEl.textContent = `Topic: ${data.topic}`;
    rubricListEl.innerHTML = "";

    rubricStatus.forEach((item) => {
      const li = document.createElement("li");
      li.className = "rubric-item";

      const label = document.createElement("span");
      label.textContent = item.label;

      const status = document.createElement("span");
      status.className = `rubric-status ${item.status}`;

      if (item.status === "detected") {
        status.textContent = "✅ Detected";
      } else if (item.status === "missing") {
        status.textContent = "➕ Missing";
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

  function addMessage(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = `bubble ${sender}`;
    bubble.textContent = text;
    chatAreaEl.appendChild(bubble);
    scrollChatToBottom();
  }

  function addTypingBubble() {
    const bubble = document.createElement("div");
    bubble.className = "bubble ai typing-bubble";
    const dots = document.createElement("span");
    dots.className = "typing-dots";
    dots.textContent = "...";
    bubble.appendChild(dots);
    chatAreaEl.appendChild(bubble);
    scrollChatToBottom();
    return bubble;
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

    return data.keyPoints.map((point) => {
      const detected = point.synonyms.some((synonym) =>
        containsSynonym(tokensSet, normalizedText, synonym)
      );

      return {
        id: point.id,
        label: point.label,
        status: detected ? "detected" : "missing"
      };
    });
  }

  function buildNotesFeedback(results) {
    const missing = results.filter((item) => item.status === "missing");
    const detected = results.filter((item) => item.status === "detected");

    const messages = [
      "Great job writing notes—here are a couple suggestions to make them even stronger."
    ];

    if (detected.length > 0) {
      const strengths = detected.map((item) => item.label.toLowerCase()).join(" and ");
      messages.push(`Nice work including ${strengths}.`);
    }

    if (missing.length === 0) {
      messages.push("You captured both key ideas I was looking for. ✅");
      return messages;
    }

    const advice = missing
      .map((item) => {
        if (item.id === "hypothesis") {
          return "add a clear hypothesis or prediction";
        }

        return "mention how the experiment was run and what data/observations were recorded";
      })
      .join(" and ");

    messages.push(`To strengthen your notes, ${advice}.`);

    const rewritePieces = [];
    if (missing.some((item) => item.id === "hypothesis")) {
      rewritePieces.push("Hypothesis: If ___, then ___");
    }

    if (missing.some((item) => item.id === "experiment-data")) {
      rewritePieces.push("Experiment/data: We tested by ___ and observed ___");
    }

    if (rewritePieces.length) {
      messages.push(`Suggested rewrite: ${rewritePieces.join("; ")}.`);
    }

    return messages.slice(0, 4);
  }

  async function handleReadinessInput(rawInput) {
    const input = rawInput.trim().toLowerCase();

    if (input === "not now") {
      await sendAiMessage(data.notReadyReply);
      setQuickReplies(["Yes", "Not now"]);
      return;
    }

    if (input === "yes") {
      conversationState = State.TEACHING_CONFIRM;
      setQuickReplies([]);
      await sendAiMessages([
        data.teachingLead,
        ...data.teachingMessages
      ]);
      await sendAiMessage(data.understandingQuestion);
      conversationState = State.UNDERSTANDING_CHECK;
      setQuickReplies(["I got it", "Repeat it"]);
      return;
    }

    await sendAiMessage(data.readyReminder);
    setQuickReplies(conversationState === State.GREETING ? ["Yes", "Not now"] : ["Yes"]);
  }

  async function handleUnderstandingInput(rawInput) {
    const input = rawInput.trim().toLowerCase();

    if (input === "i got it") {
      await sendAiMessage(data.understandingConfirm);
      await sendAiMessage(data.notesPrompt);
      conversationState = State.NOTES_INSTRUCTIONS;
      setQuickReplies(["Yes"]);
      return;
    }

    if (input === "repeat it") {
      await sendAiMessages([data.understandingRepeat, data.understandingQuestion]);
      setQuickReplies(["I got it", "Repeat it"]);
      return;
    }

    await sendAiMessage(data.understandingReminder);
    setQuickReplies(["I got it", "Repeat it"]);
  }

  async function handleNotesSubmission(text) {
    rubricStatus = analyzeNotes(text);
    renderRubric();

    const feedbackMessages = buildNotesFeedback(rubricStatus);
    await sendAiMessages(feedbackMessages);

    conversationState = State.CONTINUE;
    setQuickReplies(["Try again", "Restart lesson"]);
  }

  async function handleContinueInput(rawInput) {
    const input = rawInput.trim().toLowerCase();

    if (input === "try again") {
      conversationState = State.NOTES_MODE;
      setQuickReplies(["Try again", "Restart lesson"]);
      await sendAiMessage("Awesome effort. Send your revised notes and I’ll check them again.");
      return;
    }

    if (input === "restart lesson") {
      await restartLesson();
      return;
    }

    await sendAiMessage("Use ‘Try again’ to revise your notes, or ‘Restart lesson’ to begin from the top.");
    setQuickReplies(["Try again", "Restart lesson"]);
  }

  async function handleUserInput(rawInput) {
    const text = rawInput.trim();
    if (!text) {
      return;
    }

    addMessage(text, "user");

    if (conversationState === State.GREETING || conversationState === State.TEACHING_CONFIRM) {
      await handleReadinessInput(text);
      return;
    }

    if (conversationState === State.NOTES_INSTRUCTIONS) {
      if (text.toLowerCase() === "yes") {
        conversationState = State.NOTES_MODE;
        setQuickReplies([]);
        await sendAiMessage(data.notesInstructions);
      } else {
        await sendAiMessage(data.readyReminder);
        setQuickReplies(["Yes"]);
      }
      return;
    }

    if (conversationState === State.UNDERSTANDING_CHECK) {
      await handleUnderstandingInput(text);
      return;
    }

    if (conversationState === State.NOTES_MODE) {
      await handleNotesSubmission(text);
      return;
    }

    await handleContinueInput(text);
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
    if (data.googleForm) {
      if (feedbackIframeEl) {
        feedbackIframeEl.src = data.googleForm.iframeSrc;
      }

      if (feedbackOpenLinkEl) {
        feedbackOpenLinkEl.href = data.googleForm.openUrl;
      }
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
