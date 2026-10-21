const ALLOWED = new Set([
  "P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "BLOCKQUOTE", "PRE", "CODE",
  "STRONG", "EM", "U", "S", "SUB", "SUP", "A", "SPAN", "IMG", "IFRAME", "BR",
]);

export function sanitizeHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const holder = document.createElement("div");
  for (const node of doc.body.childNodes) {
    const clean = cleanNode(node);
    if (clean) holder.append(clean);
  }
  return holder.innerHTML;
}

function cleanNode(node: Node): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent ?? "");
  if (!(node instanceof HTMLElement) || !ALLOWED.has(node.tagName)) {
    const fragment = document.createDocumentFragment();
    for (const child of node.childNodes) {
      const clean = cleanNode(child);
      if (clean) fragment.append(clean);
    }
    return fragment;
  }
  const copy = document.createElement(node.tagName.toLowerCase());
  const style = filterStyle(node.getAttribute("style"));
  if (style) copy.setAttribute("style", style);
  if (node.getAttribute("dir") === "rtl") copy.setAttribute("dir", "rtl");
  const indent = Number(node.getAttribute("data-indent") || 0);
  if (indent > 0 && indent < 9) copy.setAttribute("data-indent", String(indent));
  if (node.tagName === "A") {
    const href = node.getAttribute("href") ?? "";
    if (/^(https?:|mailto:|\/|#)/i.test(href)) {
      copy.setAttribute("href", href);
      copy.setAttribute("rel", "noopener noreferrer");
    }
  }
  if (node.tagName === "IMG") {
    const src = node.getAttribute("src") ?? "";
    if (/^(https?:|data:image\/)/i.test(src)) copy.setAttribute("src", src);
    copy.setAttribute("alt", node.getAttribute("alt") ?? "");
  }
  if (node.tagName === "IFRAME") {
    const src = node.getAttribute("src") ?? "";
    if (/^https?:/i.test(src)) {
      copy.setAttribute("src", src);
      copy.setAttribute("allowfullscreen", "true");
    }
  }
  for (const child of node.childNodes) {
    const clean = cleanNode(child);
    if (clean) copy.append(clean);
  }
  return copy;
}

function filterStyle(raw: string | null) {
  if (!raw) return "";
  const allowed = new Set(["color", "background-color", "font-size", "font-family", "text-align", "padding-left"]);
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter((part) => {
      const name = part.split(":")[0]?.trim().toLowerCase();
      const value = part.slice(part.indexOf(":") + 1);
      return Boolean(name && allowed.has(name) && value && !/url\(|expression|javascript/i.test(value));
    })
    .join(";");
}
