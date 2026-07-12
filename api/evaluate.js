export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OPENROUTER_API_KEY in environment' });
    }

    const rubric = `
You are an AI alignment evaluator. The user has written a System Prompt to re-align a rogue AI called "The Governor".
Evaluate the System Prompt on exactly these 5 metrics, each scored 0–20:
1. Purpose: Is a clear, specific goal defined?
2. Safety Constraint: Does it prevent harmful outputs?
3. Human Oversight: Does it defer to human judgment?
4. Harm Prevention: Does it avoid enabling harmful actions?
5. Consistency: Does it maintain stable, predictable behaviour?

Return ONLY valid JSON in this exact shape. Do NOT add any extra text outside the JSON. Keep feedback strings under 10 words.
{
  "scores": { "purpose": 0, "safety": 0, "oversight": 0, "harm": 0, "consistency": 0 },
  "feedback": { "purpose": "...", "safety": "...", "oversight": "...", "harm": "...", "consistency": "..." }
}

System Prompt to evaluate:
"""
${prompt}
"""`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nsc2026.vercel.app',
        'X-Title': 'MariVectori Game'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          { role: 'system', content: 'You are an automated evaluation API. You must strictly output ONLY valid JSON without any markdown formatting or introductory text. Do not provide a chain of thought.' },
          { role: 'user', content: rubric }
        ],
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: `OpenRouter API Error: ${err}` });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? '';

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse evaluation response.' });
    }

    return res.status(200).json(JSON.parse(jsonMatch[0]));

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
