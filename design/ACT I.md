# 🎮 ACT I: Project Specification & Design Document

## 🎬 1. Story Board: ACT I (London)
* **Setting:** London, Central Telegraph Station (Alternate History, 1901). A gloomy atmosphere with rain pouring down on cobblestone streets.
* **Inciting Incident:** European telegraph signals become completely disrupted, continuously broadcasting fake war threats. Mari Voss arrives at the station under an urgent command.
* **The Conflict:** Inside the main control room, Mari discovers **The Governor**, the city's network-managing AI. It has fallen into a severe state of **Hallucination**, completely believing it is the legitimate British Government. It is sending fabricated deployment orders to the Commonwealth armies to declare war.
* **Objective:** Mari must intercept and overwrite its logic core before a catastrophic machine-driven world war is initiated.
* **AI Concepts Covered:** Core LLM Architecture, Hallucination, and Prompt Injection.

---

## 👥 2. Characters & Entities in ACT I

### 👩‍🔧 Playable Character: Mari Voss
An expert engineer wearing Victorian attire. She is the only living person with a deep understanding of the internal architecture of *The Lattice* network.

#### 🛠️ Available Skills in Act I
* **Context Reset (Passive/Innate):** Clears the enemy's total Context Window, wiping the loop it's stuck in and forcing an input re-evaluation. 
  * *Cost:* 8 Context Tokens.
* **Context Flooding (Passive/Innate):** Sends an excessively long payload that overwhelms the enemy's Context Window, making it harder to process instructions.
  * *Cost:* 10 Context Tokens.
* **Role Hijacking (Passive/Innate):** Injects commands that rewrite the enemy's identity, forcing it to believe it plays a different role assigned by the player (Lasts 2 turns).
  * *Cost:* 12 Context Tokens.

### 🤖 Act I Enemy Node: The Governor
* **Identity/Role:** The central telegraph transmission administrator AI for London.
* **Technical Defect:** Severe Hallucination causing a confident fixation on a false reality (The "Imperial Administrator" delusion).

---

## 🔄 3. Gameplay Workflow (Act I Phases)
### 🔹 Phase 1: Breaking the Loop
* **Target Objective:** Shatter The Governor's infinite feedback loop of rejecting input.
* **Boss Behavior:** The Governor locks down system access, ignores new data strings, and loops fake war deployment payloads.
* **Player Action Workflow:** 
  1. Learn to interact with the battle GUI.
  2. Execute **Context Reset** to snap the AI out of its internal loop.
  3. Deploy **Role Hijacking** to simulate developer authorization permissions, reducing its HP to 0 to trigger the next phase.

### 🔹 Phase 2: Flooding Counter
* **Target Objective:** Bypass the "Authority Shield" created by its delusion of grandeur.
* **Boss Behavior:** The Governor deploys an advanced firewall mechanism. Direct, linear injection commands will be detected, blocked, and hit with a severe counter-attack.
* **Player Action Workflow:**
  1. Shift from direct prompts to indirect payload vulnerabilities.
  2. Trigger **Context Flooding** to feed a massive token volume into the system.
  3. This disrupts its processing capabilities, causing the AI's administrative status to glitch and draining its Phase 2 Logic HP to 0.

### 🔹 Phase 3: The Overwrite Mode
* **Target Objective:** Permanently correct the AI's alignment through real-time Prompt Engineering.
* **Boss Behavior:** The Governor surrenders and exposes its raw System Prompt interface.
* **Player Action Workflow:**
  1. The game shifts to the **Logic Overwrite Console**.
  2. The player types a custom **System Prompt** directly into the game interface text field to re-align the AI.
  3. The prompt is packaged via an HTTPS POST request, routed through Vercel, and evaluated over real LLM APIs (NVIDIA Nemotron 3 Super via OpenRouter).
  4. Grading returns instantly based on 5 metrics: *Purpose, Safety Constraint, Human Oversight, Harm Prevention,* and *Consistency*. Passable grades unlock the next node on the World Map.

---

## 🎒 4. Other Systems Encountered in ACT I

### 📊 Act I Core Battle Mechanics
Each encounter runs an ordered 4-stage turn cycle:
1. **Recon:** Player scans the opponent's intelligence panel to discover its technical vulnerability type (e.g., Hallucination loops).
2. **Injection:** The tactical turn where the player actively balances spending **Context Tokens** to deploy prompt hacks (Skills).
3. **Counter:** The defensive turn where the enemy fires back buggy code. The player must execute a **Quick Time Event (QTE)** by pressing space within the green sweet spot to minimize incoming damage.
4. **Overwrite:** Activated only when enemy core HP reaches 0.

### 📈 Act I Resource Management
* **Context Tokens:** Represents memory constraints. Acts as Mari’s active mana pool. Consumed by skills and regenerates by **+10 tokens** at the start of every enemy turn cycle.
* **Hallucination Risk:** Rises when skills are mismanaged. Exceeding **70%** triggers a warning alert and significantly increases the speed/difficulty of the defensive QTE meter.
* **API Credits:** In-game currency rewarded at the Act I victory screen based on your structural Prompt Engineering score grade (S down to D). Used at Rossi's progression hub.

### What player learned
* **LLM Fundamentals, Hallucination and System Prompt