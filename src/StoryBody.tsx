import EngStack from "./EngStack";
import OutboxFlow from "./OutboxMock";
import { sanitizeHtml } from "./stories/sanitize";
import { pillars as catalog } from "./pillars";
import { Figure, Steps } from "./story-ui";
import { readDocument } from "./stories/document";
import { parseBlocks, type StoryBlock } from "./stories/parse";

export function StoryBody({ body }: { body: string }) {
  return (
    <>
      {readDocument(body).map((piece, index) => {
        if (piece.kind === "diagram") {
          return (
            <div className="diagram-slot" key={index}>
              {piece.id === "outbox" ? <OutboxFlow /> : <EngStack pillars={piece.pillars ?? catalog} />}
            </div>
          );
        }
        if (piece.kind === "raw") {
          return (
            <div className="story-copy prose" key={index}>
              {parseBlocks(piece.text).map((block, blockIndex) => (
                <BlockView key={blockIndex} block={block} />
              ))}
            </div>
          );
        }
        if (!piece.text.trim()) return null;
        return (
          <div className="story-copy prose" key={index}>
            <Prose text={piece.text} />
          </div>
        );
      })}
    </>
  );
}

function Prose({ text }: { text: string }) {
  return text.split(/\n{2,}/).map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("<")) {
      return <div key={index} className="rich-html" dangerouslySetInnerHTML={{ __html: sanitizeHtml(trimmed) }} />;
    }
    return parseBlocks(trimmed).map((item, itemIndex) => <BlockView key={`${index}-${itemIndex}`} block={item} />);
  });
}

function BlockView({ block }: { block: StoryBlock }) {
  if (block.type === "p") return <p><RichText text={block.text} /></p>;
  if (block.type === "h2") return <h2><RichText text={block.text} /></h2>;
  if (block.type === "h3") return <h3><RichText text={block.text} /></h3>;
  if (block.type === "ul" || block.type === "ol") {
    const Tag = block.type;
    return (
      <Tag className="rich-list">
        {block.items.map((item, index) => (
          <li key={index}>
            <RichText text={item} />
          </li>
        ))}
      </Tag>
    );
  }
  if (block.type === "steps") return <Steps items={block.items} />;
  if (block.type === "figure") {
    return (
      <Figure caption={block.caption}>
        <Steps items={block.items} />
      </Figure>
    );
  }
  if (block.type === "split") {
    return (
      <div className="split">
        {block.parts.map((part) => (
          <section key={part.title}>
            <h3>{part.title}</h3>
            <p>{part.text}</p>
          </section>
        ))}
      </div>
    );
  }
  if (block.type === "facts") {
    return (
      <dl className="facts">
        {block.parts.map((part) => (
          <div key={part.term}>
            <dt>{part.term}</dt>
            <dd>{part.text}</dd>
          </div>
        ))}
      </dl>
    );
  }
  if (block.type === "principles") {
    return (
      <ol className="principles">
        {block.parts.map((part) => (
          <li key={part.letter}>
            <span aria-hidden="true">{part.letter}</span>
            <div>
              <h2>{part.title}</h2>
              <p>{part.text}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }
  return null;
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*\*[^*]+?\*\*\*|\*\*[^*]+?\*\*|\*[^*]+?\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("***") && part.endsWith("***")) {
          return (
            <strong key={index}>
              <em>{part.slice(3, -3)}</em>
            </strong>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={index}>{part.slice(1, -1)}</em>;
        return part;
      })}
    </>
  );
}
