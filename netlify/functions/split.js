// Optional AI breakdown. Set ANTHROPIC_API_KEY in Netlify. Without it the app uses its built-in rules.
export async function handler(event) {
  try {
    const { text, mode } = JSON.parse(event.body || "{}");
    if (!process.env.ANTHROPIC_API_KEY || !text) return { statusCode: 501, body: "{}" };
    const ask = mode === "stuck" ? "Split this one step into 3 much smaller steps of 1-3 minutes." : "Turn this brain dump into small, concrete steps of 5-15 minutes each.";
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5", max_tokens: 800,
        system: 'Reply with JSON only: {"steps":[{"text":"short imperative sentence","minutes":number}]}. Kind, plain wording, no guilt.',
        messages: [{ role: "user", content: `${ask}\n\n${text}` }] }),
    });
    const j = await r.json();
    const raw = j.content?.[0]?.text || "";
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1))) };
  } catch { return { statusCode: 500, body: "{}" }; }
}
