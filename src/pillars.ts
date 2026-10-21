import catalog from "./diagrams/four-layers.json";

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

export const pillars = catalog as Pillar[];

export function alignPillar(pillar: Pillar): Pillar {
  const [first, second, third, fourth, fifth, sixth] = pillar.steps;
  if (pillar.layout === "loop") {
    return {
      ...pillar,
      topLeft: first ?? "",
      topRight: second ?? "",
      lowerRight: third ?? "",
      lowerLeft: fourth ?? "",
      foot: sixth ?? fifth ?? "",
    };
  }
  return {
    ...pillar,
    topLeft: first ?? "",
    topRight: second ?? "",
    lowerRight: third ?? "",
    lowerLeft: fourth ?? "",
    foot: fifth ?? "",
  };
}
