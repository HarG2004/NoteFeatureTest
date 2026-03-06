const OpenAI = require("openai");

const TOPICS = {
  "charge-units": {
    title: "Charge & Units",
    lesson: `Title:
Charge & Units

Section:
What is Electric Charge?

Text:
Electric charge is the fundamental property of matter that causes it to experience a force in an electromagnetic field. Think of it like energy currency in the electrical world—it's what flows through circuits and powers everything.

Section:
The Basics

Lines (keep labels):
Charge symbol: Q or q
Unit: Coulomb (C) — named after physicist Charles-Augustin de Coulomb
Key insight: All matter is made of atoms with electrons (negative charge) and protons (positive charge). When these move or separate, we get electrical effects.

Section:
The Electron Charge

Line:
One electron carries a tiny amount of charge: e = 1.602 × 10^−19 C
(Implement the exponent nicely using HTML, e.g. 10<sup>−19</sup>)

Line:
This is the elementary charge—the smallest unit of charge that exists naturally.

Section:
SI Prefixes (Making Big Numbers Manageable)

Text:
When dealing with electricity, charges can be huge or tiny. We use prefixes to make them easier to write:

TABLE:
PREFIX | SYMBOL | MULTIPLIER | EXAMPLE
Pico | p | 10^−12 | pC (picocoulomb)
Nano | n | 10^−9 | nC (nanocoulomb)
Micro | μ | 10^−6 | μC (microcoulomb)
Milli | m | 10^−3 | mC (millicoulomb)
Kilo | k | 10^3 | kC (kilocoulomb)
Mega | M | 10^6 | MC (megacoulomb)
Giga | G | 10^9 | GC (gigacoulomb)

Section:
Charge Conservation

Text:
Here's a golden rule: Charge is never created or destroyed—only moved around. In a circuit, the total charge flowing in equals the charge flowing out. This is fundamental to how circuits work.

Section:
Conductors vs Insulators

Bullets (keep arrows):
• Conductors (copper, aluminum, silver): Electrons move freely → charge flows easily
• Insulators (rubber, plastic, glass): Electrons are locked in place → charge doesn't flow

Text:
In your gaming console, the copper wiring is a conductor—it lets charge flow to power your game. The plastic casing is an insulator—it keeps the charge where it belongs!`
  }
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing OPENAI_API_KEY." });
  }

  const { notes, topicId } = req.body || {};

  if (typeof notes !== "string" || !notes.trim() || typeof topicId !== "string") {
    return res.status(400).json({
      error: 'Invalid request body. Expected { "notes": string, "topicId": string }.'
    });
  }

  const topic = TOPICS[topicId];
  if (!topic) {
    return res.status(400).json({ error: "Unknown topicId." });
  }

  try {
    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `You are a friendly, encouraging tutor. Your job is to give brief, supportive feedback on a student's notes based only on the lesson content provided. Be kind and motivational.

RULES:
- Start by briefly saying what the student did well.
- If the student covers most key points, give little or no corrective suggestions.
- If the student covers most key points, keep suggestions minimal: 0-2 short bullet points only when helpful.
- If the student misses several key points, provide exactly 4 short bullet suggestions.
- Focus only on what the student could ADD to strengthen their notes.
- Do not be negative or harsh.
- Do not rewrite the student's notes or tell them exactly what to write.
- Keep it concise.`
        },
        {
          role: "user",
          content: `LESSON (source of truth):
${topic.lesson}

STUDENT NOTES:
${notes.trim()}

TASK:
Give encouraging feedback in this format:
1) One short sentence: "What you did well".
2) "Suggestions" bullets based on coverage:
   - If notes cover most key points: 0-2 bullets max.
   - If notes are missing several key points: exactly 4 bullets.

If the notes already include most key points, respond with praise and at most one minor suggestion (or none).`
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
