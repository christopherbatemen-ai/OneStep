const id = () => Math.random().toString(36).slice(2, 9);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const effortOf = (m) => (m <= 5 ? "easy" : m <= 10 ? "medium" : "hard");

export function ruleSplit(text) {
  return text.split(/[\n,;]+|\band\b/i).map((s) => s.trim()).filter(Boolean).map((t) => {
    const m = /email|call|text|reply|book|send/i.test(t) ? 5 : /essay|report|project|assignment|study|exam|prep/i.test(t) ? 15 : 10;
    return { id: id(), text: cap(t), minutes: m, effort: effortOf(m), status: "todo" };
  });
}

export function ruleShrink(step) {
  const t = step.text.replace(/\.$/, "");
  return [`Open whatever you need for “${t}”`, "Work on it for just two minutes", "Jot down what’s left"].map((text) => ({ id: id(), text, minutes: 2, effort: "easy", status: "todo" }));
}

export async function split(text, mode = "dump") {
  try {
    const r = await fetch("/.netlify/functions/split", { method: "POST", body: JSON.stringify({ text, mode }) });
    if (!r.ok) throw new Error();
    const { steps } = await r.json();
    if (!steps?.length) throw new Error();
    return steps.map((s) => ({ id: id(), text: s.text, minutes: s.minutes || 10, effort: s.effort || effortOf(s.minutes), status: "todo" }));
  } catch {
    return mode === "stuck" ? ruleShrink({ text }) : ruleSplit(text);
  }
}

export function order(steps, energy) {
  const rank = { easy: 0, medium: 1, hard: 2 };
  if (energy === "medium") return steps;
  return [...steps].sort((a, b) => (energy === "low" ? rank[a.effort] - rank[b.effort] : rank[b.effort] - rank[a.effort]));
}

export function handoff(steps, energy) {
  const done = steps.filter((s) => s.status === "done"), left = steps.filter((s) => s.status !== "done");
  const list = (a) => (a.length ? a.map((s) => `• ${s.text}`).join("\n") : "• Nothing");
  return `Where I left off\n\nFinished\n${list(done)}\n\nNext up\n${left[0] ? left[0].text : "All clear. Nothing waiting."}\n\nStill open\n${list(left.slice(1))}\n\nEnergy: ${energy}`;
}
