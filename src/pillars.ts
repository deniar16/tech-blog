export type Pillar = {
  id: string;
  name: string;
  accent: string;
  deep: string;
  wash: string;
  definition: string;
  note: string;
  uses: { title: string; example: string }[];
  steps: string[];
  layout: "stack" | "loop";
  loopBack?: boolean;
  topLeft: string;
  topRight: string;
  lowerLeft: string;
  lowerRight: string;
  foot: string;
};

export const pillars: Pillar[] = [
  {
    id: "prompt",
    name: "Prompt Engineering",
    accent: "#2f6fed",
    deep: "#1d4ed8",
    wash: "#eaf1ff",
    definition:
      "Writing clear instructions so the model moves toward the result you want in a single turn.",
    note: "Clear instructions, one pass. It fits when you can judge the result immediately: a summary, an extraction, a rewrite. If the task needs files, tools, or a second turn, a prompt alone is not enough.",
    uses: [
      {
        title: "Writing, summarizing, and rewriting",
        example:
          "Make this email shorter, keep it polite, and do not add a new promise.",
      },
      {
        title: "Structured questions and extraction",
        example:
          "From this invoice, take the number, the date, and the total. Answer as JSON, with no opening sentence.",
      },
      {
        title: "One-step tasks",
        example: "Give three alternate titles for this note. One line each.",
      },
    ],
    steps: ["Task", "Prompt", "LLM", "Output", "Refine Prompt"],
    layout: "stack",
    loopBack: true,
    topLeft: "Task",
    topRight: "Prompt",
    lowerLeft: "Output",
    lowerRight: "LLM",
    foot: "Refine Prompt",
  },
  {
    id: "context",
    name: "Context Engineering",
    accent: "#f97316",
    deep: "#c2410c",
    wash: "#fff1e6",
    definition:
      "Arranging the right information around the model: documents, memory, examples, and retrieved knowledge.",
    note: "The model does not store your documents. You choose the pieces that matter for this turn. Too much context is as bad as too little: what is irrelevant still shapes the answer.",
    uses: [
      {
        title: "RAG-based assistants",
        example:
          "Answer only from the leave policy, and name the section you used. If it is not in the document, say it is not there.",
      },
      {
        title: "A copilot for one domain",
        example:
          "Follow this company's chart of accounts. Do not invent an account code that is not on the list.",
      },
      {
        title: "Apps that need memory or a reference",
        example:
          "Remember last quarter's decision: training cost under the threshold is not capitalized.",
      },
    ],
    steps: ["Task", "Retrieve Context", "Rank / Format Context", "LLM", "Output"],
    layout: "stack",
    topLeft: "Task",
    topRight: "Retrieve Context",
    lowerLeft: "LLM",
    lowerRight: "Rank / Format Context",
    foot: "Output",
  },
  {
    id: "harness",
    name: "Harness Engineering",
    accent: "#1f9d4d",
    deep: "#147a38",
    wash: "#e9f8ee",
    definition:
      "Building the execution layer around the model: tools, guardrails, evaluation, retries, and a trace.",
    note: "The prompt and the context answer what was asked. The harness answers what may happen next: which tool may be called, what is refused, when to retry, and what is recorded.",
    uses: [
      {
        title: "Production AI applications",
        example:
          "Every number must pass a schema check before it reaches a person. If it fails, do not send it.",
      },
      {
        title: "Agents that use tools",
        example: "The model may read a balance. The model may not write a transaction.",
      },
      {
        title: "Workflows that need to be reliable",
        example:
          "If a tool fails, try twice more. After that, stop and record the trace.",
      },
    ],
    steps: [
      "Task",
      "Prompt + Context",
      "Tools / Rules / Evals",
      "LLM Actions",
      "Checked Output",
    ],
    layout: "stack",
    topLeft: "Task",
    topRight: "Prompt + Context",
    lowerLeft: "LLM Actions",
    lowerRight: "Tools / Rules / Evals",
    foot: "Checked Output",
  },
  {
    id: "loop",
    name: "Loop Engineering",
    accent: "#e09712",
    deep: "#9a6708",
    wash: "#fff6e4",
    definition:
      "Designing a repeating system: the model plans, acts, reviews, and tries again until a stopping condition is met.",
    note: "A loop with no stopping condition only spins. What you design here is when it continues, when it tries again, and when the result may leave.",
    uses: [
      {
        title: "Coding agents",
        example:
          "Change this test until it passes. Stop when it passes, or after eight turns, whichever comes first.",
      },
      {
        title: "Research workflows",
        example:
          "Collect sources, write a draft, critique the draft. Repeat until every claim has a citation, at most five rounds.",
      },
      {
        title: "Multi-step automation",
        example: "Plan, do one step, review the result, then continue or stop.",
      },
    ],
    steps: ["Goal", "Plan", "Act", "Review", "Retry or Stop", "Final Output"],
    layout: "loop",
    topLeft: "Goal",
    topRight: "Plan",
    lowerLeft: "Review",
    lowerRight: "Act",
    foot: "Final Output",
  },
];
