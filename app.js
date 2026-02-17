(function () {
  const MAX_SUGGESTION_POINTS = 2;

  const lessonTitleEl = document.getElementById("lessonTitle");
  const lessonParagraphEl = document.getElementById("lessonParagraph");
  const notesTextEl = document.getElementById("notesText");
  const chatAreaEl = document.getElementById("chatArea");
  const feedbackBtn = document.getElementById("feedbackBtn");
  const resetBtn = document.getElementById("resetBtn");
  const explanationListEl = document.getElementById("explanationList");
  const bonusSignalEl = document.getElementById("bonusSignal");

  function normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function stemToken(token) {
    if (token.endsWith("ations")) return token.slice(0, -5) + "e";
    if (token.endsWith("ation")) return token.slice(0, -5) + "e";
    if (token.endsWith("ing") && token.length > 5) return token.slice(0, -3);
    if (token.endsWith("ed") && token.length > 4) return token.slice(0, -2);
    if (token.endsWith("es") && token.length > 4) return token.slice(0, -2);
    if (token.endsWith("s") && token.length > 3) return token.slice(0, -1);
    return token;
  }

  function tokenize(text) {
    const normalized = normalizeText(text);
    const rawTokens = normalized ? normalized.split(" ") : [];
    const stopwords = new Set(DEMO.stopwords);

    return rawTokens
      .map((token) => stemToken(token))
      .filter((token) => token && !stopwords.has(token));
  }

  function phraseInText(normalizedText, keyword) {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) return false;

    if (normalizedKeyword.includes(" ")) {
      return normalizedText.includes(normalizedKeyword);
    }

    const singleKeywordStem = stemToken(normalizedKeyword);
    const textTokens = tokenize(normalizedText);
    return textTokens.includes(singleKeywordStem);
  }

  function detectConcepts(inputText) {
    const normalizedText = normalizeText(inputText);

    return DEMO.rubric.map((group) => {
      const detected = group.keywords.some((keyword) => phraseInText(normalizedText, keyword));
      return { ...group, detected };
    });
  }

  function detectStepCountBonus(inputText) {
    const normalizedText = normalizeText(inputText);
    const tokens = normalizedText.split(" ");
    const numberTokens = new Set([...DEMO.stepNumbers.digits, ...DEMO.stepNumbers.words]);
    const anchorTokens = new Set(DEMO.stepNumbers.anchors);

    for (let i = 0; i < tokens.length; i += 1) {
      if (!numberTokens.has(tokens[i])) continue;
      for (let offset = -3; offset <= 3; offset += 1) {
        const neighbor = tokens[i + offset];
        if (anchorTokens.has(neighbor)) {
          return true;
        }
      }
    }
    return false;
  }

  function renderExplanation(results, hasAnalyzed, stepBonusDetected) {
    explanationListEl.innerHTML = "";

    results.forEach((item) => {
      const li = document.createElement("li");
      li.className = "explanation-item";

      const heading = document.createElement("strong");
      heading.textContent = item.label;

      const status = document.createElement("span");
      status.className = "status";

      if (!hasAnalyzed) {
        status.classList.add("neutral");
        status.textContent = "(Not checked yet)";
      } else if (item.detected) {
        status.classList.add("detected");
        status.textContent = "Detected ✅";
      } else {
        status.classList.add("missing");
        status.textContent = "Missing ➕";
      }

      heading.appendChild(status);

      const why = document.createElement("p");
      why.textContent = item.whyItMatters;

      li.appendChild(heading);
      li.appendChild(why);
      explanationListEl.appendChild(li);
    });

    if (!hasAnalyzed) {
      bonusSignalEl.textContent = "Bonus signal: mention how many steps are in the process (for example, '6 steps').";
    } else if (stepBonusDetected) {
      bonusSignalEl.textContent = "Bonus signal detected ✅: you mentioned a number of steps/process.";
    } else {
      bonusSignalEl.textContent = "Bonus signal not detected ➕: you might mention a step count (for example, '6 steps').";
    }
  }

  function addBubble(text, variant) {
    const bubble = document.createElement("div");
    bubble.className = variant ? `bubble ${variant}` : "bubble";
    bubble.textContent = text;
    chatAreaEl.appendChild(bubble);
    chatAreaEl.scrollTop = chatAreaEl.scrollHeight;
  }

  function renderGreeting() {
    chatAreaEl.innerHTML = "";
    addBubble(DEMO.greeting, "neutral");
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

  function buildSuggestions(missingGroups) {
    const priorityFirst = [
      ...DEMO.prioritySuggestionIds
        .map((id) => missingGroups.find((group) => group.id === id))
        .filter(Boolean),
      ...missingGroups.filter((group) => !DEMO.prioritySuggestionIds.includes(group.id))
    ];

    return priorityFirst.slice(0, MAX_SUGGESTION_POINTS).map((group) => {
      switch (group.id) {
        case "hypothesis":
          return "You might add a clear hypothesis or prediction (for example, 'If..., then...').";
        case "experiment":
          return "One helpful detail is the experiment procedure or method used to test the idea.";
        case "data":
          return "You might add how observations or data were collected and recorded.";
        case "analysis":
          return "One helpful detail is how the results were analyzed or interpreted.";
        case "conclusion":
          return "You might add a conclusion that says whether the hypothesis was supported.";
        default:
          return `You might add a note about ${group.label.toLowerCase()}.`;
      }
    });
  }

  function buildTemplateMessage(missingGroups) {
    if (!missingGroups.length) {
      return null;
    }

    const lines = ["Suggested rewrite template:"];
    const map = {
      question: "- Testable question/problem: ...",
      hypothesis: "- Hypothesis/prediction: ...",
      experiment: "- Experiment/method: ...",
      variables: "- Variables/controls: ...",
      data: "- Data/observations: ...",
      analysis: "- Analysis of results: ...",
      conclusion: "- Conclusion (supported or not): ...",
      iteration: "- Revision/next test: ...",
      importance: "- Why it matters: ..."
    };

    missingGroups.slice(0, MAX_SUGGESTION_POINTS).forEach((group) => lines.push(map[group.id]));
    return lines.join("\n");
  }

  function buildFeedbackMessages(inputText, results, stepBonusDetected) {
    const trimmed = inputText.trim();
    const detectedGroups = results.filter((group) => group.detected);
    const missingGroups = results.filter((group) => !group.detected);

    if (!trimmed) {
      return [
        "Great job starting this activity. When you're ready, write a few bullets about the scientific method and I’ll give gentle feedback.",
        "A helpful start is: testable question, hypothesis, experiment, data, analysis, and conclusion."
      ];
    }

    const veryShort = tokenize(trimmed).length < 12;
    const coverage = Math.round((detectedGroups.length / results.length) * 100);

    const firstMessageBase =
      "Great job writing notes—here are a few suggestions to make them even stronger.";
    let strengthPart = "";

    if (detectedGroups.length > 0) {
      const strengthLabels = detectedGroups.slice(0, 2).map((group) => group.label.toLowerCase());
      strengthPart = ` I can already see ${strengthLabels.join(" and ")} in your notes.`;
    } else {
      strengthPart = " You’ve made a useful start, and adding a few core parts will make the meaning clearer.";
    }

    const messages = [`${firstMessageBase}${strengthPart}`];

    if (veryShort) {
      messages.push(
        "Your notes are a bit brief right now. You might add 1–2 more key parts, especially hypothesis and experiment."
      );
    } else {
      const suggestions = buildSuggestions(missingGroups);
      if (suggestions.length) {
        messages.push(suggestions.join(" "));
      } else {
        messages.push(
          `Nice coverage: you included all major parts of the method (${coverage}%). You could still add a concrete example to deepen understanding.`
        );
      }
    }

    const templateMessage = buildTemplateMessage(missingGroups);
    if (templateMessage && missingGroups.length >= 2) {
      messages.push(templateMessage);
    }

    if (!stepBonusDetected) {
      messages.push("Try adding one sentence about why the method matters and, if you want, mention how many steps are in the process.");
    } else {
      messages.push("Nice touch mentioning steps in the process. Try adding one sentence about why the method matters in real life.");
    }

    return messages.slice(0, 4);
  }

  function analyzeAndRespond() {
    const inputText = notesTextEl.value;
    const results = detectConcepts(inputText);
    const stepBonusDetected = detectStepCountBonus(inputText);
    const messages = buildFeedbackMessages(inputText, results, stepBonusDetected);

    feedbackBtn.disabled = true;
    showTyping();

    const waitMs = Math.floor(Math.random() * 401) + 800;
    window.setTimeout(() => {
      chatAreaEl.innerHTML = "";
      messages.forEach((message) => addBubble(message));
      renderExplanation(results, true, stepBonusDetected);
      feedbackBtn.disabled = false;
    }, waitMs);
  }

  function resetDemo() {
    notesTextEl.value = "";
    feedbackBtn.disabled = false;
    renderGreeting();

    const neutralResults = DEMO.rubric.map((group) => ({ ...group, detected: false }));
    renderExplanation(neutralResults, false, false);
  }

  function init() {
    lessonTitleEl.textContent = DEMO.lessonTitle;
    lessonParagraphEl.textContent = DEMO.lessonParagraph;

    feedbackBtn.addEventListener("click", analyzeAndRespond);
    resetBtn.addEventListener("click", resetDemo);

    resetDemo();
  }

  init();
})();
