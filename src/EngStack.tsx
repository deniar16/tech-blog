import { useEffect, useState } from "react";
import { pillars, type Pillar } from "./pillars";

function tone(pillar: Pillar): React.CSSProperties {
  return {
    "--accent": pillar.accent,
    "--deep": pillar.deep,
    "--wash": pillar.wash,
  } as React.CSSProperties;
}

function Icon({ id }: { id: string }) {
  if (id === "context") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect x="3" y="7" width="18" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8 24h8M12 20v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="16" y="11" width="13" height="15" rx="2" fill="white" stroke="currentColor" strokeWidth="1.7" />
        <path d="M22.5 16.2v6.2M20.2 18.4h4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "harness") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect x="4" y="6" width="24" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 26h8M16 22v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M9 17v-3M14 17V11M19 17v-5M24 17V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "loop") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M10 12a6 6 0 0 1 10.2-2.2L22 8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M22 20a6 6 0 0 1-10.2 2.2L10 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M20.2 7.2 22.4 8.2 21.2 10.2M11.8 24.8 9.6 23.8 10.8 21.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="4" y="6" width="24" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 26h8M16 22v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M8 11h12M8 15h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function Arrow({ dir, hot }: { dir: "up" | "down" | "left" | "right"; hot: boolean }) {
  const rot = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <span className={hot ? "arrow is-hot" : "arrow"} aria-hidden="true">
      <svg viewBox="0 0 20 20" style={{ transform: `rotate(${rot}deg)` }}>
        <path d="M4 10h10M11 6l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Node({
  label,
  on,
  wide,
  onPick,
}: {
  label: string;
  on: boolean;
  wide?: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      className={wide ? (on ? "node node-wide is-on" : "node node-wide") : on ? "node is-on" : "node"}
      aria-pressed={on}
      onClick={(event) => {
        event.stopPropagation();
        onPick();
      }}
    >
      {label}
    </button>
  );
}

function StackFlow({
  pillar,
  step,
  onPick,
}: {
  pillar: Pillar;
  step: number;
  onPick: (index: number) => void;
}) {
  return (
    <div className="flow">
      <Node label={pillar.topLeft} on={step === 0} onPick={() => onPick(0)} />
      <Arrow dir="right" hot={step === 1} />
      <Node label={pillar.topRight} on={step === 1} onPick={() => onPick(1)} />

      {pillar.loopBack ? <Arrow dir="up" hot={step === 0} /> : <span className="gap" />}
      <span className="gap" />
      <Arrow dir="down" hot={step === 2} />

      <Node label={pillar.lowerLeft} on={step === 3} onPick={() => onPick(3)} />
      <Arrow dir="left" hot={step === 3} />
      <Node label={pillar.lowerRight} on={step === 2} onPick={() => onPick(2)} />

      <span className="gap" />
      <Arrow dir="down" hot={step === 4} />
      <span className="gap" />

      <Node label={pillar.foot} on={step === 4} wide onPick={() => onPick(4)} />
    </div>
  );
}

function LoopFlow({ step, onPick }: { step: number; onPick: (index: number) => void }) {
  return (
    <div className="flow flow-loop">
      <Node label="Goal" on={step === 0} onPick={() => onPick(0)} />
      <Arrow dir="right" hot={step === 1} />
      <Node label="Plan" on={step === 1} onPick={() => onPick(1)} />

      <span className="gap" />
      <span className="gap" />
      <Arrow dir="down" hot={step === 2} />

      <Node label="Review" on={step === 3} onPick={() => onPick(3)} />
      <Arrow dir="left" hot={step === 3} />
      <Node label="Act" on={step === 2} onPick={() => onPick(2)} />

      <Arrow dir="down" hot={step === 4} />
      <span className="gap" />
      <span className="gap" />

      <Node label="Retry or Stop" on={step === 4} onPick={() => onPick(4)} />
      <Arrow dir="right" hot={step === 5} />
      <Node label="Final Output" on={step === 5} onPick={() => onPick(5)} />
    </div>
  );
}

export default function EngStack() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [useKey, setUseKey] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pinned, setPinned] = useState(false);

  const active = pillars.find((pillar) => pillar.id === activeId) ?? null;

  useEffect(() => {
    if (!active || paused || pinned) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % active.steps.length);
    }, 1300);
    return () => window.clearInterval(timer);
  }, [active, paused, pinned]);

  useEffect(() => {
    if (!activeId) return;
    document.getElementById(`pillar-${activeId}`)?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeId]);

  function selectPillar(id: string) {
    setActiveId(id);
    setUseKey(null);
    setStep(0);
    setPinned(false);
  }

  function pickUse(pillarId: string, index: number) {
    const key = `${pillarId}:${index}`;
    if (activeId !== pillarId) {
      setActiveId(pillarId);
      setStep(0);
      setPinned(false);
    }
    setUseKey((current) => (current === key ? null : key));
  }

  function pickStep(pillarId: string, index: number) {
    if (activeId !== pillarId) setUseKey(null);
    setActiveId(pillarId);
    setStep(index);
    setPinned(true);
  }

  function onBannerKey(event: React.KeyboardEvent, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const next = event.key === "ArrowRight" ? index + 1 : index - 1;
      const pillar = pillars[(next + pillars.length) % pillars.length];
      selectPillar(pillar.id);
      document.getElementById(`tab-${pillar.id}`)?.focus();
    }
  }

  const stepLabel = active ? active.steps[step] ?? active.steps[0] : null;

  return (
    <div className="stack">
      <div className="poster">
        <h2 className="poster-title">
          Prompt Engineering vs Context Engineering vs Harness Engineering vs Loop Engineering
        </h2>
        <p className="poster-hint">
          Click a column. Then click a use to see an example sentence.
          The flow underneath runs on its own. Click a box if you want to pause on one step.
        </p>

        <div className={active ? "columns has-selection" : "columns"}>
          {pillars.map((pillar, index) => {
            const selected = pillar.id === activeId;
            const shownStep = selected ? step : 0;
            return (
              <article
                key={pillar.id}
                id={`pillar-${pillar.id}`}
                className={selected ? "pillar is-selected" : "pillar"}
                style={tone(pillar)}
                onMouseEnter={() => selected && setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                <div className="badge">
                  <Icon id={pillar.id} />
                </div>
                <h3>
                  <button
                    id={`tab-${pillar.id}`}
                    type="button"
                    className="banner"
                    aria-pressed={selected}
                    onClick={() => selectPillar(pillar.id)}
                    onKeyDown={(event) => onBannerKey(event, index)}
                  >
                    <span>{pillar.name.replace(" Engineering", "")}</span>
                    <span>Engineering</span>
                  </button>
                </h3>
                <div className="pillar-body">
                  <p className="chip">What it is</p>
                  <p className="def">{pillar.definition}</p>
                  <p className="chip">Where to use it</p>
                  <ul className="uses">
                    {pillar.uses.map((use, useIndex) => {
                      const key = `${pillar.id}:${useIndex}`;
                      const open = useKey === key;
                      return (
                        <li key={use.title}>
                          <button
                            type="button"
                            className="use"
                            aria-expanded={open}
                            onClick={() => pickUse(pillar.id, useIndex)}
                          >
                            {use.title}
                          </button>
                          {open && <p className="example">{use.example}</p>}
                        </li>
                      );
                    })}
                  </ul>
                  {pillar.layout === "loop" ? (
                    <LoopFlow step={shownStep} onPick={(index) => pickStep(pillar.id, index)} />
                  ) : (
                    <StackFlow
                      pillar={pillar}
                      step={shownStep}
                      onPick={(index) => pickStep(pillar.id, index)}
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <p className="status">
          <span className="sr-only">
            {active ? `${active.name} selected` : "No column selected"}
          </span>
          <span aria-hidden="true">
            {active && stepLabel
              ? `${active.name} · step ${step + 1} of ${active.steps.length} · ${stepLabel}`
              : "No column selected"}
          </span>
          {pinned && (
            <button type="button" className="resume" onClick={() => setPinned(false)}>
              Run again
            </button>
          )}
        </p>
      </div>

      <div className="notes">
        {pillars.map((pillar) => (
          <section
            key={pillar.id}
            className={pillar.id === activeId ? "note is-current" : "note"}
            style={tone(pillar)}
          >
            <h3>{pillar.name}</h3>
            <p>{pillar.note}</p>
          </section>
        ))}
      </div>

      <p className="credit">
        The four columns follow a diagram circulated by Rocky Bhatia. This version
        adds example sentences, and a flow you can step through.
      </p>
    </div>
  );
}
