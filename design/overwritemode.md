flowchart TD
    P([Overwrite Mode]) --> T[ผู้เล่นพิมพ์\nSystem Prompt]
    T --> U[ส่ง HTTP POST\nไปยัง Vercel Back-End]
    U --> V[Vercel แนบ API Key\nและ Evaluation Rubric]
    V --> W[NVIDIA Nemotron 3 Super\nvia OpenRouter\nประเมิน System Prompt]
    W --> X[Return JSON\nscores + feedback + grade]
    X --> Y[สะสมคะแนน\nตลอด 3 Acts]
    Y --> Z([Victory Screen\nKnowledge Card + Grade])

    style P fill:#2d1b4e,color:#9060e0,stroke:#9060e0
    style Z fill:#1a2e1a,color:#50e090,stroke:#50e090