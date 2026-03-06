window.DEMO_DATA = {
  topics: [
    {
      id: "charge-units",
      title: "Charge & Units",
      lessonHtml: `
        <h2>Charge &amp; Units</h2>

        <h3>What is Electric Charge?</h3>
        <p>Electric charge is the fundamental property of matter that causes it to experience a force in an electromagnetic field. Think of it like energy currency in the electrical world—it's what flows through circuits and powers everything.</p>

        <h3>The Basics</h3>
        <p><strong>Charge symbol:</strong> Q or q</p>
        <p><strong>Unit:</strong> Coulomb (C) — named after physicist Charles-Augustin de Coulomb</p>
        <p><strong>Key insight:</strong> All matter is made of atoms with electrons (negative charge) and protons (positive charge). When these move or separate, we get electrical effects.</p>

        <h3>The Electron Charge</h3>
        <p>One electron carries a tiny amount of charge: e = 1.602 × 10<sup>−19</sup> C</p>
        <p>This is the elementary charge—the smallest unit of charge that exists naturally.</p>

        <h3>SI Prefixes (Making Big Numbers Manageable)</h3>
        <p>When dealing with electricity, charges can be huge or tiny. We use prefixes to make them easier to write:</p>

        <table class="lesson-table">
          <thead>
            <tr>
              <th>PREFIX</th>
              <th>SYMBOL</th>
              <th>MULTIPLIER</th>
              <th>EXAMPLE</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Pico</td><td>p</td><td>10<sup>−12</sup></td><td>pC (picocoulomb)</td></tr>
            <tr><td>Nano</td><td>n</td><td>10<sup>−9</sup></td><td>nC (nanocoulomb)</td></tr>
            <tr><td>Micro</td><td>μ</td><td>10<sup>−6</sup></td><td>μC (microcoulomb)</td></tr>
            <tr><td>Milli</td><td>m</td><td>10<sup>−3</sup></td><td>mC (millicoulomb)</td></tr>
            <tr><td>Kilo</td><td>k</td><td>10<sup>3</sup></td><td>kC (kilocoulomb)</td></tr>
            <tr><td>Mega</td><td>M</td><td>10<sup>6</sup></td><td>MC (megacoulomb)</td></tr>
            <tr><td>Giga</td><td>G</td><td>10<sup>9</sup></td><td>GC (gigacoulomb)</td></tr>
          </tbody>
        </table>

        <h3>Charge Conservation</h3>
        <p>Here's a golden rule: Charge is never created or destroyed—only moved around. In a circuit, the total charge flowing in equals the charge flowing out. This is fundamental to how circuits work.</p>

        <h3>Conductors vs Insulators</h3>
        <ul>
          <li>Conductors (copper, aluminum, silver): Electrons move freely → charge flows easily</li>
          <li>Insulators (rubber, plastic, glass): Electrons are locked in place → charge doesn't flow</li>
        </ul>

        <p>In your gaming console, the copper wiring is a conductor—it lets charge flow to power your game. The plastic casing is an insulator—it keeps the charge where it belongs!</p>
      `
    },
    {
      id: "voltage-current",
      title: "Voltage & Current",
      lessonHtml: `
        <h2>Voltage &amp; Current</h2>

        <h3>What Are Voltage and Current?</h3>
        <p>Think of voltage and current as a team working together to power your gaming console:</p>
        <ul>
          <li>Current is the flow of charge (like water flowing through a pipe)</li>
          <li>Voltage is the push that makes charge flow (like the pressure pushing the water)</li>
        </ul>

        <h3>Current: The Flow of Charge</h3>
        <p><strong>Current symbol:</strong> i or I</p>
        <p><strong>Unit:</strong> Ampere (A) — one amp = one coulomb per second</p>
        <p><strong>Equation:</strong> i = dq/dt</p>
        <p>This means: current is how much charge moves past a point per unit time.</p>
        <p>Key insight: If you have a wire carrying 1 A of current, that means 1 coulomb of charge flows through any cross-section of that wire every second.</p>

        <h3>Voltage: The Electric Potential Difference</h3>
        <p><strong>Voltage symbol:</strong> v or V</p>
        <p><strong>Unit:</strong> Volt (V) — which equals joules per coulomb</p>
        <p><strong>Equation:</strong> v = dw/dq</p>
        <p>This means: voltage is the energy given to (or taken from) each coulomb of charge.</p>
        <p>Real example: A battery labeled "12V" means it gives 12 joules of energy to every coulomb of charge that flows through it.</p>

        <h3>Conventional Current Direction</h3>
        <p>Here's a quirk of history: we define current as flowing from positive to negative (even though electrons actually move the opposite way!). This is called conventional current direction, and it's what engineers use everywhere.</p>

        <h3>Passive Sign Convention</h3>
        <p>When measuring voltage and current in a circuit, we use a standard rule:</p>
        <ul>
          <li>Current enters the positive terminal of a component</li>
          <li>Voltage is measured from negative to positive</li>
        </ul>
        <p>This keeps our power calculations consistent: P = V × I (power absorbed by component)</p>
      `
    },
    {
      id: "power-energy",
      title: "Power & Energy",
      lessonHtml: `
        <h2>Power &amp; Energy</h2>

        <h3>What Are Power and Energy?</h3>
        <p>Think of power and energy as two sides of the same coin:</p>
        <ul>
          <li>Energy is the total work done (like your total game score)</li>
          <li>Power is how fast you're using that energy (like your damage-per-second or DPS)</li>
        </ul>

        <h3>Instantaneous Power: The Rate of Energy Transfer</h3>
        <p><strong>Power symbol:</strong> p or P</p>
        <p><strong>Unit:</strong> Watt (W) — one watt = one joule per second</p>
        <p><strong>Equation:</strong> p(t) = v(t) · i(t)</p>
        <p>This is the fundamental relationship: power = voltage × current. At any moment in time, the power being delivered to (or absorbed by) a component is the product of its voltage and current.</p>
        <p>Real example: A 12V battery delivering 2A of current is supplying 12 × 2 = 24 watts of power.</p>

        <h3>Energy: The Integral of Power Over Time</h3>
        <p><strong>Energy symbol:</strong> w or W</p>
        <p><strong>Unit:</strong> Joule (J) — the total work done</p>
        <p><strong>Equation:</strong> w = ∫ p dt</p>
        <p>If power is constant: w = p × t</p>
        <p>Example: A 24W device running for 1 hour (3600 seconds) uses 24 × 3600 = 86,400 joules of energy.</p>

        <h3>Power Absorbed vs Power Delivered</h3>
        <p>Here's where the passive sign convention matters:</p>
        <ul>
          <li>Positive power (p &gt; 0): The component is absorbing energy (like a resistor heating up or a motor spinning)</li>
          <li>Negative power (p &lt; 0): The component is supplying energy (like a battery powering a circuit)</li>
        </ul>
        <p>The sign tells you the direction of energy flow!</p>

        <h3>Energy Storage in Reactive Components</h3>
        <p><strong>Capacitor:</strong> w_C = 1/2 C v<sup>2</sup></p>
        <p>A capacitor stores energy in its electric field. Higher voltage = more stored energy.</p>
        <p><strong>Inductor:</strong> w_L = 1/2 L i<sup>2</sup></p>
        <p>An inductor stores energy in its magnetic field. Higher current = more stored energy.</p>
        <p>These are super important because they can release that energy back into the circuit later—like a battery that charges and discharges!</p>

        <h3>Quick Analogy (Gaming Style)</h3>
        <p>In a game:</p>
        <ul>
          <li>Energy = your total mana pool or health bar</li>
          <li>Power = how fast you're regenerating mana or taking damage</li>
          <li>Capacitor = a shield that stores energy and releases it when needed</li>
          <li>Inductor = a momentum effect that resists sudden changes</li>
        </ul>
      `
    }
  ],
  googleForm: {
    openUrl:
      "https://docs.google.com/forms/d/e/1FAIpQLSfMc2hFrdCMYTklM-PDV8oaxU1f0Hi9ojEqV-mwB04d_epecg/viewform?usp=header",
    iframeSrc:
      "https://docs.google.com/forms/d/e/1FAIpQLSfMc2hFrdCMYTklM-PDV8oaxU1f0Hi9ojEqV-mwB04d_epecg/viewform?embedded=true"
  }
};
