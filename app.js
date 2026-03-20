(() => {
  const data = window.DEMO_DATA;

  const chatAreaEl = document.getElementById("chatArea");
  const actionButtonsEl = document.getElementById("actionButtons");
  const notesFormEl = document.getElementById("notesForm");
  const notesInputEl = document.getElementById("notesInput");
  const notesScopeSelectEl = document.getElementById("notesScopeSelect");
  const scopeHintEl = document.getElementById("scopeHint");
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
    isSubmittingFeedback: false,
    selectedNotesScope: "topic"
  };

  function currentTopic() {
    return data.topics[conversationState.topicIndex];
  }

  function hasNextTopic() {
    return conversationState.topicIndex < data.topics.length - 1;
  }

  function getTopicSections(topic) {
    if (Array.isArray(topic.lessonSections) && topic.lessonSections.length > 0) {
      return topic.lessonSections.map((section, index) => ({
        sectionTitle: section.sectionTitle,
        sectionContentHtml: section.sectionContentHtml,
        guidanceSentence: section.guidanceSentence,
        html: `<p><strong>Section ${index + 1} of ${topic.lessonSections.length}:</strong> ${section.sectionTitle}</p>${section.sectionContentHtml}`
      }));
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
            sectionTitle: currentSectionTitle,
            sectionContentHtml: `${currentSectionNodes.join("")}`,
            guidanceSentence: "Review the key ideas in this section and note the main points."
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
        sectionTitle: currentSectionTitle,
        sectionContentHtml: `${currentSectionNodes.join("")}`,
        guidanceSentence: "Review the key ideas in this section and note the main points."
      });
    }

    if (sections.length === 0) {
      return [
        {
          sectionTitle: topic.title,
          sectionContentHtml: topic.lessonHtml,
          guidanceSentence: "Review the key ideas in this section and note the main points."
        }
      ];
    }

    return sections.map((section, index) => {
      const sectionHeader = `<p><strong>Section ${index + 1} of ${sections.length}:</strong> ${section.sectionTitle}</p>`;
      const topicHeading = index === 0 ? headingHtml : "";
      return {
        sectionTitle: section.sectionTitle,
        sectionContentHtml: section.sectionContentHtml,
        guidanceSentence: section.guidanceSentence,
        html: `${topicHeading}${sectionHeader}${section.sectionContentHtml}`
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

  function getSelectedScopeDetails() {
    const sections = getCurrentSections();
    if (conversationState.selectedNotesScope === "topic") {
      return {
        scope: "topic",
        label: `Whole topic: ${currentTopic().title}`,
        description: `Feedback will use all sections in ${currentTopic().title}.`
      };
    }

    const sectionIndex = Number.parseInt(
      conversationState.selectedNotesScope.replace("section-", ""),
      10
    );
    const selectedSection = sections[sectionIndex];

    if (!selectedSection) {
      return {
        scope: "topic",
        label: `Whole topic: ${currentTopic().title}`,
        description: `Feedback will use all sections in ${currentTopic().title}.`
      };
    }

    return {
      scope: "section",
      sectionIndex,
      sectionTitle: selectedSection.sectionTitle,
      label: `Section ${sectionIndex + 1}: ${selectedSection.sectionTitle}`,
      description: `Feedback will only use Section ${sectionIndex + 1} of ${currentTopic().title}.`
    };
  }

  function updateScopeHint() {
    const details = getSelectedScopeDetails();
    scopeHintEl.textContent = details.description;
  }

  function populateNotesScopeOptions() {
    const topic = currentTopic();
    const sections = getCurrentSections();

    notesScopeSelectEl.innerHTML = "";

    const topicOption = document.createElement("option");
    topicOption.value = "topic";
    topicOption.textContent = `Whole topic: ${topic.title}`;
    notesScopeSelectEl.appendChild(topicOption);

    sections.forEach((section, index) => {
      const option = document.createElement("option");
      option.value = `section-${index}`;
      option.textContent = `Section ${index + 1}: ${section.sectionTitle}`;
      notesScopeSelectEl.appendChild(option);
    });

    if (!Array.from(notesScopeSelectEl.options).some((option) => option.value === conversationState.selectedNotesScope)) {
      conversationState.selectedNotesScope = "topic";
    }

    notesScopeSelectEl.value = conversationState.selectedNotesScope;
    updateScopeHint();
  }

  function setFeedbackButtonState() {
    const hasNotes = Boolean(notesInputEl.value.trim());
    getFeedbackBtnEl.disabled = !hasNotes || conversationState.isSubmittingFeedback;
    notesInputEl.disabled = conversationState.isSubmittingFeedback;
    notesScopeSelectEl.disabled = conversationState.isSubmittingFeedback;
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

  function formatGuidanceMessage(guidanceSentence) {
    const trimmedGuidance = (guidanceSentence || "").trim();
    if (!trimmedGuidance) {
      return "Guidance: Review the key ideas in this section and note the main points.";
    }

    if (trimmedGuidance.startsWith("Guidance:")) {
      return trimmedGuidance;
    }

    return `Guidance: ${trimmedGuidance}`;
  }

  async function sendSectionAndGuidance(section) {
    await sendAiMessage(section.html, {
      isHtml: true
    });
    await sendAiMessage(formatGuidanceMessage(section.guidanceSentence));
  }

  async function sendTopicCompletionPromptIfNeeded() {
    if (!hasMoreSectionsInTopic()) {
      conversationState.hasCompletedTopicLesson = true;
      await sendAiMessage(
        "You can submit notes now for the whole topic or just the section you choose in the dropdown. You can also move onto the next subject whenever you're ready."
      );
    }
  }

  function resetTopicState() {
    conversationState.sectionIndex = -1;
    conversationState.hasCompletedTopicLesson = false;
    conversationState.canMoveToNextTopic = false;
    conversationState.notesFlowState = "undecided";
    conversationState.hasSubmittedNotesForTopic = false;
    conversationState.selectedNotesScope = "topic";
    notesInputEl.value = "";
    populateNotesScopeOptions();
    setFeedbackButtonState();
    renderActionButtons();
  }

  function renderActionButtons() {
    clearActionButtons();

    const shouldShowNextSubjectButton =
      (conversationState.hasCompletedTopicLesson || conversationState.hasSubmittedNotesForTopic) && hasNextTopic();

    const createNextSubjectButton = () =>
      createActionButton("Next subject", async () => {
        addMessage("Next subject", "user");
        conversationState.topicIndex += 1;
        resetTopicState();
        await sendAiMessage(`Are you ready to learn about ${currentTopic().title}?`);
      });

    if (conversationState.sectionIndex < 0) {
      actionButtonsEl.appendChild(
        createActionButton("Yes", async () => {
          addMessage("Yes", "user");
          conversationState.sectionIndex = 0;
          setFeedbackButtonState();
          renderActionButtons();
          await sendSectionAndGuidance(getCurrentSections()[conversationState.sectionIndex]);
          await sendTopicCompletionPromptIfNeeded();
          setFeedbackButtonState();
          renderActionButtons();
        })
      );
      return;
    }

    if (!conversationState.hasCompletedTopicLesson && hasMoreSectionsInTopic()) {
      actionButtonsEl.appendChild(
        createActionButton("Next section", async () => {
          addMessage("Next section", "user");
          conversationState.sectionIndex += 1;

          setFeedbackButtonState();
          renderActionButtons();
          await sendSectionAndGuidance(getCurrentSections()[conversationState.sectionIndex]);
          await sendTopicCompletionPromptIfNeeded();
          setFeedbackButtonState();
          renderActionButtons();
        })
      );
    }

    if (conversationState.notesFlowState === "undecided") {
      actionButtonsEl.appendChild(
        createActionButton("Submit notes", async () => {
          addMessage("Submit notes", "user");
          conversationState.notesFlowState = "taking";
          renderActionButtons();
          await sendAiMessage(
            "Great—submit your notes whenever you're ready. Use the dropdown to choose whether I should review the whole topic or just the current section."
          );
        })
      );
    }

    if (shouldShowNextSubjectButton) {
      actionButtonsEl.appendChild(createNextSubjectButton());
    }
  }

  async function fetchFeedbackFromApi(notes, topicId, scopeDetails) {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        topicId,
        notes,
        scope: scopeDetails
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
    if (!notes) {
      return;
    }

    const scopeDetails = getSelectedScopeDetails();
    addMessage(`${notes}\n\nReview scope: ${scopeDetails.label}`, "user");

    conversationState.isSubmittingFeedback = true;
    setFeedbackButtonState();

    try {
      const feedback = await fetchFeedbackFromApi(notes, currentTopic().id, scopeDetails);
      conversationState.notesFlowState = "taking";
      conversationState.hasSubmittedNotesForTopic = true;
      conversationState.canMoveToNextTopic = true;
      await sendAiMessage(feedback);
      if (hasNextTopic()) {
        await sendAiMessage(
          "Would you like to move on to the next topic? You can also change the dropdown selection and resubmit notes whenever you want."
        );
      } else {
        await sendAiMessage(
          "Nice work finishing the last topic. You can still change the dropdown selection and resubmit notes whenever you want."
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
    populateNotesScopeOptions();
    notesScopeSelectEl.addEventListener("change", (event) => {
      conversationState.selectedNotesScope = event.target.value;
      updateScopeHint();
    });
    notesInputEl.addEventListener("input", setFeedbackButtonState);
    notesFormEl.addEventListener("submit", onNotesSubmit);
    setFeedbackButtonState();
    renderActionButtons();
    await sendAiMessage(`Are you ready to learn about ${currentTopic().title}?`);
  }

  init();
})();
