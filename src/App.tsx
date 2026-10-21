import { useEffect, useState } from "react";
import { Desk } from "@desk";
import { StoryBody } from "./StoryBody";
import {
  categoryCount,
  categoryTree,
  inCategory,
  stories,
  type CategoryNode,
  type Story,
} from "./stories";

function usePath() {
  const read = () => window.location.hash.replace(/^#/, "") || "/";
  const [path, setPath] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setPath(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}

function Byline({ post }: { post: Story }) {
  return (
    <div className="byline">
      <span className="avatar" aria-hidden="true">
        D
      </span>
      <div>
        <span className="author">Deniar</span>
        <span className="byline-meta">
          {post.date} · {post.minutes} read · {post.categoryLabel}
          {post.sample ? " · sample" : ""}
        </span>
      </div>
    </div>
  );
}

function Home({ visible }: { visible: Story[] }) {
  return (
    <main>
      {visible.length === 0 ? (
        <p className="empty">No stories match that search.</p>
      ) : (
        <ol className="index">
          {visible.map((post) => (
            <li key={post.slug}>
              <a className="card" href={`#/${post.slug}`}>
                <h2>{post.title}</h2>
                <p>{post.lede}</p>
                <Byline post={post} />
              </a>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

function CategoryList({
  nodes,
  category,
  onCategory,
}: {
  nodes: CategoryNode[];
  category: string;
  onCategory: (value: string) => void;
}) {
  return (
    <ul className="cats">
      {nodes.map((node) => (
        <li key={node.id}>
          <button
            type="button"
            className="cat"
            aria-pressed={category === node.id}
            onClick={() => onCategory(node.id)}
          >
            {node.name}
            <span>{categoryCount(node.id)}</span>
          </button>
          {node.children.length > 0 && (
            <CategoryList nodes={node.children} category={category} onCategory={onCategory} />
          )}
        </li>
      ))}
    </ul>
  );
}

function Rail({
  query,
  category,
  onQuery,
  onCategory,
}: {
  query: string;
  category: string;
  onQuery: (value: string) => void;
  onCategory: (value: string) => void;
}) {
  const tree = categoryTree();

  return (
    <aside className="rail">
      <label className="search-label" htmlFor="story-search">
        Search
      </label>
      <input
        id="story-search"
        className="search"
        type="search"
        value={query}
        placeholder="Title or topic"
        onChange={(event) => onQuery(event.target.value)}
      />
      <h2>Categories</h2>
      <ul className="cats">
        <li>
          <button
            type="button"
            className="cat"
            aria-pressed={category === "All"}
            onClick={() => onCategory("All")}
          >
            All
            <span>{stories.length}</span>
          </button>
        </li>
      </ul>
      <CategoryList nodes={tree} category={category} onCategory={onCategory} />
    </aside>
  );
}

function Article({ slug }: { slug: string }) {
  const post = stories.find((item) => item.slug === slug);
  if (!post) {
    return (
      <main>
        <a className="back" href="#/">
          ← All stories
        </a>
        <h1>This story does not exist</h1>
        <p>It is not in the list.</p>
      </main>
    );
  }

  return (
    <main>
      <article className="story">
        <div className="post prose">
          <a className="back" href="#/">
            ← All stories
          </a>
          <h1>{post.title}</h1>
          <p className="lede">{post.lede}</p>
          <Byline post={post} />
        </div>
        <StoryBody body={post.body} />
      </article>
    </main>
  );
}

export default function App() {
  const path = usePath();
  const slug = path === "/" ? "" : path.replace(/^\//, "");
  const writing = slug === "write";
  const current = stories.find((story) => story.slug === slug);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const visible = stories.filter((story) => {
    const matchesCategory = inCategory(story, category);
    const needle = query.trim().toLowerCase();
    const haystack = `${story.title} ${story.lede} ${story.categoryLabel}`.toLowerCase();
    return matchesCategory && (needle === "" || haystack.includes(needle));
  });

  useEffect(() => {
    document.title = writing ? "Write — Notes" : current ? `${current.title} — Notes` : "Stories — Notes";
  }, [writing, current]);

  return (
    <div className="shell">
      <header className="mast">
        <div className="mast-inner">
          <a className="mark" href="#/">
            Notes
          </a>
          {import.meta.env.DEV && (
            <a className="desk-link" href="#/write">
              Write
            </a>
          )}
        </div>
      </header>
      {writing ? (
        <Desk />
      ) : slug === "" ? (
        <div className="home-layout">
          <Home visible={visible} />
          <Rail
            query={query}
            category={category}
            onQuery={setQuery}
            onCategory={setCategory}
          />
        </div>
      ) : (
        <div className="home-layout">
          <Article slug={slug} />
          <Rail
            query={query}
            category={category}
            onQuery={(value) => {
              setQuery(value);
              if (slug !== "") window.location.hash = "#/";
            }}
            onCategory={(value) => {
              setCategory(value);
              if (slug !== "") window.location.hash = "#/";
            }}
          />
        </div>
      )}
    </div>
  );
}
