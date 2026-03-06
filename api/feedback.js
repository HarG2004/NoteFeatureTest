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

Lines:
Charge symbol: Q or q
Unit: Coulomb (C) — named after physicist Charles-Augustin de Coulomb
Key insight: All matter is made of atoms with electrons (negative charge) and protons (positive charge). When these move or separate, we get electrical effects.

Section:
The Electron Charge

Line:
One electron carries a tiny amount of charge: e = 1.602 × 10^−19 C

Line:
This is the elementary charge—the smallest unit of charge that exists naturally.

Section:
SI Prefixes (Making Big Numbers Manageable)

Text:
When dealing with electricity, charges can be huge or tiny. We use prefixes to make them easier to write:

TABLE
Columns: PREFIX | SYMBOL | MULTIPLIER | EXAMPLE
Rows:
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

Bullets:
• Conductors (copper, aluminum, silver): Electrons move freely → charge flows easily
• Insulators (rubber, plastic, glass): Electrons are locked in place → charge doesn't flow

Text:
In your gaming console, the copper wiring is a conductor—it lets charge flow to power your game. The plastic casing is an insulator—it keeps the charge where it belongs!`
  },
  "voltage-current": {
    title: "Voltage & Current",
    lesson: `Title:
Voltage & Current

Section:
What Are Voltage and Current?

Text:
Think of voltage and current as a team working together to power your gaming console:

Bullets:
• Current is the flow of charge (like water flowing through a pipe)
• Voltage is the push that makes charge flow (like the pressure pushing the water)

Section:
Current: The Flow of Charge

Lines:
Current symbol: i or I
Unit: Ampere (A) — one amp = one coulomb per second

Equation:
i = dq/dt

Text:
This means: current is how much charge moves past a point per unit time.

Text:
Key insight: If you have a wire carrying 1 A of current, that means 1 coulomb of charge flows through any cross-section of that wire every second.

Section:
Voltage: The Electric Potential Difference

Lines:
Voltage symbol: v or V
Unit: Volt (V) — which equals joules per coulomb

Equation:
v = dw/dq

Text:
This means: voltage is the energy given to (or taken from) each coulomb of charge.

Text:
Real example: A battery labeled "12V" means it gives 12 joules of energy to every coulomb of charge that flows through it.

Section:
Conventional Current Direction

Text:
Here's a quirk of history: we define current as flowing from positive to negative (even though electrons actually move the opposite way!). This is called conventional current direction, and it's what engineers use everywhere.

Section:
Passive Sign Convention

Text:
When measuring voltage and current in a circuit, we use a standard rule:

Bullets:
• Current enters the positive terminal of a component
• Voltage is measured from negative to positive

Text:
This keeps our power calculations consistent: P = V × I (power absorbed by component)`
  },
  "power-energy": {
    title: "Power & Energy",
    lesson: `Title:
Power & Energy

Section:
What Are Power and Energy?

Text:
Think of power and energy as two sides of the same coin:

Bullets:
• Energy is the total work done (like your total game score)
• Power is how fast you're using that energy (like your damage-per-second or DPS)

Section:
Instantaneous Power: The Rate of Energy Transfer

Lines:
Power symbol: p or P
Unit: Watt (W) — one watt = one joule per second

Equation:
p(t) = v(t) · i(t)

Text:
This is the fundamental relationship: power = voltage × current. At any moment in time, the power being delivered to (or absorbed by) a component is the product of its voltage and current.

Text:
Real example: A 12V battery delivering 2A of current is supplying 12 × 2 = 24 watts of power.

Section:
Energy: The Integral of Power Over Time

Lines:
Energy symbol: w or W
Unit: Joule (J) — the total work done

Equation:
w = ∫ p dt

Text:
If power is constant: w = p × t

Text:
Example: A 24W device running for 1 hour (3600 seconds) uses 24 × 3600 = 86,400 joules of energy.

Section:
Power Absorbed vs Power Delivered

Text:
Here's where the passive sign convention matters:

Bullets:
• Positive power (p > 0): The component is absorbing energy (like a resistor heating up or a motor spinning)
• Negative power (p < 0): The component is supplying energy (like a battery powering a circuit)

Text:
The sign tells you the direction of energy flow!

Section:
Energy Storage in Reactive Components

Lines:
Capacitor: w_C = 1/2 C v^2

Text:
A capacitor stores energy in its electric field. Higher voltage = more stored energy.

Lines:
Inductor: w_L = 1/2 L i^2

Text:
An inductor stores energy in its magnetic field. Higher current = more stored energy.

Text:
These are super important because they can release that energy back into the circuit later—like a battery that charges and discharges!

Section:
Quick Analogy (Gaming Style)

Text:
In a game:

Bullets:
• Energy = your total mana pool or health bar
• Power = how fast you're regenerating mana or taking damage
• Capacitor = a shield that stores energy and releases it when needed
• Inductor = a momentum effect that resists sudden changes`
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

  const { topicId, notes } = req.body || {};

  if (typeof topicId !== "string" || typeof notes !== "string" || !notes.trim()) {
    return res.status(400).json({
      error: 'Invalid request body. Expected { "topicId": string, "notes": string }.'
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
          content: `You are a friendly, encouraging tutor. Give brief, supportive feedback on a student’s notes based only on the lesson content provided.

RULES:
- Always begin with 1 short sentence that praises something the student did well.
- Only include bullets for improvement suggestions when they are actually needed.
- If notes are strong and complete, give 0–2 bullets.
- If notes are missing key points, give exactly 4 bullets.
- Focus only on what the student could ADD to strengthen their notes.
- Do not be negative or harsh.
- Do not rewrite the student’s notes or tell them exactly what to write.
- Keep it concise.`
        },
        {
          role: "user",
          content: `LESSON (source of truth):
${topic.lesson}

STUDENT NOTES:
${notes.trim()}

TASK:
First, write one short sentence about what the student did well.
Then, if needed, add short bullet suggestions for what they could add to make their notes stronger.
- Use 0–2 bullets for strong, complete notes.
- Use exactly 4 bullets if key lesson ideas are missing.
- It is okay to return no bullets when no additions are needed.
Use phrasing like “You might add…” or “To strengthen your notes, consider…”.`
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
