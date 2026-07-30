// @ts-nocheck -- the project intentionally does not ship @types/node.
import assert from "node:assert/strict";
import test from "node:test";
import { Quaternion, Vector3 } from "three";
import {
  CUBE_CAMERA_VIEW_DIRECTION,
  CUBE_SECTION_FACE_NORMALS,
  writeCubeSectionFocusQuaternion,
} from "../src/lib/rubiksCube/presentation.ts";

const FEATURED_SECTIONS = [
  "projects",
  "experience",
  "about",
  "contact",
];

function sameRotation(left, right, tolerance = 1e-10) {
  // q and -q represent the same 3D rotation.
  return Math.abs(left.dot(right)) >= 1 - tolerance;
}

test("each semantic section presents its intended Rubik face to the camera", () => {
  const viewDirection = new Vector3(...CUBE_CAMERA_VIEW_DIRECTION);

  for (const focus of FEATURED_SECTIONS) {
    const normalTuple = CUBE_SECTION_FACE_NORMALS[focus];
    assert.notEqual(normalTuple, null);
    const orientation = writeCubeSectionFocusQuaternion(
      new Quaternion(),
      focus,
      focus,
      0,
    );
    const presentedNormal = new Vector3(...normalTuple)
      .applyQuaternion(orientation)
      .normalize();

    // The face remains slightly oblique so the cube still reads as 3D.
    assert.ok(
      presentedNormal.dot(viewDirection) > 0.94,
      `${focus} should remain the dominant visible face`,
    );
  }
});

test("section focus interpolation is deterministic in both scroll directions", () => {
  const progress = 0.37;
  const forward = writeCubeSectionFocusQuaternion(
    new Quaternion(),
    "projects",
    "experience",
    progress,
  );
  const repeated = writeCubeSectionFocusQuaternion(
    new Quaternion(),
    "projects",
    "experience",
    progress,
  );
  const reverse = writeCubeSectionFocusQuaternion(
    new Quaternion(),
    "experience",
    "projects",
    1 - progress,
  );

  assert.ok(sameRotation(forward, repeated));
  assert.ok(sameRotation(forward, reverse));
  assert.ok(Math.abs(forward.length() - 1) < 1e-12);
});

test("the footer returns the solved cube to its neutral presentation", () => {
  const footer = writeCubeSectionFocusQuaternion(
    new Quaternion(),
    "footer",
    "footer",
    0,
  );

  assert.ok(sameRotation(footer, new Quaternion()));
  assert.equal(CUBE_SECTION_FACE_NORMALS.footer, null);
});

test("section focus clamps endpoints and rejects unsafe runtime input", () => {
  const projects = writeCubeSectionFocusQuaternion(
    new Quaternion(),
    "projects",
    "contact",
    -2,
  );
  const expectedProjects = writeCubeSectionFocusQuaternion(
    new Quaternion(),
    "projects",
    "projects",
    0,
  );
  const contact = writeCubeSectionFocusQuaternion(
    new Quaternion(),
    "projects",
    "contact",
    3,
  );
  const expectedContact = writeCubeSectionFocusQuaternion(
    new Quaternion(),
    "contact",
    "contact",
    0,
  );

  assert.ok(sameRotation(projects, expectedProjects));
  assert.ok(sameRotation(contact, expectedContact));
  assert.throws(
    () =>
      writeCubeSectionFocusQuaternion(
        new Quaternion(),
        "projects",
        "contact",
        Number.NaN,
      ),
    TypeError,
  );
  assert.throws(
    () =>
      writeCubeSectionFocusQuaternion(
        new Quaternion(),
        "unknown-section",
        "contact",
        0,
      ),
    RangeError,
  );
});
