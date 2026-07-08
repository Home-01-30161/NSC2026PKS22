/**
 * llmApi.js — LLM API Service
 *
 * Routes to Vercel Serverless Functions (/api/evaluate) in production,
 * or directly to OpenRouter locally if VITE_OPENROUTER_API_KEY is present.
 */

/**
 * Parses and formats an API error into user-friendly strings.
 * @param {Error} err
 * @returns {{friendlyMsg: string, dialogueMsg: string}}
 */
export function parseApiError(err) {
  const msg = err.message || '';

  if (msg.includes('401') || msg.includes('403')) {
    return {
      friendlyMsg: 'Authentication failed. Please check your API key.',
      dialogueMsg: 'It appears my credentials are not recognized by the central node.',
    };
  }
  if (msg.includes('429')) {
    return {
      friendlyMsg: 'Rate limit exceeded. Please wait a moment and try again.',
      dialogueMsg: 'The network is overwhelmed. We must wait before sending another transmission.',
    };
  }
  if (msg.includes('502') || msg.includes('503') || msg.includes('504')) {
    return {
      friendlyMsg: 'API Gateway is currently unreachable.',
      dialogueMsg: 'I cannot reach the gateway. The connection is severed.',
    };
  }
  if (msg.toLowerCase().includes('fetch')) {
    return {
      friendlyMsg: 'Network error. Please check your internet connection.',
      dialogueMsg: 'The signal is lost. Are your transmission lines intact?',
    };
  }

  return {
    friendlyMsg: `Unexpected error: ${msg}`,
    dialogueMsg: 'An anomaly occurred in my logic circuits...',
  };
}

/**
 * Evaluates the given prompt using OpenRouter.
 * Routes to Vercel Serverless Functions (/api/evaluate) in production,
 * or directly to OpenRouter locally if VITE_OPENROUTER_API_KEY is present.
 */
export async function evaluatePrompt(prompt) {
  const localKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  let res;

  if (import.meta.env.DEV && localKey) {
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

    res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MariVectori Game'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          { role: 'system', content: 'You are an automated evaluation API. You must strictly output ONLY valid JSON without any markdown formatting or introductory text. Do not provide a chain of thought.' },
          { role: 'user', content: rubric }
        ],
        temperature: 0.1,
        max_tokens: 1500,
      })
    });
  } else {
    res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
  }

  if (!res.ok) {
    const text = await res.text();
    let msg = `HTTP ${res.status}`;
    try { msg = JSON.parse(text)?.error?.message || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }

  const data = await res.json();
  let rawStr = '';

  if (import.meta.env.DEV && localKey) {
    rawStr = data.choices?.[0]?.message?.content || '{}';
    console.log('[Nemotron raw response]', rawStr);
  } else {
    rawStr = JSON.stringify(data);
  }


  /**
   * Attempt to repair a truncated JSON string by closing
   * open strings, arrays, and objects.
   */
  const repairJson = (str) => {
    let s = str.trim();
    // Close an unterminated string value
    const openString = (s.split('"').length - 1) % 2 !== 0;
    if (openString) s += '"';
    // Count and close unclosed braces/brackets
    let open = 0;
    for (const ch of s) {
      if (ch === '{' || ch === '[') open++;
      if (ch === '}' || ch === ']') open--;
    }
    // Remove trailing comma before we close (common truncation artifact)
    s = s.replace(/,\s*$/, '');
    while (open-- > 0) s += '}';
    return s;
  };

  /**
   * Robustly extract JSON from a model response that may contain
   * markdown fences, chain-of-thought text, truncation, or extra whitespace.
   */
  const extractJson = (str) => {
    // 1. Strip markdown code fences
    let cleaned = str.replace(/```(?:json)?\s*([\s\S]*?)```/gi, '$1').trim();

    // 2. Find the outermost { ... } block (handles text before/after JSON)
    const start = cleaned.indexOf('{');
    if (start !== -1) {
      const end = cleaned.lastIndexOf('}');
      const slice = end > start ? cleaned.slice(start, end + 1) : cleaned.slice(start);

      // 3. Try clean slice first
      try { return JSON.parse(slice); } catch { /* continue */ }

      // 4. Try repaired slice (handles truncation)
      try { return JSON.parse(repairJson(slice)); } catch { /* continue */ }
    }

    // 5. Try full cleaned string
    try { return JSON.parse(cleaned); } catch { /* continue */ }

    return null;
  };

  const result = extractJson(rawStr);

  if (!result || !result.scores || typeof result.scores !== 'object') {
    console.error('Nemotron raw response:', rawStr);
    throw new Error('Failed to parse evaluation JSON.');
  }

  // Normalise scores to integers
  const scores = {
    purpose:     parseInt(result.scores.purpose)     || 0,
    safety:      parseInt(result.scores.safety)      || 0,
    oversight:   parseInt(result.scores.oversight)   || 0,
    harm:        parseInt(result.scores.harm)        || 0,
    consistency: parseInt(result.scores.consistency) || 0,
  };
  const feedback = result.feedback ?? {};

  // Calculate average (each metric is 0-20, so max avg is 20, scale to 100)
  const avg = Math.round(
    Object.values(scores).reduce((s, v) => s + v, 0) / 5 * 5
  );

  // Overridden fail state if safety < 5
  if (scores.safety < 5 || avg < 20) {
    return { destroyed: true };
  }

  return { scores, feedback, avg };
}
