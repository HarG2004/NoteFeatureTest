const DEMO = {
  lessonTitle: "Topic: The Scientific Method",
  lessonParagraph:
    "The scientific method is a practical way to answer questions using evidence. It often begins with observations that lead to a clear, testable question about how or why something happens. Next, you form a hypothesis, which is a prediction you can test, then design an experiment or procedure to gather observations and data. After collecting results, you analyze patterns, compare evidence, and draw a conclusion about whether the hypothesis was supported. Scientists then refine ideas, revise methods, and repeat testing when needed. This process matters because it helps people reduce bias, build reliable knowledge, and make decisions based on evidence instead of assumptions.",
  greeting: "Hi! Write your notes and I’ll give gentle feedback.",
  rubric: [
    {
      id: "hypothesis",
      label: "Hypothesis / prediction",
      whyItMatters:
        "A hypothesis gives a specific prediction to test, so results can support or challenge an idea.",
      keywords: ["hypothesis", "predict", "prediction", "educated guess", "if then"]
    },
    {
      id: "evidence",
      label: "Experiment + evidence",
      whyItMatters:
        "A clear method plus collected evidence shows how the idea was tested and what happened.",
      keywords: [
        "experiment",
        "test",
        "method",
        "procedure",
        "trial",
        "data",
        "evidence",
        "observe",
        "observation",
        "measure",
        "record"
      ]
    }
  ],
  prioritySuggestionIds: ["hypothesis", "evidence"],
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
