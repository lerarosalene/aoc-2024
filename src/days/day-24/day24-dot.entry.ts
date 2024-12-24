import fs from "node:fs";
import arg from "arg";
import assert from "node:assert";
import { parse } from ".";

const fsp = fs.promises;

class TmpNodeNamer {
  private _lastId = 0;
  public getName() {
    return `tmp_${this._lastId++}`;
  }
}

function nodeCmp(a: string, b: string) {
  const numericA = parseInt(a.slice(1), 10);
  const numericB = parseInt(b.slice(1), 10);

  if (numericA !== numericB) {
    return numericA - numericB;
  }

  return a.localeCompare(b);
}

interface Node {
  name: string;
  label: string;
  shape: string;
}

function renderRank(rank: string, nodes: Node[], enforceOrder: boolean) {
  let result: string[] = [];
  result.push(`  {`);
  result.push(`    rank=${rank};`);
  for (const input of nodes) {
    result.push(
      `    ${input.name} [fontname="monospace" shape=${input.shape} label="${input.label}"];`,
    );
  }
  if (enforceOrder) {
    result.push(`    edge[style=invis];`);
    const iEdge = nodes.map((node) => node.name).join(" -> ");
    result.push(`    ${iEdge};`);
    result.push(`    rankdir=TB;`);
  }
  result.push(`  }`);
  return result;
}

function dot(
  inputs: Set<string>,
  outputs: Set<string>,
  intermediary: Map<string, string>,
  edges: [string, string, string][],
) {
  let result: string[] = [];
  result.push(`digraph {`);
  result.push(`  rankdir=LR;`);
  result = result.concat(
    renderRank(
      "min",
      [...inputs]
        .sort(nodeCmp)
        .map((name) => ({ name, label: name, shape: "circle" })),
      true,
    ),
  );
  result.push(``);

  let ands: Node[] = [];
  let xors: Node[] = [];
  let ors: Node[] = [];

  for (const [name, op] of intermediary) {
    switch (op) {
      case "XOR":
        xors.push({ name, label: op, shape: "box" });
        break;
      case "AND":
        ands.push({ name, label: op, shape: "box" });
        break;
      case "OR":
        ors.push({ name, label: op, shape: "box" });
        break;
      default:
        throw new Error("unknown op " + op);
    }
  }

  result = result.concat(renderRank("same", ands, false));
  result.push(``);
  result = result.concat(renderRank("same", xors, false));
  result.push(``);
  result = result.concat(renderRank("same", ors, false));

  result.push(``);
  result = result.concat(
    renderRank(
      "max",
      [...outputs]
        .sort(nodeCmp)
        .map((name) => ({ name, label: name, shape: "circle" })),
      true,
    ),
  );
  result.push(``);
  for (const [from, to, dstPort] of edges) {
    result.push(`  ${from}:e -> ${to}:${dstPort};`);
  }
  result.push(`}`);
  return result.join("\n");
}

async function main() {
  const args = arg({
    "--input": String,
    "--output": String,
    "-i": "--input",
    "-o": "--output",
  });

  const inputFile = args["--input"];
  const outputFile = args["--output"];

  assert(inputFile, "provide input file (--input/-i)");
  assert(outputFile, "provide output file (--output/-o)");

  const { formulas } = parse(await fsp.readFile(inputFile, "utf-8"));

  const namer = new TmpNodeNamer();
  const inputNodes = new Set<string>();
  const outputNodes = new Set<string>();
  const intermediaryNodes = new Map<string, string>(); // id -> label
  const edges: [string, string, string][] = [];
  const inputMap = new Map<string, string>();

  for (const formula of formulas) {
    if (/^z\d\d$/.test(formula.result)) {
      const imName = namer.getName();
      inputMap.set(formula.result, imName);
      outputNodes.add(formula.result);
      intermediaryNodes.set(imName, formula.operator);
      edges.push([imName, formula.result, "w"]);
    } else {
      intermediaryNodes.set(formula.result, formula.operator);
    }
    if (/^(?:x|y)\d\d$/.test(formula.left)) {
      inputNodes.add(formula.left);
    }
    if (/^(?:x|y)\d\d$/.test(formula.right)) {
      inputNodes.add(formula.right);
    }
  }

  for (const formula of formulas) {
    edges.push([
      formula.left,
      inputMap.get(formula.result) ?? formula.result,
      "n",
    ]);
    edges.push([
      formula.right,
      inputMap.get(formula.result) ?? formula.result,
      "s",
    ]);
  }

  await fsp.writeFile(
    outputFile,
    dot(inputNodes, outputNodes, intermediaryNodes, edges),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
