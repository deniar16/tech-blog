import type { ComponentType } from "react";

export type StoryMeta = {
  slug: string;
  title: string;
  date: string;
  published: string;
  minutes: string;
  lede: string;
  sample?: boolean;
  wide?: boolean;
};

export type Story = StoryMeta & {
  categoryPath: string;
  categoryLabel: string;
  Component: ComponentType;
};

export type CategoryNode = {
  id: string;
  name: string;
  children: CategoryNode[];
};

const LABELS: Record<string, string> = { ai: "AI" };

function segmentLabel(segment: string) {
  return LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

const modules = import.meta.glob("./**/*.tsx", { eager: true }) as Record<
  string,
  { meta: StoryMeta; default: ComponentType }
>;

export const stories: Story[] = Object.entries(modules)
  .map(([path, module]) => {
    const parts = path.replace(/^\.\//, "").replace(/\.tsx$/, "").split("/");
    parts.pop();
    const categoryPath = parts.join("/");
    return {
      ...module.meta,
      categoryPath,
      categoryLabel: parts.map(segmentLabel).join(" / "),
      Component: module.default,
    };
  })
  .sort((a, b) => b.published.localeCompare(a.published));

export function categoryTree(items: Story[] = stories): CategoryNode[] {
  const roots: CategoryNode[] = [];
  for (const story of items) {
    const parts = story.categoryPath.split("/");
    let level = roots;
    let id = "";
    for (const part of parts) {
      id = id ? `${id}/${part}` : part;
      let node = level.find((item) => item.id === id);
      if (!node) {
        node = { id, name: segmentLabel(part), children: [] };
        level.push(node);
      }
      level = node.children;
    }
  }
  return roots;
}

export function inCategory(story: Story, categoryId: string) {
  return (
    categoryId === "All" ||
    story.categoryPath === categoryId ||
    story.categoryPath.startsWith(`${categoryId}/`)
  );
}

export function categoryCount(categoryId: string) {
  return stories.filter((story) => inCategory(story, categoryId)).length;
}
