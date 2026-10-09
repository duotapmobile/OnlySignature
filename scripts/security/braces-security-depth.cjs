"use strict";

// Parser-generated trees have parent/prev backreferences. Nodes edges and
// array-valued text recurse; repeated DAG nodes are valid but visits are bounded.
const MAX_DEPTH = 128;
const MAX_VISITS = 32768;

function assertValueArrays(value, depth, remainingVisits) {
  const active = new Set();
  const stack = [{ value, depth, exit: false }];
  let visits = 0;
  while (stack.length) {
    const frame = stack.pop();
    if (!Array.isArray(frame.value)) continue;
    if (frame.exit) {
      active.delete(frame.value);
      continue;
    }
    if (frame.depth > MAX_DEPTH || active.has(frame.value)) {
      throw new RangeError(
        "Braces value array nesting or cycle exceeds safety limit",
      );
    }
    visits += frame.value.length;
    if (visits > remainingVisits) {
      throw new RangeError("Braces AST visits exceed safety limit");
    }
    active.add(frame.value);
    stack.push({ ...frame, exit: true });
    for (let i = frame.value.length - 1; i >= 0; i--) {
      stack.push({
        value: frame.value[i],
        depth: frame.depth + 1,
        exit: false,
      });
    }
  }
  return visits;
}

function assertAst(ast) {
  const active = new Set();
  const checkedQueues = new Set();
  const stack = [{ node: ast, depth: 0, exit: false }];
  let visits = 1;
  while (stack.length) {
    const frame = stack.pop();
    const node = frame.node;
    if (frame.exit) {
      active.delete(node);
      continue;
    }
    if (!node || typeof node !== "object") {
      throw new TypeError("Expected a braces AST node");
    }
    if (frame.depth > MAX_DEPTH || active.has(node)) {
      throw new RangeError("Braces AST nesting or cycle exceeds safety limit");
    }
    // expand also climbs parent links until a brace/root boundary.
    const parents = new Set();
    let parent = node;
    while (parent) {
      // Direct ASTs may point at an external brace/root queue, which append
      // recursively consumes even though that object is not a nodes child.
      if (!checkedQueues.has(parent.queue)) {
        checkedQueues.add(parent.queue);
        visits += assertValueArrays(parent.queue, 0, MAX_VISITS - visits);
      }
      if (parent.type === "brace" || parent.type === "root") break;
      if (parents.has(parent) || parents.size > MAX_DEPTH) {
        throw new RangeError(
          "Braces AST parent cycle or nesting exceeds safety limit",
        );
      }
      parents.add(parent);
      parent = parent.parent;
    }
    visits += assertValueArrays(
      node.value,
      frame.depth + 1,
      MAX_VISITS - visits,
    );
    if (!node.nodes) continue;
    if (!Array.isArray(node.nodes)) {
      throw new TypeError("Expected a braces AST nodes array");
    }
    visits += node.nodes.length;
    if (visits > MAX_VISITS) {
      throw new RangeError("Braces AST visits exceed safety limit");
    }
    active.add(node);
    stack.push({ node, depth: frame.depth, exit: true });
    for (let i = node.nodes.length - 1; i >= 0; i--) {
      stack.push({ node: node.nodes[i], depth: frame.depth + 1, exit: false });
    }
  }
}

module.exports = { MAX_DEPTH, assertAst };
