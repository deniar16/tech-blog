import type { StoryMeta } from "../../index";

export const meta: StoryMeta = {
  slug: "four-layers",
  title: "Four layers, not one prompt",
  date: "Oct 18, 2026",
  published: "2026-10-18",
  minutes: "4 min",
  lede: "The prompt stays. What changes is what sits around it: chosen context, a harness that holds the answer back, and a loop that knows when to stop.",
  wide: true,
};

export default function FourLayers() {
  return (
    <p>
      The four layers below are not a rank. The prompt stays in use. What
      changes is what sits around it: chosen context, a harness that holds the
      answer back, and a loop that knows when to stop.
    </p>
  );
}
