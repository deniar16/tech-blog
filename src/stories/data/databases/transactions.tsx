import { Figure, Steps } from "../../../story-ui";
import type { StoryMeta } from "../../index";

export const meta: StoryMeta = {
  slug: "transactions",
  title: "One transaction, one result",
  date: "Sep 28, 2026",
  published: "2026-09-28",
  minutes: "6 min",
  lede: "A transfer must not stop halfway. The sender's balance down, and the receiver's balance unchanged, is a state that must not be stored.",
  sample: true,
};

export default function TransactionStory() {
  return (
    <>
      <p>
        The two writes in a transfer — the sender's balance goes down, the
        receiver's balance goes up — have to be one result. Both are stored, or
        neither is.
      </p>
      <h2>The boundary</h2>
      <p>
        One transaction gathers writes that must succeed together. Commit makes
        both of them visible to other readers. Rollback makes both of them look
        as if they were never written.
      </p>
      <Figure caption="Debit and credit share one boundary. A message to the outside waits for commit.">
        <Steps items={["Begin", "Debit", "Credit", "Commit"]} />
      </Figure>
      <h2>Four properties, for this story</h2>
      <dl className="facts">
        <div>
          <dt>Atomic</dt>
          <dd>Every write inside the boundary finishes, or none of them is stored.</dd>
        </div>
        <div>
          <dt>Consistent</dt>
          <dd>The rules the database enforces are still true after commit.</dd>
        </div>
        <div>
          <dt>Isolated</dt>
          <dd>Other transactions do not see a debit that has not been committed.</dd>
        </div>
        <div>
          <dt>Durable</dt>
          <dd>After commit, the result remains even if the process dies.</dd>
        </div>
      </dl>
      <h2>A message to another system</h2>
      <p>
        Sending an email or an event inside a transaction that has not committed
        has a hole: the transaction can roll back after the message has already
        left. The safe order is to write the business change and an outbox row
        in the same transaction. Another process reads that row after commit,
        then sends the message.
      </p>
      <div className="split">
        <section>
          <h3>Inside the transaction</h3>
          <p>Debit, credit, and one outbox row. Those three writes are one result.</p>
        </section>
        <section>
          <h3>After commit</h3>
          <p>
            A separate process reads the outbox and sends the message. If sending
            fails, the row is still there to try again.
          </p>
        </section>
      </div>
      <h2>What this story does not decide</h2>
      <p>
        A stricter isolation level, and the lock that holds two transfers on the
        same account, need a story of their own. For a simple transfer, the
        transaction boundary already answers the main question.
      </p>
    </>
  );
}
