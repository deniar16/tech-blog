import { parsePillarList } from "./parse";
import type { Pillar } from "../pillars";

export type DocPiece =
  | { kind: "prose"; text: string }
  | { kind: "diagram"; id: string; raw: string; pillars: Pillar[] | null }
  | { kind: "raw"; text: string };

const FENCE = /:::(\w+)(?:[ \t]+(\S+))?[ \t]*\n([\s\S]*?)\n?:::/g;

export function readDocument(body: string): DocPiece[] {
  const source = body.replace(/\r\n/g, "\n");
  const pieces: DocPiece[] = [];
  let cursor = 0;
  for (const match of source.matchAll(FENCE)) {
    const index = match.index ?? 0;
    pushProse(pieces, source.slice(cursor, index));
    if (match[1] === "diagram") {
      const raw = match[3].trim();
      pieces.push({ kind: "diagram", id: match[2] || "four-layers", raw, pillars: parsePillarList(raw) });
    } else {
      pieces.push({ kind: "raw", text: match[0].trim() });
    }
    cursor = index + match[0].length;
  }
  pushProse(pieces, source.slice(cursor));
  return withWritingSlots(pieces);
}

export function writeDocument(pieces: DocPiece[]): string {
  const parts: string[] = [];
  for (const piece of pieces) {
    if (piece.kind === "prose") {
      const text = piece.text.replace(/^\n+/, "").replace(/\s+$/g, "");
      if (text) parts.push(text);
    } else if (piece.kind === "diagram") {
      parts.push(`:::diagram ${piece.id}\n${piece.raw.trim()}\n:::`);
    } else if (piece.text.trim()) {
      parts.push(piece.text.trim());
    }
  }
  return parts.length ? `${parts.join("\n\n")}\n` : "";
}

function pushProse(pieces: DocPiece[], text: string) {
  const trimmed = text.replace(/^\n+/, "").replace(/\s+$/g, "");
  if (trimmed) pieces.push({ kind: "prose", text: trimmed });
}

function withWritingSlots(pieces: DocPiece[]): DocPiece[] {
  const out: DocPiece[] = [];
  if (pieces[0]?.kind !== "prose") out.push({ kind: "prose", text: "" });
  pieces.forEach((piece, index) => {
    out.push(piece);
    const next = pieces[index + 1];
    if (piece.kind !== "prose" && next?.kind !== "prose") out.push({ kind: "prose", text: "" });
  });
  if (out.length === 0) out.push({ kind: "prose", text: "" });
  return out;
}

export function markdownToHtml(markdown: string): string {
  const blocks = markdown.replace(/\r\n/g, "\n").split(/\n{2,}/).filter((block) => block.trim());
  if (blocks.length === 0) return "";
  return blocks.map(blockToHtml).join("");
}

function blockToHtml(block: string): string {
  const lines = block.split("\n");
  if (lines.every((line) => line.startsWith("## "))) {
    return lines.map((line) => `<h2>${inlineToHtml(line.slice(3))}</h2>`).join("");
  }
  if (lines.every((line) => line.startsWith("### "))) {
    return lines.map((line) => `<h3>${inlineToHtml(line.slice(4))}</h3>`).join("");
  }
  if (lines.every((line) => line.startsWith("- "))) {
    return `<ul>${lines.map((line) => `<li>${inlineToHtml(line.slice(2))}</li>`).join("")}</ul>`;
  }
  if (lines.every((line) => /^\d+\. /.test(line))) {
    return `<ol>${lines.map((line) => `<li>${inlineToHtml(line.replace(/^\d+\. /, ""))}</li>`).join("")}</ol>`;
  }
  if (lines.some((line) => /^(?:## |### |- |\d+\. )/.test(line))) {
    return lines.map((line) => blockToHtml(line)).join("");
  }
  const html = inlineToHtml(lines.join(" "));
  return `<div>${html || "<br>"}</div>`;
}

function inlineToHtml(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*\*([^*]+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*([^*]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+?)\*/g, "<em>$1</em>");
}

function escapeHtml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function htmlToMarkdown(html: string): string {
  const root = document.createElement("div");
  root.innerHTML = html;
  return collectBlocks(root).join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function collectBlocks(root: ParentNode): string[] {
  const blocks: string[] = [];
  for (const node of root.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? "").replace(/\u00a0/g, " ").trim();
      if (text) blocks.push(text);
      continue;
    }
    if (!(node instanceof HTMLElement)) continue;
    const tag = node.tagName;
    if (tag === "UL") {
      blocks.push([...node.children].map((item) => `- ${inlineText(item).trim()}`).join("\n"));
    } else if (tag === "OL") {
      blocks.push([...node.children].map((item, index) => `${index + 1}. ${inlineText(item).trim()}`).join("\n"));
    } else if (tag === "H2") {
      blocks.push(`## ${inlineText(node).trim()}`);
    } else if (tag === "H3") {
      blocks.push(`### ${inlineText(node).trim()}`);
    } else if (tag === "BR") {
      continue;
    } else {
      const text = inlineText(node).trim();
      if (text) blocks.push(text);
    }
  }
  return blocks.filter(Boolean);
}

function inlineText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? "").replace(/\u00a0/g, " ");
  if (!(node instanceof HTMLElement)) return "";
  const tag = node.tagName;
  if (tag === "BR") return "\n";
  const inner = [...node.childNodes].map((child) => inlineText(child)).join("");
  const weight = node.style.fontWeight;
  const bold = tag === "STRONG" || tag === "B" || weight === "bold" || Number(weight) >= 600;
  const italic = tag === "EM" || tag === "I" || node.style.fontStyle === "italic";
  if (bold && italic) return `***${inner}***`;
  if (bold) return `**${inner}**`;
  if (italic) return `*${inner}*`;
  return inner;
}

export function splitEditor(root: HTMLElement): [string, string] {
  const selection = document.getSelection();
  if (!selection || selection.rangeCount === 0 || !root.contains(selection.anchorNode)) {
    return [htmlToMarkdown(root.innerHTML), ""];
  }
  const range = selection.getRangeAt(0);
  const before = range.cloneRange();
  before.selectNodeContents(root);
  before.setEnd(range.endContainer, range.endOffset);
  const after = range.cloneRange();
  after.selectNodeContents(root);
  after.setStart(range.endContainer, range.endOffset);
  return [htmlToMarkdown(fragmentHtml(before)), htmlToMarkdown(fragmentHtml(after))];
}

function fragmentHtml(range: Range) {
  const holder = document.createElement("div");
  holder.appendChild(range.cloneContents());
  return holder.innerHTML;
}
