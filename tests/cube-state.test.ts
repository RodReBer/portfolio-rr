// @ts-nocheck -- the project intentionally does not ship @types/node.
// Node 22 runs this focused suite with:
// node --experimental-strip-types --test tests/cube-state.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  applyMoves,
  applyTurn,
  CUBE_NARRATIVE_MOVES,
  createSolvedState,
  getCubeNarrativeFrame,
  invertMoves,
  isSolved,
} from "../src/lib/rubiksCube/cubeState.ts";

test("a solved state includes identity orientation", () => {
  const state = createSolvedState();
  assert.equal(state.length, 27);
  assert.equal(isSolved(state), true);
  assert.deepEqual(state[0].orientation, [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ]);
});

test("four quarter turns restore position and orientation", () => {
  const solved = createSolvedState();
  let state = solved;
  for (let turn = 0; turn < 4; turn++) {
    state = applyTurn(state, "x", 1, 1);
  }
  assert.equal(isSolved(state), true);
  assert.deepEqual(state, solved);
});

test("a turn followed by its inverse restores the cube", () => {
  let state = createSolvedState();
  state = applyTurn(state, "z", -1, 1);
  state = applyTurn(state, "z", -1, -1);
  assert.equal(isSolved(state), true);
});

test("inverse history solves a multi-axis scramble", () => {
  const moves = [
    { axis: "x", layerIndex: 1, quarterTurns: 1 },
    { axis: "y", layerIndex: -1, quarterTurns: -1 },
    { axis: "z", layerIndex: 1, quarterTurns: 2 },
    { axis: "x", layerIndex: -1, quarterTurns: -1 },
  ];
  const scrambled = applyMoves(createSolvedState(), moves);
  assert.equal(isSolved(scrambled), false);
  assert.equal(isSolved(applyMoves(scrambled, invertMoves(moves))), true);
});

test("isSolved rejects a cubie with a non-identity orientation", () => {
  const state = createSolvedState();
  state[0] = {
    ...state[0],
    orientation: [
      [1, 0, 0],
      [0, 0, 1],
      [0, -1, 0],
    ],
  };
  assert.equal(isSolved(state), false);
});

test("the narrative scrambles, separates and returns to an exact solved state", () => {
  const start = getCubeNarrativeFrame(0);
  const separated = getCubeNarrativeFrame(0.44);
  const end = getCubeNarrativeFrame(1);

  assert.equal(isSolved(start.state), true);
  assert.equal(isSolved(separated.state), false);
  assert.equal(separated.explosion, 1);
  assert.equal(isSolved(end.state), true);
  assert.equal(end.activeMove, null);
  assert.equal(end.explosion, 0);
  assert.deepEqual(end.state, createSolvedState());
});

test("the narrative frame is deterministic and reversible at partial turns", () => {
  const progress = 0.275;
  const forwardFrame = getCubeNarrativeFrame(progress);
  getCubeNarrativeFrame(0.8);
  const reverseFrame = getCubeNarrativeFrame(progress);

  assert.deepEqual(reverseFrame, forwardFrame);
  assert.notEqual(forwardFrame.activeMove, null);
  assert.ok(forwardFrame.moveProgress > 0);
  assert.ok(forwardFrame.moveProgress < 1);
});

test("the narrative uses the exact inverse of its fixed scramble", () => {
  const scrambled = applyMoves(createSolvedState(), CUBE_NARRATIVE_MOVES);
  assert.equal(isSolved(scrambled), false);
  assert.equal(isSolved(applyMoves(scrambled, invertMoves(CUBE_NARRATIVE_MOVES))), true);
  assert.throws(() => getCubeNarrativeFrame(Number.NaN), TypeError);
  assert.deepEqual(getCubeNarrativeFrame(-1), getCubeNarrativeFrame(0));
  assert.deepEqual(getCubeNarrativeFrame(2), getCubeNarrativeFrame(1));
});
