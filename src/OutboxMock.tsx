import { useState } from "react";

type Outcome = "rollback" | "sent" | "retry";

const outcomes: {
  id: Outcome;
  label: string;
  database: string;
  service: string;
  detail: string;
}[] = [
  {
    id: "rollback",
    label: "Save rolls back",
    database: "No order row. No outbox row.",
    service: "No event.",
    detail: "The transaction never commits, so the worker has nothing to send.",
  },
  {
    id: "sent",
    label: "Commit, then the send succeeds",
    database: "The order row and the outbox row stay saved.",
    service: "The event arrives.",
    detail: "The worker reads the committed outbox row and sends it to Kafka.",
  },
  {
    id: "retry",
    label: "Commit, then the send fails",
    database: "The order row and the outbox row stay saved.",
    service: "No event yet.",
    detail: "The send fails, the outbox row remains, and the worker can retry later.",
  },
];

function Step({ title, text, on }: { title: string; text?: string; on: boolean }) {
  return (
    <div className={on ? "outbox-step is-on" : "outbox-step"}>
      <strong>{title}</strong>
      {text ? <span>{text}</span> : null}
    </div>
  );
}

export default function OutboxFlow() {
  const [outcome, setOutcome] = useState<Outcome>("sent");
  const selected = outcomes.find((item) => item.id === outcome) ?? outcomes[1];
  const committed = outcome !== "rollback";

  return (
    <div className="outbox-flow-wrap">
      <div className="outbox-choices" role="group" aria-label="Ending">
        {outcomes.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === outcome ? "is-on" : ""}
            aria-pressed={item.id === outcome}
            onClick={() => setOutcome(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="outbox-board">
        <div className="outbox-flow" aria-hidden="true">
          <Step title="Order service" text="Mark the order as PAID" on />
          <span className="outbox-arrow">↓</span>
          <Step title="One transaction" text="Order row and outbox row" on />
          <span className="outbox-arrow">↓</span>
          <div className="outbox-branch">
            <Step title="Rollback" text="Both rows disappear" on={outcome === "rollback"} />
            <Step title="Commit" text="Both rows stay" on={committed} />
          </div>
          <span className={committed ? "outbox-arrow" : "outbox-arrow is-dim"}>↓</span>
          <Step title="Worker" text="Read the outbox row" on={committed} />
          <span className={committed ? "outbox-arrow" : "outbox-arrow is-dim"}>↓</span>
          <div className="outbox-branch">
            <Step title="Kafka receives it" on={outcome === "sent"} />
            <Step title="Send fails" text="The row stays. Retry later." on={outcome === "retry"} />
          </div>
        </div>
        <aside className="outbox-states">
          <p>{selected.detail}</p>
          <div>
            <h2>Database</h2>
            <p>{selected.database}</p>
          </div>
          <div>
            <h2>Other service</h2>
            <p>{selected.service}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
