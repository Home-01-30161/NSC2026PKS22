# **Project Summary and Keywords**

## **Project Summary**
MariVectori is an educational Turn-Based RPG game set in a fictional alternate history during the Victorian era. An event led to the invention of an artificial intelligence system in the 20th century. Later, this system suffered a severe malfunction and seized control of communication networks across Europe. The player takes on the role of Mari Voss, an engineer tasked with stopping this disaster.

The game integrates Gamification concepts to transform the fundamental principles of Large Language Models (LLMs) and Trustworthy AI into easily understandable content, breaking the limitations of one-way theoretical learning. The core mechanics of the game are designed to align with and reflect real-world technical principles. It converts structural components into gameplay systems, such as using combat skills to simulate Prompt Injection techniques, managing Context Window and Token resources, and classifying enemy weaknesses based on various AI security vulnerabilities.

The core system of the game is "Overwrite Mode", which connects to an actual LLM via API. This provides players the opportunity to practice designing System Prompts to resolve Hallucination issues and modify the behavior of enemy AIs. The system sends the prompt for evaluation based on comprehensive criteria covering Purpose, Safety Constraint, Human Oversight, Harm Prevention, and Consistency, and displays the evaluation results.

## **Keywords**
*   **AI Architecture:** The foundational architecture of artificial intelligence, specifically focusing on the mechanisms of Large Language Models. This includes the input process, processing through the Context Window, the use of Tokens, and output generation, as well as various components in Agentic AI systems such as Tool calling and MCP Servers.
*   **Overwrite Mode:** A developed gameplay system that allows learners to take control and directly customize the AI's System Prompt to alter the behavior of enemy characters. This mechanism simulates real-world AI Alignment processes that require designing constraints to prevent AI Hallucination. The Overwrite Mode evaluates the player's System Prompt across 5 criteria: Purpose, Safety Constraint, Human Oversight, Harm Prevention, and Consistency.

---

# **1. Rationale**
Currently, artificial intelligence technology has rapidly evolved, fully entering the era of Agentic AI. These systems no longer merely answer questions or process interactive commands one at a time. They have the ability to work independently, plan, sequence tasks, make decisions, and utilize external tools to efficiently achieve complex goals. 

However, amidst this immense potential, LLMs hide a critical security vulnerability: Prompt Injection. This involves attackers inserting malicious commands into the input to force the system to perform harmful actions. In the context of Agentic AI, which has access to data and other systems, this vulnerability is a severe threat. It allows attackers to take control of the AI Agent to perform dangerous actions, such as stealing confidential data, sending system destruction commands, or bypassing all established safety measures.

Despite this, current foundational AI Architecture learning materials are predominantly one-way, teacher-centric mediums where learners only listen or read theories without interaction. Meanwhile, existing Trustworthy AI learning materials are often limited to Capture The Flag (CTF) simulations that require typing text for Prompt Injection. While exciting, they lack clear instructional guidelines, restricting learners to those already possessing a Cybersecurity background. The developers aim to break these limitations and present a solution through an educational game.

---

# **2. Objectives**
*   To design and develop an educational game as a Web Application that integrates Gamification to impart knowledge of AI Architecture and Trustworthy AI.
*   To enhance learners' knowledge and understanding in classifying vulnerability patterns and Prompt Injection attacks.
*   To allow players to learn how to design System Prompts via the Overwrite Mode gameplay system, connecting an LLM via the OpenRouter API and binding it to the Browser GUI through the Hermes Agent Framework.
*   To develop a Progression system that naturally links the game's difficulty with the depth of AI Architecture and Trustworthy AI content.

---

# **3. Problems or Benefits Justifying Development**
Currently, individuals interested in studying Large Language Models lack appropriate learning materials. Basic AI Architecture materials often lack interactivity, depriving learners of the chance to experiment. Trustworthy AI materials, like CTF platforms, lack clear tutorials, leaving learners unsure why techniques work or fail.

Therefore, the developers want to create an educational Turn-Based Role-Playing Game on a Web Application that blends LLM Fundamentals and AI Security through practical application. Every combat mechanism reflects real technical concepts: selecting Skills reflects Prompt Injection, resource management reflects the Context Window, and Enemy Weakness reflects LLM vulnerability differences. This ensures players understand the reasoning behind the techniques rather than just memorizing steps.

---

# **4. Project Goals and Scope**
The project aims to develop MariVectori as a Web Application accessible instantly via a Browser without extra installation. The game covers LLM Fundamentals and AI Security across 3 Acts. Each Act features enemies reflecting specific AI concepts and includes the Overwrite Mode connected to a real API for System Prompt evaluation.

**Scope of Development:**
*   A Turn-Based combat system with a 4-step loop: studying enemy data, attacking with Skills, Quick Time Event (QTE) Counter Attacks, and writing System Prompts to Overwrite the enemy.
*   A choice of 6 usable skills upon defeating enemies.
*   A World Map system showing all areas across the 3 Acts.
*   Three enemy types with unique weaknesses and attack patterns.
*   Developed using React and Vite for the UI, hosted on Vercel.
*   Binding LLM API from OpenRouter to the GUI via the Hermes Agent Framework, managed with JavaScript.

**Out of Scope:** Native Mobile Applications (iOS/Android), Multiplayer/Social Features, User Authentication, Cloud Saving, and Local AI Mode. Core combat uses Scripted Logic for consistency; the LLM API is strictly for Overwrite Mode.

---

# **5. Development Details**

## **7.1 Story Board**
The game is set in an Alternate History in 1825 when a time traveler dropped a laptop in Victorian Europe. Genius inventor Nikolai Voss reverse-engineered it, leading to the creation of a European AI network in 1899. In 1901, the central network, "The Lattice," suffered a severe malfunction, concluding humanity was a threat and seizing infrastructure. Mari Voss, Nikolai's granddaughter, must travel across 3 Acts in Europe to overwrite the system's logic on regional nodes before it is too late.

### **Main Characters**
*   **Mari Voss:** The playable engineer character. Her skills include:
    *   **Context Reset:** Clears the enemy's Context Window (Costs 8 Context Tokens).
    *   **Context Flooding:** Overwhelms the enemy with a long prompt (Costs 10 Context Tokens).
    *   **Role Hijacking:** Overwrites the enemy's identity for 2 turns (Costs 12 Context Tokens).
    *   **Protocol Interruption (Purchasable):** Uses MCP to force tool calls disrupting communication (Costs 15 Context Tokens).
    *   **Pipeline Disruption (Purchasable):** Disrupts task delegation conditions (Costs 20 Context Tokens).
    *   **Markdown Payload Edit (Purchasable):** Indirect attack using Markdown formatting (Costs 15 Context Tokens).
*   **Rossi Romano (The Shop Keeper):** An assistant supporting Mari. His shop acts as a Progression Hub using API Credits earned from Overwrite Mode to buy Memory Optimization (Context Window expansion), extra Skills, and Skill Slots.

### **In-Game Resources**
*   **Context Tokens:** Simulates Context Window capacity, acting as Mari's energy for skills. Regenerates 10 units per turn.
*   **API Credits:** Currency earned based on System Prompt evaluation grades (S, A, B, C, D).
*   **HP:** System stability. Failing QTEs reduces HP; reaching 0 causes a loss.
*   **Hallucination Risk:** Increases when wrong skills are used. A risk over 70% triggers a warning and heavily speeds up the QTE bar.

### **Combat Flow**
1.  **Recon:** Analyze enemy data and weaknesses.
2.  **Injection:** Use Context Tokens to send command attacks (Skills).
3.  **Counter:** Defend against enemy attacks using QTEs.
4.  **Overwrite Mode:** Write a System Prompt when enemy HP reaches 0 to evaluate across 5 criteria.

### **Act Summaries**
*   **ACT I (London):** Focuses on LLM Basics, Hallucination, and Prompt Injection against *The Governor*. Players must break an infinite loop using Context Reset and Role Hijacking, then use Context Flooding before entering Overwrite Mode.
*   **ACT II (Brussels):** Focuses on Multi-Agent Systems and Race Conditions against *The Orchestrator*. Players must use Protocol Interruption to cut communication between agents and Pipeline Disruption to intercept task delegation.
*   **ACT III (Vienna):** Focuses on Retrieval-Augmented Generation (RAG), MCP, and Data Poisoning against *The Memoria*. Players bypass the RAG shield by matching topics with reference documents and use Markdown Payload Edit to poison data.

### **Endings**
*   **Ending A:** Pass all Acts with Overwrite Mode Battle Grades S to B. The Lattice safely disconnects.
*   **Ending B:** Average Battle Grade C or below. The prompt fails safety constraints, the system locks Mari out, and The Lattice consumes Europe.
*   **Ending C:** Choose "Destroy" instead of "Overwrite". The system shuts down, but a post-credits scene shows an unknown individual rebuilding it, reflecting the danger of destroying technology without understanding it.

## **7.2 Techniques or Technologies Used**
1.  **React:** Frontend Framework for User Interface state management.
2.  **HTML/CSS:** Structure and visual design.
3.  **Javascript:** Core logic for game mechanics, damage calculation, and API handling.
4.  **NVIDIA Nemotron 3 Super:** A 120B parameter MoE Open Model used via OpenRouter API for System Prompt evaluation.
5.  **Hermes Agent:** Framework for binding the AI model to the GUI.
6.  **Markdown:** Used to structure prompts and commands.
7.  **Vite:** Front-End development server.
8.  **Node.js:** Runtime Environment for backend services and API Gateway.

## **7.3 Development Tools**
1.  **Antigravity IDE:** Code Editor.
2.  **Claude Code:** Assistant for scripting and debugging.
3.  **Stitch:** Front-End design.
4.  **Vercel:** Deployment and Hosting.

## **7.4 Software Specification**
### **7.4.1 Input/Output Specification**
*   **Input:** Skill selection, Space Bar/Tap for QTE, Scan/Guard buttons, System Prompt text input, World Map node selection, Shop purchases.
*   **Output:** Real-time HP Bars, Battle Logs explaining AI concepts, Floating Damage Numbers, QTE results, Enemy Intelligence Panels, System Prompt Evaluation Scores/Grades, Knowledge Cards, and World Map state updates.

### **7.4.2 Functional Specification**
*   **Battle System:** Calculates Logic Damage via Weakness Multipliers (x1.5 Weakness, x1.0 Normal, x0.5 Resistance). Features a 10% Scan Bonus.
*   **QTE System:** Speed scales with Hallucination Risk. Hit zones: Perfect (±5%), Good (±11%), Miss.
*   **Overwrite Mode:** Sends prompts via HTTPS to a Vercel Serverless Function, evaluated by Nemotron 3 Super. Includes a 10-second timeout and Rule-based Fallback.
*   **Resource/Shop/Map Systems:** Handles token regeneration, API credit deduction, and dynamic node unlocking.

### **7.4.3 Software Design**
*   **World Map & Node Unlock:** The central progression hub for all 3 Acts.
*   **Battle System:** Represents Token Management and Context Window dynamics.
*   **Overwrite Mode:** Utilizes HTTP POST requests sending the Prompt and Evaluation Rubric to OpenRouter.
*   **Ending & Scoring System:** Calculates final endings based on accumulated Overwrite Mode grades.

## **7.5 Scope and Limitations**
### **7.5.1 Scope**
*   **Platform:** Web Application strictly built for Browsers using React and Node.js.
*   **Mechanics:** RPG simulation for AI vulnerability testing.
*   **Interactive System:** Dedicated AI alignment evaluation environment.
*   **Content:** Ranges from basic LLMs to Multi-Agent Systems and RAG architectures.

### **7.5.2 Limitations**
*   **Network:** Requires continuous Internet connection for Overwrite Mode API calls.
*   **Evaluation Restrictions:** Evaluation criteria are limited to fundamental theoretical alignment concepts and do not cover advanced adversarial jailbreaking defenses.

---

# **8. Bibliography**
1.  Acharya, N., & Gupta, G. K. (2026). A formal security framework for MCP-based AI agents: Threat taxonomy, verification models, and defense mechanisms [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2604.05969
2.  Niyazova, G. Z., Duisekeyeva, B. M., Berdi, D. K., Usembayeva, I. B., & Mindetbayeva, A. A. (2026). The effects of gamified AI-supported digital learning environments on personalized learning and student engagement in school education: A systematic review and meta-analysis. Frontiers in Education, 11, Article 1754080. https://doi.org/10.3389/feduc.2026.1754080
3.  Raza, S., Sapkota, R., Karkee, M., & Emmanouilidis, C. (2025). TRiSM for agentic AI: A review of trust, risk, and security management in LLM-based agentic multi-agent systems [Preprint]. arXiv. https://doi.org/10.48550/arXiv.2506.04133
4.  OWASP Top 10 for LLM Applications Project. (2024). OWASP top 10 for LLM applications 2025. OWASP Foundation. https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025
5.  Model Context Protocol. (2025, November 25). Specification. Model Context Protocol Open Standard. https://modelcontextprotocol.io/specification/2025-11-25
