const OpenAI = require("openai");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing OPENAI_API_KEY." });
  }

  const { topic, lessonBullets, notes } = req.body || {};

  if (!topic || !Array.isArray(lessonBullets) || typeof notes !== "string") {
    return res.status(400).json({
      error:
        'Invalid request body. Expected { "topic": string, "lessonBullets": string[], "notes": string }.'
    });
  }

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are a kind classroom tutor. Give concise, supportive, suggestion-only feedback on student notes. Focus only on what could be added to strengthen notes. Avoid negative phrasing like 'wrong', 'bad', or 'you didn\'t'. Return 2-5 short bullet points."
        },
        {
          role: "user",
          content: `Topic: ${topic}\nLesson bullets:\n- ${lessonBullets.join("\n- ")}\n\nStudent notes:\n${notes}`
        }
      ]
    });

    const reply = (response.output_text || "").trim();

    if (!reply) {
      return res.status(502).json({ error: "Model returned an empty response." });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate feedback." });
  }
};
