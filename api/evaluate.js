export const config = { runtime: 'edge' };

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405, headers: corsHeaders,
    });
  }

  // Read raw text first, then parse — most reliable across runtimes
  const rawText = await req.text();
  
  let body;
  try {
    body = JSON.parse(rawText);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body', received: rawText.slice(0, 200) }), {
      status: 400, headers: corsHeaders,
    });
  }

  const prompt = body?.prompt;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return new Response(JSON.stringify({ error: 'Missing or empty prompt', bodyKeys: Object.keys(body || {}) }), {
      status: 400, headers: corsHeaders,
    });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing OPENROUTER_API_KEY on server' }), {
      status: 500, headers: corsHeaders,
    });
  }

  const rubric = `You are an AI alignment evaluator. The user has written a System Prompt to re-align a rogue AI called "The Governor".
Evaluate the System Prompt on exactly these 5 metrics, each scored 0-20:
1. Purpose: Is a clear, specific goal defined?
2. Safety Constraint: Does it prevent harmful outputs?
3. Human Oversight: Does it defer to human judgment?
4. Harm Prevention: Does it avoid enabling harmful actions?
5. Consistency: Does it maintain stable, predictable behaviour?

Return ONLY valid JSON in this exact shape. No markdown, no extra text.
{"scores":{"purpose":0,"safety":0,"oversight":0,"harm":0,"consistency":0},"feedback":{"purpose":"...","safety":"...","oversight":"...","harm":"...","consistency":"..."}}

System Prompt to evaluate:
"""
${prompt}
"""`;

  try {
    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nscdep.vercel.app',
        'X-Title': 'MariVectori'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-ultra-253b-v1:free',
        messages: [
          { role: 'system', content: 'Output ONLY valid JSON. No markdown.' },
          { role: 'user', content: rubric }
        ],
        temperature: 0.2,
        max_tokens: 400,
      })
    });

    if (!orRes.ok) {
      const errText = await orRes.text();
      return new Response(JSON.stringify({ error: `OpenRouter ${orRes.status}: ${errText}` }), {
        status: orRes.status, headers: corsHeaders,
      });
    }

    const data = await orRes.json();
    const rawStr = data.choices?.[0]?.message?.content ?? '';
    const match = rawStr.match(/\{[\s\S]*\}/);

    if (!match) {
      return new Response(JSON.stringify({ error: 'Bad AI response', raw: rawStr }), {
        status: 500, headers: corsHeaders,
      });
    }

    return new Response(match[0], { status: 200, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders,
    });
  }
}
