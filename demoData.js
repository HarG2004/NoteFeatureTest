const DEMO = {
  lessonTitle: "Topic: The Scientific Method",
  lessonParagraph:
    "In the scientific method, you begin by writing a clear hypothesis or prediction that can be tested. Then you run an experiment and collect evidence/data to see whether the hypothesis is supported.",
  greeting: "Hi! Write your notes and I’ll give feedback.",
  googleForm: {
    iframeSrc:
      "https://docs.google.com/forms/d/e/1FAIpQLSfMc2hFrdCMYTklM-PDV8oaxU1f0Hi9ojEqV-mwB04d_epecg/viewform?embedded=true",
    openUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfMc2hFrdCMYTklM-PDV8oaxU1f0Hi9ojEqV-mwB04d_epecg/viewform?usp=header"
  },
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
