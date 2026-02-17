const DEMO = {
  lessonTitle: "Topic: The Scientific Method",
  lessonParagraph:
    "The scientific method is a practical way to answer questions using evidence. It often begins with observations that lead to a clear, testable question about how or why something happens. Next, you form a hypothesis, which is a prediction you can test, then design an experiment or procedure to gather observations and data. After collecting results, you analyze patterns, compare evidence, and draw a conclusion about whether the hypothesis was supported. Scientists then refine ideas, revise methods, and repeat testing when needed. This process matters because it helps people reduce bias, build reliable knowledge, and make decisions based on evidence instead of assumptions.",
  greeting: "Hi! Write your notes and I’ll give gentle feedback.",
  rubric: [
    {
      id: "question",
      label: "Testable question / problem",
      whyItMatters:
        "A clear, testable question focuses the investigation so the experiment can produce useful evidence.",
      keywords: [
        "question",
        "testable question",
        "research question",
        "problem",
        "investigate",
        "ask why",
        "ask how"
      ]
    },
    {
      id: "hypothesis",
      label: "Hypothesis / prediction",
      whyItMatters:
        "A hypothesis gives a specific prediction to test, so results can support or challenge an idea.",
      keywords: ["hypothesis", "predict", "prediction", "educated guess", "if then"]
    },
    {
      id: "experiment",
      label: "Experiment / method / procedure",
      whyItMatters:
        "A planned method makes testing organized and helps others understand what was done.",
      keywords: [
        "experiment",
        "test",
        "method",
        "procedure",
        "steps",
        "trial",
        "materials"
      ]
    },
    {
      id: "variables",
      label: "Variables / controls",
      whyItMatters:
        "Identifying independent/dependent variables and controls helps make comparisons fair.",
      keywords: [
        "variable",
        "independent variable",
        "dependent variable",
        "control",
        "control group",
        "constant",
        "fair test"
      ]
    },
    {
      id: "data",
      label: "Observations / data collection",
      whyItMatters:
        "Collecting observations and measurements provides the evidence needed for conclusions.",
      keywords: [
        "observe",
        "observation",
        "observed",
        "data",
        "evidence",
        "measure",
        "record"
      ]
    },
    {
      id: "analysis",
      label: "Analysis / interpreting results",
      whyItMatters:
        "Analysis explains what the data means instead of just listing numbers.",
      keywords: [
        "analyze",
        "analysis",
        "interpret",
        "results",
        "pattern",
        "compare",
        "graph"
      ]
    },
    {
      id: "conclusion",
      label: "Conclusion / whether hypothesis supported",
      whyItMatters:
        "A conclusion connects findings back to the hypothesis and states what was learned.",
      keywords: [
        "conclude",
        "conclusion",
        "supported",
        "not supported",
        "final result",
        "therefore"
      ]
    },
    {
      id: "iteration",
      label: "Iteration / revise and repeat",
      whyItMatters:
        "Revising and repeating improves the quality of evidence and strengthens understanding.",
      keywords: [
        "revise",
        "repeat",
        "again",
        "improve",
        "iterate",
        "retry",
        "refine"
      ]
    },
    {
      id: "importance",
      label: "Why it’s important",
      whyItMatters:
        "The scientific method builds reliable, reproducible, evidence-based knowledge and helps reduce bias.",
      keywords: [
        "bias",
        "reliable",
        "reproducible",
        "evidence based",
        "trustworthy",
        "objective",
        "knowledge"
      ]
    }
  ],
  prioritySuggestionIds: ["hypothesis", "experiment", "data", "analysis", "conclusion"],
  stepNumbers: {
    digits: ["4", "5", "6", "7", "8", "9", "10"],
    words: [
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten"
    ],
    anchors: ["step", "steps", "process"]
  },
  stopwords: [
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "was",
    "were",
    "be",
    "this",
    "that",
    "it",
    "as",
    "by"
  ]
};
