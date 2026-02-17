(function () {
  const lessonTitleEl = document.getElementById("lessonTitle");
  const lessonParagraphEl = document.getElementById("lessonParagraph");
  const notesTextEl = document.getElementById("notesText");
  const chatAreaEl = document.getElementById("chatArea");
  const explanationListEl = document.getElementById("explanationList");
  const feedbackBtn = document.getElementById("feedbackBtn");
  const resetBtn = document.getElementById("resetBtn");

  const STOPWORDS = new Set([
    "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with", "is", "are", "was", "were", "it", "that", "this", "as"
  ]);

  function normalizeText(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function stemToken(token) {
    if (token.length > 5 && token.endsWith("ing")) return token.slice(0, -3);
    if (token.length > 4 && token.endsWith("ed")) return token.slice(0, -2);
    if (token.length > 4 && token.endsWith("es")) return token.slice(0, -2);
    if (token.length > 3 && token.endsWith("s")) return token.slice(0, -1);
    if (token.length > 6 && token.endsWith("tion")) return token.slice(0, -4);
    return token;
  }

  function tokenize(text) {
    return normalizeText(text)
      .split(" ")
      .filter((token) => token && !STOPWORDS.has(token))
      .map(stemToken);
  }

  function phraseToStemmedTokens(phrase) {
    return tokenize(phrase);
  }

  function containsPhrase(normalizedText, phrase) {
    return normalizedText.includes(normalizeText(phrase));
  }

  function containsStemmedPhrase(userTokens, phraseTokens) {
    if (phraseTokens.length === 0) return false;
    if (phraseTokens.length === 1) return userTokens.includes(phraseTokens[0]);

    for (let i = 0; i <= userTokens.length - phraseTokens.length; i += 1) {
      let matches = true;
      for (let j = 0; j < phraseTokens.length; j += 1) {
        if (userTokens[i + j] !== phraseTokens[j]) {
          matches = false;
          break;
        }
      }
      if (matches) return true;
    }
    return false;
  }

  function detectConcept(normalizedText, userTokens, concept) {
    return concept.keywords.some((keyword) => {
      if (keyword.includes(" ")) {
        if (containsPhrase(normalizedText, keyword)) return true;
        return containsStemmedPhrase(userTokens, phraseToStemmedTokens(keyword));
      }
      return userTokens.includes(stemToken(keyword.toLowerCase()));
    });
  }

  function detectStepsBonus(normalizedText) {
    const numPattern = /\b([1-9]|10)\b/;
    const numberWordPattern = new RegExp(`\\b(${DEMO.stepBonus.numberWords.join("|")})\\b`);
    const processPattern = new RegExp(`\\b(${DEMO.stepBonus.keywords.join("|")})\\b`);

    const hasNumber = numPattern.test(normalizedText) || numberWordPattern.test(normalizedText);
    const hasProcessWord = processPattern.test(normalizedText);

    return hasNumber && hasProcessWord;
  }

  function analyzeNotes(rawNotes) {
    const normalized = normalizeText(rawNotes);
    const tokens = tokenize(rawNotes);

    const conceptResults = DEMO.rubric.map((concept) => ({
      id: concept.id,
      label: concept.label,
      whyItMatters: concept.whyItMatters,
      detected: detectConcept(normalized, tokens, concept)
    }));

    const detectedCount = conceptResults.filter((item) => item.detected).length;
    const coverage = detectedCount / DEMO.rubric.length;
    const stepBonusDetected = detectStepsBonus(normalized);

    return {
      conceptResults,
      detectedCount,
      total: DEMO.rubric.length,
      coverage,
      stepBonusDetected,
      isEmpty: normalized.length === 0,
      isVeryShort: tokens.length > 0 && tokens.length < 12
    };
  }

  function renderExplanation(results) {
    explanationListEl.innerHTML = "";

    DEMO.rubric.forEach((concept) => {
      const li = document.createElement("li");
      const data = results ? results.conceptResults.find((item) => item.id === concept.id) : null;

      let statusText = "Not checked yet";
      let statusClass = "status-neutral";

      if (data) {
        if (data.detected) {
          statusText = "Detected ✅";
          statusClass = "status-detected";
        } else {
          statusText = "Missing ➕";
          statusClass = "status-missing";
        }
      }

      li.innerHTML = `<strong>${concept.label}</strong> — <span class="${statusClass}">${statusText}</span><br>${concept.whyItMatters}`;
      explanationListEl.appendChild(li);
    });
  }

  function renderChat(messages, neutral) {
    chatAreaEl.innerHTML = "";
    messages.forEach((message) => {
      const bubble = document.createElement("div");
      bubble.className = neutral ? "bubble neutral" : "bubble";
      bubble.textContent = message;
      chatAreaEl.appendChild(bubble);
    });
    chatAreaEl.scrollTop = chatAreaEl.scrollHeight;
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

  function firstDetectedLabel(results) {
    const found = results.conceptResults.find((item) => item.detected);
    return found ? found.label : null;
  }

  function buildSuggestions(results) {
    const missing = results.conceptResults.filter((item) => !item.detected).map((item) => item.id);
    const priority = ["hypothesis", "experiment", "data", "analysis", "conclusion"];
    const sorted = [...missing].sort((a, b) => {
      const aIndex = priority.indexOf(a);
      const bIndex = priority.indexOf(b);
      return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
    });

    const suggestionMap = {
      question: "state a clear, testable question",
      hypothesis: "include a hypothesis or prediction",
      experiment: "describe the experiment/procedure you would use",
      variables: "mention variables or controls for a fair test",
      data: "add how observations/data are collected",
      analysis: "explain how results are analyzed/interpreted",
      conclusion: "add a conclusion tied to evidence",
      iteration: "mention revising and repeating the process",
      importance: "include why the method matters (reliable, less bias, evidence-based)"
    };

    return sorted.slice(0, 4).map((id) => suggestionMap[id]);
  }

  function buildRewrite(results) {
    const missing = results.conceptResults.filter((item) => !item.detected).map((item) => item.id);
    const pieces = [];

    if (missing.includes("question")) pieces.push("Ask a testable question.");
    if (missing.includes("hypothesis")) pieces.push("Write a prediction (hypothesis).");
    if (missing.includes("experiment")) pieces.push("Describe the experiment or procedure.");
    if (missing.includes("data")) pieces.push("Record observations/data.");
    if (missing.includes("analysis")) pieces.push("Analyze results.");
    if (missing.includes("conclusion")) pieces.push("Conclude whether evidence supports the hypothesis.");
    if (missing.includes("iteration")) pieces.push("Revise and repeat if needed.");
    if (missing.includes("importance")) pieces.push("Explain why this process improves reliability and reduces bias.");

    return pieces.slice(0, 5).join(" ");
  }

  function buildAiMessages(results) {
    if (results.isEmpty) {
      return [
        "Great job starting this activity—when you’re ready, add a few bullet notes and I’ll help you strengthen them.",
        "A helpful start is 3–5 bullets that mention a testable question, a hypothesis, an experiment, and what data you would collect.",
        "You might also add one line about why the scientific method matters for reliable, evidence-based conclusions."
      ];
    }

    const messages = [];
    const strength = firstDetectedLabel(results);

    if (strength) {
      messages.push(`Great job writing notes—here are a few suggestions to make them even stronger. I can already see a strength in: ${strength}.`);
    } else {
      messages.push("Great job writing notes—here are a few suggestions to make them even stronger.");
    }

    if (results.isVeryShort) {
      messages.push("Nice concise start. You might add 2–3 more details so your notes include the full process from hypothesis to conclusion.");
    }

    const suggestions = buildSuggestions(results);
    if (suggestions.length > 0) {
      messages.push(`One helpful next step is to ${suggestions.join(", and to ")}.`);
    } else {
      messages.push("Your notes cover the core parts very well. You might polish wording and add a quick real-world example.");
    }

    if (results.coverage < 0.9) {
      const rewrite = buildRewrite(results);
      if (rewrite) {
        messages.push(`Suggested rewrite template: ${rewrite}`);
      }
    }

    if (!results.conceptResults.find((c) => c.id === "importance")?.detected) {
      messages.push("Try adding one sentence about why the method matters: it helps reduce bias and build reliable knowledge.");
    } else if (results.stepBonusDetected) {
      messages.push("Nice detail mentioning the number of steps/process—that helps show structure.");
    }

    return messages.slice(0, 4);
  }

  function resetUI() {
    notesTextEl.value = "";
    renderChat(["Hi! Write your notes and I’ll give gentle feedback."], true);
    renderExplanation(null);
    feedbackBtn.disabled = false;
  }

  feedbackBtn.addEventListener("click", () => {
    feedbackBtn.disabled = true;
    showTyping();

    const notes = notesTextEl.value;
    const waitMs = Math.floor(Math.random() * 401) + 800;

    window.setTimeout(() => {
      const results = analyzeNotes(notes);
      renderExplanation(results);
      renderChat(buildAiMessages(results), false);
      feedbackBtn.disabled = false;
    }, waitMs);
  });

  resetBtn.addEventListener("click", resetUI);

  function init() {
    lessonTitleEl.textContent = DEMO.lessonTitle;
    lessonParagraphEl.textContent = DEMO.lessonParagraph;
    notesTextEl.placeholder = "Example: - Ask a testable question\n- Make a hypothesis\n- Run an experiment and collect data\n- Analyze results and conclude";
    resetUI();
  }

  init();
})();
