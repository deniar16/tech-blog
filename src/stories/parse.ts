import type { Pillar } from "../pillars";

export type StoryFields = {
  slug: string;
  title: string;
  date: string;
  published: string;
  minutes: string;
  lede: string;
  sample: boolean;
  wide: boolean;
  body: string;
};

export type StoryBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "figure"; caption: string; items: string[] }
  | { type: "split"; parts: { title: string; text: string }[] }
  | { type: "facts"; parts: { term: string; text: string }[] }
  | { type: "principles"; parts: { letter: string; title: string; text: string }[] }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "diagram"; id: string; pillars: Pillar[] | null };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function displayDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return iso;
  return `${month} ${Number(match[3])}, ${match[1]}`;
}

export function parseStory(source: string): StoryFields {
  const match = source.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const front = match ? match[1] : "";
  const body = (match ? match[2] : source).replace(/^\n/, "").replace(/\s+$/, "");
  const fields: Record<string, string> = {};
  for (const line of front.split("\n")) {
    const index = line.indexOf(":");
    if (index === -1) continue;
    fields[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return {
    slug: fields.slug ?? "",
    title: fields.title ?? "",
    date: fields.date ?? "",
    published: fields.published ?? "",
    minutes: fields.minutes ?? "",
    lede: fields.lede ?? "",
    sample: fields.sample === "true",
    wide: fields.wide === "true",
    body,
  };
}

export function serializeStory(fields: StoryFields) {
  const lines = [
    "---",
    `slug: ${oneLine(fields.slug)}`,
    `title: ${oneLine(fields.title)}`,
    `date: ${displayDate(fields.published) || oneLine(fields.date)}`,
    `published: ${oneLine(fields.published)}`,
    `minutes: ${oneLine(fields.minutes)}`,
    `lede: ${oneLine(fields.lede)}`,
  ];
  if (fields.sample) lines.push("sample: true");
  if (fields.wide) lines.push("wide: true");
  lines.push("---", "", fields.body.replace(/\s+$/, ""), "");
  return lines.join("\n");
}

function oneLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function hasDiagram(body: string) {
  return readArticleDiagram(body) !== null;
}

export function readArticleDiagram(body: string) {
  const match = body.match(/:::diagram (\S+)\n([\s\S]*?)\n?:::/);
  if (!match || match.index === undefined) return null;
  return {
    id: match[1],
    raw: match[2].trim(),
    pillars: parsePillarList(match[2]),
    before: body.slice(0, match.index).replace(/\s+$/, ""),
    after: body.slice(match.index + match[0].length).replace(/^\n+/, ""),
  };
}

export function placeDiagram(before: string, id: string, raw: string, after: string) {
  const parts: string[] = [];
  if (before.trim()) parts.push(before.replace(/\s+$/, ""));
  parts.push(`:::diagram ${id}\n${raw.trim()}\n:::`);
  if (after.trim()) parts.push(after.replace(/^\s+/, ""));
  return `${parts.join("\n\n")}\n`;
}

export function parsePillarList(raw: string): Pillar[] | null {
  if (!raw.trim()) return null;
  try {
    const value = JSON.parse(raw) as Pillar[];
    if (!Array.isArray(value) || value.some((item) => !item || typeof item.id !== "string" || !Array.isArray(item.steps))) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function parseBlocks(body: string): StoryBlock[] {
  const blocks: StoryBlock[] = [];
  const paragraph: string[] = [];
  let fence: { kind: string; arg?: string; lines: string[] } | null = null;

  function flush() {
    const text = paragraph.join(" ").trim();
    paragraph.length = 0;
    if (text) blocks.push({ type: "p", text });
  }

  for (const line of body.replace(/\r\n/g, "\n").split("\n")) {
    if (fence) {
      if (line.trim() === ":::") {
        blocks.push(finishFence(fence.kind, fence.arg, fence.lines));
        fence = null;
      } else {
        fence.lines.push(line);
      }
      continue;
    }
    const opened = /^:::(\w+)(?:\s+(\S+))?\s*$/.exec(line.trim());
    if (opened) {
      flush();
      fence = { kind: opened[1], arg: opened[2], lines: [] };
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }
    const bullet = /^- (.*)$/.exec(line);
    const numbered = /^\d+\. (.*)$/.exec(line);
    if (bullet || numbered) {
      flush();
      const ordered = Boolean(numbered);
      const item = (numbered ?? bullet)![1];
      const last = blocks[blocks.length - 1];
      if (last && last.type === (ordered ? "ol" : "ul")) last.items.push(item);
      else blocks.push({ type: ordered ? "ol" : "ul", items: [item] });
      continue;
    }
    if (line.trim() === "") flush();
    else paragraph.push(line.trim());
  }
  flush();
  return blocks;
}

function finishFence(kind: string, arg: string | undefined, lines: string[]): StoryBlock {
  const filled = lines.map((line) => line.trim()).filter(Boolean);
  if (kind === "diagram") {
    const raw = lines.join("\n");
    return { type: "diagram", id: arg || "four-layers", pillars: parsePillarList(raw) };
  }
  if (kind === "steps") return { type: "steps", items: listItems(filled) };
  if (kind === "figure") {
    const caption = labeled(filled, "caption") ?? "";
    const stepsLine = filled.find((line) => line.startsWith("steps:"));
    const items = stepsLine ? splitBar(stepsLine.slice("steps:".length)) : [];
    return { type: "figure", caption, items };
  }
  if (kind === "split") {
    return {
      type: "split",
      parts: filled.map((line) => {
        const [title, text] = splitOnce(line);
        return { title, text };
      }),
    };
  }
  if (kind === "facts") {
    return {
      type: "facts",
      parts: filled.map((line) => {
        const [term, text] = splitOnce(line);
        return { term, text };
      }),
    };
  }
  if (kind === "principles") {
    return {
      type: "principles",
      parts: filled.map((line) => {
        const [letter, title, text] = splitTwice(line);
        return { letter, title, text };
      }),
    };
  }
  return { type: "p", text: filled.join(" ") };
}

function labeled(lines: string[], name: string) {
  const prefix = `${name}:`;
  const line = lines.find((item) => item.startsWith(prefix));
  return line ? line.slice(prefix.length).trim() : undefined;
}

function listItems(lines: string[]) {
  if (lines.length === 1 && lines[0].includes("|")) return splitBar(lines[0]);
  return lines;
}

function splitBar(value: string) {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitOnce(value: string) {
  const index = value.indexOf("|");
  if (index === -1) return [value.trim(), ""];
  return [value.slice(0, index).trim(), value.slice(index + 1).trim()];
}

function splitTwice(value: string) {
  const first = value.indexOf("|");
  if (first === -1) return [value.trim(), "", ""];
  const second = value.indexOf("|", first + 1);
  if (second === -1) return [value.slice(0, first).trim(), value.slice(first + 1).trim(), ""];
  return [
    value.slice(0, first).trim(),
    value.slice(first + 1, second).trim(),
    value.slice(second + 1).trim(),
  ];
}
