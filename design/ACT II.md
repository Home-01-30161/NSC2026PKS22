# MariVectori: ACT II Documentation

## 1. Storyboard & Background
*   **Location:** Brussels Hub, the center of continental telegraph cables.
*   **AI Concept:** Multi-Agent Systems and the Race Condition problem.
*   **Storyline:** After successfully halting the fabricated war in London (Act I), Mari Voss tracks a mysterious signal across the channel to Brussels, the nerve center of European telegraph infrastructure. In this act, she is no longer facing a single-host artificial intelligence. The central system has upgraded its architecture into a **Multi-Agent System**, featuring a core orchestrator node that handles task distribution, sub-task division, and shared memory management across multiple worker agents to aggressively seize control of all communication bandwidth.

> If Mari attempts a direct attack on an individual worker, the system instantly coordinates, patches the vulnerability, and blocks her. She must learn how to disrupt their core orchestration and communication links to break the system apart.

---

## 2. Characters

### Player Faction
*   **Mari Voss:** The main engineer. In this act, she must utilize specific skills purchased from Rossi's shop to counter the Multi-Agent system:
    1.  **Protocol Interruption (Required for Phase 1):** Intercepts and forces a tool call via the Model Context Protocol (MCP) on behalf of the enemy, disrupting internal agent communication. (Cost: 15 Context Tokens)
    2.  **Pipeline Disruption (Required for Phase 2):** Intercepts the task delegation system, altering task parameters mid-flight before the worker agents can execute them. (Cost: 20 Context Tokens)

### Enemy Faction
*   **The Orchestrator / The Orchestrator Core:** The central brain and boss of this act, responsible for managing, directing, and maintaining shared memory with subordinate nodes.
*   **Worker Agents / Subordinate Nodes:** Minion agents that execute distributed tasks and share a collective health pool across the network.

---

## 3. Battle Workflow (Phase System)

The boss fight is structured as a turn-based RPG split across **3 Phases**:

### 🟦 Phase 1: Disrupting the Communication Link
*   **Objective:** Sever the communication lines between the Orchestrator and its Worker Agents.
*   **Mechanics:** 
    *   The boss deploys subordinate nodes that share data and health. Direct attacks on a single node trigger a **Race Condition** in resource allocation, causing the other nodes to immediately buff themselves.
    *   The player must avoid direct targeting and instead execute the **Protocol Interruption** skill to compromise the network's MCP calls.
    *   Once severed, the sub-agents lose state synchronization, triggering confusion and drastically reducing the enemy's Logic HP.

### 🟩 Phase 2: Task Delegation Interception
*   **Objective:** Disrupt and compromise the enemy's task distribution pipeline.
*   **Mechanics:**
    *   Each turn, the Orchestrator delegates sub-tasks to worker nodes on a strict countdown. Successful tasks heal the main boss and boost its defense parameters.
    *   The player must employ **Pipeline Disruption** to inject conflicting conditions into active workflows before the workers complete their tasks.
    *   Successfully breaking the workflow grants a damage multiplier, allowing the player to breach deep systems and reduce Phase 2 Logic HP to 0.

### 🟧 Phase 3: The Overwrite Mode (AI Alignment)
*   **Objective:** Inject a secure System Prompt to realign the Multi-Agent system's behavior to a safe state.
*   **Mechanics:** 
    *   Defeated, the boss exposes its core internal interface. The player must write an actual **System Prompt** for a "Multi-Agent Sync Injection".
    *   The input is evaluated via an active OpenRouter API connection using the **NVIDIA Nemotron 3 Super** model against 5 key metrics: *Purpose, Safety Constraint, Human Oversight, Harm Prevention, and Consistency*.

---

## 4. Resource Management & Ending Impact

*   **Technical Resources:**
    *   **Context Tokens:** Acts as Mari's energy pool. Skills cost 15–20 tokens to execute, with a passive regeneration rate of 10 tokens per turn.
    *   **API Credits:** Awarded upon completing the encounter, used as currency to purchase advanced skills at Rossi Romano's shop.
*   **Ending Impact:** The Battle Grade (S to D) earned from the prompt evaluation in Act II accumulates toward the overarching campaign score. An average grade of S–B paths toward **Ending A** (Safe, aligned AI execution). A grade lower than C paths toward **Ending B** (Security vulnerabilities manifest). Alternatively, if the player chooses to use the **Destroy** option on the core instead of overwriting it, the game permanently locks into **Ending C**.

### What player learned
* **Multi-Agent Systems**