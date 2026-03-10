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
    sectionIndex: -1,
    hasCompletedTopicLesson: false,
    canMoveToNextTopic: false,
    notesFlowState: "undecided",
    hasSubmittedNotesForTopic: false,
    isSubmittingFeedback: false
  };

  function currentTopic() {
    return data.topics[conversationState.topicIndex];
  }

  function hasNextTopic() {
    return conversationState.topicIndex < data.topics.length - 1;
  }

  function getTopicSections(topic) {
    if (Array.isArray(topic.lessonSections) && topic.lessonSections.length > 0) {
      return topic.lessonSections;
    }

    const parser = new window.DOMParser();
    const doc = parser.parseFromString(topic.lessonHtml, "text/html");
    const nodes = Array.from(doc.body.children);
    const sections = [];

    let headingHtml = "";
    let currentSectionTitle = "";
    let currentSectionNodes = [];

    nodes.forEach((node) => {
      if (node.tagName === "H2") {
        headingHtml = node.outerHTML;
        return;
      }

      if (node.tagName === "H3") {
        if (currentSectionNodes.length > 0) {
          sections.push({
            title: currentSectionTitle,
            html: `${currentSectionNodes.join("")}`
          });
        }
        currentSectionTitle = node.textContent.trim();
        currentSectionNodes = [node.outerHTML];
        return;
      }

      currentSectionNodes.push(node.outerHTML);
    });

    if (currentSectionNodes.length > 0) {
      sections.push({
        title: currentSectionTitle,
        html: `${currentSectionNodes.join("")}`
      });
    }

    if (sections.length === 0) {
      return [
        {
          title: topic.title,
          html: topic.lessonHtml
        }
      ];
    }

    return sections.map((section, index) => {
      const sectionHeader = `<p><strong>Section ${index + 1} of ${sections.length}:</strong> ${section.title}</p>`;
      const topicHeading = index === 0 ? headingHtml : "";
      return {
        title: section.title,
        html: `${topicHeading}${sectionHeader}${section.html}`
      };
    });
  }

  function getCurrentSections() {
    return getTopicSections(currentTopic());
  }

  function hasMoreSectionsInTopic() {
    return conversationState.sectionIndex < getCurrentSections().length - 1;
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
      !conversationState.hasCompletedTopicLesson ||
      conversationState.isSubmittingFeedback;
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

    const shouldShowNextSubjectButton =
      conversationState.hasCompletedTopicLesson && hasNextTopic();

    const createNextSubjectButton = () =>
      createActionButton("Next subject", async () => {
        addMessage("Next subject", "user");
        conversationState.topicIndex += 1;
        conversationState.sectionIndex = -1;
        conversationState.hasCompletedTopicLesson = false;
        conversationState.canMoveToNextTopic = false;
        conversationState.notesFlowState = "undecided";
        conversationState.hasSubmittedNotesForTopic = false;
        notesInputEl.value = "";
        setFeedbackButtonState();
        renderActionButtons();
        await sendAiMessage(`Are you ready to learn about ${currentTopic().title}?`);
      });

    if (conversationState.sectionIndex < 0) {
      actionButtonsEl.appendChild(
        createActionButton("Yes", async () => {
          addMessage("Yes", "user");
          conversationState.sectionIndex = 0;
          setFeedbackButtonState();
          renderActionButtons();
          await sendAiMessage(getCurrentSections()[conversationState.sectionIndex].html, {
            isHtml: true
          });
        })
      );
      return;
    }

    if (!conversationState.hasCompletedTopicLesson && hasMoreSectionsInTopic()) {
      actionButtonsEl.appendChild(
        createActionButton("Next section", async () => {
          addMessage("Next section", "user");
          conversationState.sectionIndex += 1;

          if (!hasMoreSectionsInTopic()) {
            conversationState.hasCompletedTopicLesson = true;
          }

          setFeedbackButtonState();
          renderActionButtons();
          await sendAiMessage(getCurrentSections()[conversationState.sectionIndex].html, {
            isHtml: true
          });
          if (!hasMoreSectionsInTopic()) {
            await sendAiMessage(
              "Would you like to submit your notes? You can also move onto the next subject."
            );
          }
        })
      );
      return;
    }

    if (conversationState.hasCompletedTopicLesson && conversationState.notesFlowState === "undecided") {
      actionButtonsEl.append(
        createActionButton("Submit notes", async () => {
          addMessage("Submit notes", "user");
          conversationState.notesFlowState = "taking";
          renderActionButtons();
          await sendAiMessage(
            "Great—submit your notes whenever you're ready. You can send updated notes as many times as you'd like."
          );
        }),
        createNextSubjectButton()
      );
      return;
    }

    if (shouldShowNextSubjectButton) {
      actionButtonsEl.appendChild(createNextSubjectButton());
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
    if (!notes || !conversationState.hasCompletedTopicLesson) {
      return;
    }

    addMessage(notes, "user");

    conversationState.isSubmittingFeedback = true;
    setFeedbackButtonState();

    try {
      const feedback = await fetchFeedbackFromApi(notes, currentTopic().id);
      conversationState.notesFlowState = "taking";
      conversationState.hasSubmittedNotesForTopic = true;
      conversationState.canMoveToNextTopic = true;
      await sendAiMessage(feedback);
      if (hasNextTopic()) {
        await sendAiMessage(
          "Would you like to move on to the next topic? You can also resubmit notes if you want more feedback."
        );
      } else {
        await sendAiMessage(
          "Nice work finishing the last topic. You can still resubmit notes if you want more feedback."
        );
      }
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
