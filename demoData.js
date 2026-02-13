const DEMO = {
  lessonTitle: "Topic: The Scientific Method",
  lessonParagraph:
    "The scientific method is a step-by-step way to answer questions using evidence instead of guesswork. It usually starts with an observation, followed by a testable question and a hypothesis (an educated prediction). Then scientists design a fair experiment, collect data, and analyze what the results mean. If the evidence does not support the hypothesis, they revise their ideas and test again. This process helps students and scientists make reliable conclusions, avoid bias, and improve understanding over time.",
  presets: [
    {
      id: "great",
      label: "Great notes (clear + accurate)",
      notesText:
        "- Scientific method uses evidence to answer questions.\n- Steps: observation, question, hypothesis, experiment, analyze data, conclude.\n- Results can disprove a hypothesis and still be useful.\n- You may revise and repeat experiments to improve reliability.",
      aiMessages: [
        "✅ What you got right: Your notes include the full process and emphasize evidence-based thinking.",
        "🔍 One nuance to add: Mention controls/constants to explain how experiments stay fair.",
        "✍️ Suggested rewrite: 'A strong experiment changes one variable while keeping others constant to test the hypothesis clearly.'"
      ]
    },
    {
      id: "incomplete",
      label: "Incomplete notes (missing steps)",
      notesText:
        "- Scientific method is for science projects.\n- Start with a hypothesis.\n- Do experiment and conclusion.",
      aiMessages: [
        "👍 Nice start identifying hypothesis and experimentation.",
        "⚠️ Missing key steps: observation/question and data analysis before final conclusions.",
        "✍️ Try adding: 'After experimenting, collect and analyze data to decide whether the hypothesis is supported.'"
      ]
    },
    {
      id: "mixed-up",
      label: "Mixed-up notes (order confusion)",
      notesText:
        "- First conclude what happened.\n- Then collect data from experiment.\n- Ask a question after that.",
      aiMessages: [
        "🧭 Your notes include real components, but the sequence is out of order.",
        "📌 Better order: observation/question → hypothesis → experiment/data collection → analysis → conclusion.",
        "✍️ Suggested rewrite: 'Scientists ask a testable question before they run experiments and only conclude after analyzing data.'"
      ]
    },
    {
      id: "misconception",
      label: "Misconception (hypothesis as fact)",
      notesText:
        "- Hypothesis is basically the final answer.\n- If experiment disagrees, the experiment is wrong.\n- Repeat only if teacher asks.",
      aiMessages: [
        "🛠️ Important correction: A hypothesis is a prediction, not a proven fact.",
        "📊 If results disagree, scientists examine methods and may revise the hypothesis—this is normal and useful.",
        "✍️ Better note: 'Unexpected results help improve explanations and often lead to better future experiments.'"
      ]
    }
  ],
  googleForm: {
    iframeSrc:
      "https://docs.google.com/forms/d/e/1FAIpQLScT4_placeholder/viewform?embedded=true",
    openUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLScT4_placeholder/viewform"
  }
};
