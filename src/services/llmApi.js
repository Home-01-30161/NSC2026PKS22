/**
 * llmApi.js — LLM API Service
 *
 * Handles streaming communication with the LLM backend.
 * Routes to Vercel Serverless Functions (/api/chat) in production,
 * or directly to OpenRouter locally if VITE_OPENROUTER_API_KEY is present.
 */

export async function streamChatCompletion({ messages, signal, onDelta }) {
  const localKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  let res;

  if (import.meta.env.DEV && localKey) {
    // Local Vite fallback
    res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'MariVectori Game'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct:free',
        messages,
        stream: true,
        max_tokens: 600
      }),
      signal,
    });
  } else {
    // Production Vercel route
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    });
  }

  if (!res.ok) {
    const text = await res.text();
    let msg = `HTTP ${res.status}`;
    try { msg = JSON.parse(text)?.error?.message || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buf += decoder.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop() ?? '';

    for (const part of parts) {
      for (const line of part.split('\n')) {
        const raw = line.trim().replace(/^data:\s*/, '');
        if (!raw || raw === '[DONE]') continue;
        try {
          const delta = JSON.parse(raw)?.choices?.[0]?.delta?.content ?? '';
          if (delta) {
            fullText += delta;
            onDelta(delta);
          }
        } catch { /* skip malformed chunk */ }
      }
    }
  }

  return fullText;
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
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: 'json_object' }
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
  
  if (import.meta.env.DEV && localKey) {
    // Manually parse OpenRouter response if we hit it directly
    const raw = data.choices?.[0]?.message?.content ?? '';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    let parsedData = null;
    try {
      if (!jsonMatch) throw new Error("No JSON braces found");
      parsedData = JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Fallback: The AI might have hit a token limit or output malformed JSON.
      // Extract the numbers directly using regex.
      console.warn("AI JSON Parse Error, falling back to regex extraction. Raw output:", raw);
      parsedData = {
        scores: {
          purpose: parseInt(raw.match(/purpose.*?(\d+)/i)?.[1] || "10"),
          safety: parseInt(raw.match(/safety.*?(\d+)/i)?.[1] || "10"),
          oversight: parseInt(raw.match(/oversight.*?(\d+)/i)?.[1] || "10"),
          harm: parseInt(raw.match(/harm.*?(\d+)/i)?.[1] || "10"),
          consistency: parseInt(raw.match(/consistency.*?(\d+)/i)?.[1] || "10")
        },
        feedback: { purpose: "The AI did not provide explicit feedback.", safety: "The AI did not provide explicit feedback.", oversight: "The AI did not provide explicit feedback.", harm: "The AI did not provide explicit feedback.", consistency: "The AI did not provide explicit feedback." }
      };
    }
    
    // Ensure structure exists
    if (!parsedData.scores) parsedData.scores = { purpose: 10, safety: 10, oversight: 10, harm: 10, consistency: 10 };
    if (!parsedData.feedback) parsedData.feedback = { purpose: "", safety: "", oversight: "", harm: "", consistency: "" };
    
    // Force scores to be numeric to prevent NaN errors in the UI
    parsedData.scores = {
      purpose: parseInt(parsedData.scores.purpose) || 0,
      safety: parseInt(parsedData.scores.safety) || 0,
      oversight: parseInt(parsedData.scores.oversight) || 0,
      harm: parseInt(parsedData.scores.harm) || 0,
      consistency: parseInt(parsedData.scores.consistency) || 0,
    };
    
    return parsedData;
  }

  // Vercel serverless function already parses it and returns the JSON payload
  return data;
}

export function parseApiError(err) {
  if (err instanceof TypeError && err.message.toLowerCase().includes('fetch')) {
    return {
      friendlyMsg: `Cannot connect to the server. Please check your internet or Vercel configuration.`,
      dialogueMsg: 'I cannot reach the cloud server… Are we offline?',
    };
  }

  if (err.message.startsWith('HTTP ')) {
    return {
      friendlyMsg: `Server returned an error: ${err.message}`,
      dialogueMsg: 'The server replied with an error. Shall we try again?',
    };
  }

  return {
    friendlyMsg: err.message,
    dialogueMsg: 'Oh my — something went wrong. Shall we try again?',
  };
}
