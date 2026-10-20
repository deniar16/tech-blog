import type { ReactNode } from "react";

export function Figure({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="figure">
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export function Steps({ items }: { items: string[] }) {
  return (
    <ol className="steps">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  );
}
