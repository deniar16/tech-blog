import type { StoryMeta } from "../../index";

export const meta: StoryMeta = {
  slug: "solid",
  title: "SOLID, used as a check",
  date: "Oct 11, 2026",
  published: "2026-10-11",
  minutes: "5 min",
  lede: "These five letters are not a sequence of steps. They help when a module starts having two unrelated reasons to change.",
  sample: true,
};

const principles = [
  {
    letter: "S",
    title: "One reason to change",
    body: "A type that both decides a business rule and writes to the database will change for two unrelated reasons. Split it at that boundary.",
  },
  {
    letter: "O",
    title: "Add behavior without editing what is stable",
    body: "A new branch in the middle of a function that many callers already use is a warning. New behavior is safer as another implementation behind the same contract.",
  },
  {
    letter: "L",
    title: "A substitute must stand where the original stood",
    body: "If a subtype refuses work that its original type accepts, callers cannot trust the type. What breaks is the promise of the function.",
  },
  {
    letter: "I",
    title: "A small interface",
    body: "A caller that only needs to save should not depend on export, send email, and calculate tax. A wide interface spreads change to people who never use those features.",
  },
  {
    letter: "D",
    title: "Depend on the contract, not the tool",
    body: "The service knows PaymentRecorder. Whatever writes to the database, or to a queue, sits behind that contract. Replacing the tool does not make the service know the driver.",
  },
];

export default function SolidStory() {
  return (
    <>
      <p>
        Use this check when a change starts spreading into places that are
        unrelated. If the spread is narrow, these five names do not need to be
        forced onto every class.
      </p>
      <ol className="principles">
        {principles.map((principle) => (
          <li key={principle.letter}>
            <span aria-hidden="true">{principle.letter}</span>
            <div>
              <h2>{principle.title}</h2>
              <p>{principle.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
