import { useEffect, useMemo, useRef, useState } from "react";
import { split, order, handoff } from "./lib/steps.js";

const load = () => { try { return JSON.parse(localStorage.getItem("onestep") || "{}"); } catch { return {}; } };
const SAMPLE = "Finish the DBMS assignment, email my professor, do laundry, prep for Friday’s interview, reply to Sam";
const LEVELS = [["low", "Low"], ["medium", "Steady"], ["high", "Charged"]];

function Words({ text, as: T = "h1", className = "" }) {
  return <T className={className} aria-label={text}>{text.split(" ").map((w, i) => <span key={i}><span className="w" aria-hidden="true" style={{ "--i": i }}>{w}</span>{" "}</span>)}</T>;
}

export default function App() {
  const saved = useMemo(load, []);
  const [screen, setScreen] = useState(saved.steps?.length ? "focus" : "dump");
  const [text, setText] = useState("");
  const [energy, setEnergy] = useState(saved.energy || "medium");
  const [steps, setSteps] = useState(saved.steps || []);
  const [busy, setBusy] = useState(false), [leaving, setLeaving] = useState(false), [copied, setCopied] = useState(false), [panel, setPanel] = useState(false);
  const [prefs, setPrefs] = useState({ font: "system", contrast: false, motion: true, ...saved.prefs });
  const t0 = useRef(null), first = useRef(saved.first || null);

  useEffect(() => { localStorage.setItem("onestep", JSON.stringify({ steps, energy, prefs, first: first.current })); }, [steps, energy, prefs]);
  useEffect(() => { const d = document.documentElement.dataset; d.font = prefs.font; d.contrast = prefs.contrast; d.motion = prefs.motion ? "on" : "off"; }, [prefs]);

  const current = steps.find((s) => s.status === "todo");
  const done = steps.filter((s) => s.status === "done"), left = steps.filter((s) => s.status !== "done");

  async function start() {
    setBusy(true); t0.current = Date.now(); first.current = null;
    setSteps(order(await split(text), energy)); setBusy(false); setScreen("focus");
  }
  function complete() {
    if (leaving) return; setLeaving(true);
    setTimeout(() => {
      if (!first.current) first.current = Math.round((Date.now() - (t0.current || Date.now())) / 1000);
      setSteps((a) => a.map((s) => (s.id === current.id ? { ...s, status: "done" } : s))); setLeaving(false);
    }, prefs.motion ? 750 : 0);
  }
  const skip = () => setSteps((a) => [...a.filter((s) => s.id !== current.id), current]);
  async function stuck() {
    const small = await split(current.text, "stuck");
    setSteps((a) => { const i = a.findIndex((s) => s.id === current.id); return [...a.slice(0, i), ...small, ...a.slice(i + 1)]; });
  }
  const speak = () => { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(current.text)); };
  const reset = () => { setSteps([]); setText(""); setScreen("dump"); };

  return (
    <div className="app" data-energy={energy} data-pulse={leaving}>
      <div className="aura" aria-hidden="true" />
      <main>
        <header>
          <span className="brand"><i />OneStep</span>
          <button className="ghost" onClick={() => setPanel(!panel)} aria-expanded={panel}>Settings</button>
        </header>

        {panel && (
          <section className="sheet" aria-label="Settings">
            <label className="line">Typeface
              <select value={prefs.font} onChange={(e) => setPrefs({ ...prefs, font: e.target.value })}><option value="system">Standard</option><option value="legible">Easy to read</option></select></label>
            <label className="line">Higher contrast<input className="sw" type="checkbox" checked={prefs.contrast} onChange={(e) => setPrefs({ ...prefs, contrast: e.target.checked })} /></label>
            <label className="line">Animations<input className="sw" type="checkbox" checked={prefs.motion} onChange={(e) => setPrefs({ ...prefs, motion: e.target.checked })} /></label>
          </section>
        )}

        {screen === "dump" && (
          <section className="screen" key="dump">
            <Words text="What’s on your mind?" />
            <p className="sub fade" style={{ "--d": ".5s" }}>Type it all, in any order. We’ll turn it into small steps and show you one at a time.</p>
            <div className="fade" style={{ "--d": ".65s" }}>
              <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Everything you’re carrying right now…" aria-label="Everything you need to do" />
              <button className="ghost try" onClick={() => setText(SAMPLE)}>Try an example</button>
            </div>
            <div className="fade" style={{ "--d": ".8s" }}>
              <p className="label">How’s your energy?</p>
              <div className="seg" role="radiogroup" aria-label="Your energy" style={{ "--i": LEVELS.findIndex((l) => l[0] === energy) }}>
                {LEVELS.map(([k, n]) => <button key={k} role="radio" aria-checked={energy === k} onClick={() => setEnergy(k)}>{n}</button>)}
              </div>
            </div>
            <button className="primary fade" style={{ "--d": ".95s" }} disabled={!text.trim() || busy} onClick={start}>{busy ? "Making it small…" : "Make it small"}</button>
          </section>
        )}

        {screen === "focus" && current && (
          <section className={"screen center" + (leaving ? " leaving" : "")} key={current.id}>
            <p className="sub">{done.length === 0 ? "Start here" : `${done.length} done, ${left.length - 1} to go`}</p>
            <Ring minutes={current.minutes} finished={leaving} />
            <Words as="h2" className="step" text={current.text} />
            <button className="primary fade" style={{ "--d": ".5s" }} onClick={complete}>Done</button>
            <div className="quiet fade" style={{ "--d": ".6s" }}>
              <button className="ghost" onClick={stuck}>I’m stuck</button>
              <button className="ghost" onClick={skip}>Not now</button>
              <button className="ghost" onClick={speak}>Read aloud</button>
            </div>
            <div className="dots" aria-hidden="true">{steps.map((s) => <i key={s.id} className={s.status === "done" ? "d" : s.id === current.id ? "c" : ""} />)}</div>
            <button className="ghost end" onClick={() => setScreen("wrap")}>Finish for today</button>
          </section>
        )}

        {screen === "focus" && !current && (
          <section className="screen center" key="all">
            <Words text="That’s everything." />
            <p className="sub fade" style={{ "--d": ".5s" }}>{done.length} steps done{first.current != null ? `. You began within ${first.current} seconds.` : "."}</p>
            <button className="primary fade" style={{ "--d": ".7s" }} onClick={() => setScreen("wrap")}>See your note</button>
          </section>
        )}

        {screen === "wrap" && (
          <section className="screen" key="wrap">
            <Words text="Where you left off" />
            <p className="sub fade" style={{ "--d": ".5s" }}>A note for future you, or anyone picking this up.</p>
            <div className="paper fade" style={{ "--d": ".65s" }}>
              <h3>Finished</h3>
              <ul>{done.length ? done.map((s) => <li key={s.id} className="ok">{s.text}</li>) : <li className="none">Nothing yet</li>}</ul>
              <h3>Next up</h3>
              <p className="next">{left[0] ? left[0].text : "All clear. Nothing waiting."}</p>
              {left.length > 1 && <><h3>Still open</h3><ul>{left.slice(1).map((s) => <li key={s.id}>{s.text}</li>)}</ul></>}
            </div>
            <button className="primary fade" style={{ "--d": ".8s" }} onClick={() => { navigator.clipboard.writeText(handoff(steps, energy)); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>{copied ? "Copied" : "Copy note"}</button>
            <div className="quiet"><button className="ghost" onClick={() => setScreen("focus")}>Back to steps</button><button className="ghost" onClick={reset}>Start fresh</button></div>
          </section>
        )}
      </main>
    </div>
  );
}

function Ring({ minutes, finished }) {
  const total = minutes * 60, [left, setLeft] = useState(total);
  useEffect(() => { const i = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000); return () => clearInterval(i); }, []);
  const C = 2 * Math.PI * 54;
  return (
    <div className="ring" role="timer" aria-label={`About ${Math.ceil(left / 60)} minutes left`}>
      <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" className="track" /><circle cx="60" cy="60" r="54" className="arc" strokeDasharray={C} strokeDashoffset={finished ? 0 : C * (1 - left / total)} /></svg>
      {finished ? <svg className="check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> : <span>{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</span>}
    </div>
  );
}
