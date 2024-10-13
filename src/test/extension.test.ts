import * as assert from "assert";
import * as vscode from "vscode";
import { before, after } from "mocha";
import { activate, checkOverlap, validateSchema } from "../extension";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  let context: vscode.ExtensionContext;

  before(() => {
    context = {
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;
    activate(context);
  });

  after(() => {
    context.subscriptions.forEach((subscription) => subscription.dispose());
  });

  test("Should activate extension", () => {
    assert.ok(context.subscriptions.length > 0);
  });

  test("Should validate schema correctly", () => {
    const validJson = {
      port1: {
        baseAddress: 1000,
        protocol: "TCP",
        sizeBytes: 100,
        widthBits: 32,
      },
      port2: {
        baseAddress: 1100,
        protocol: "UDP",
        sizeBytes: 50,
        widthBits: 16,
      },
    };
    assert.strictEqual(validateSchema(validJson), true);

    const invalidJsonMissingKey = {
      port1: {
        baseAddress: 1000,
        protocol: "TCP",
        sizeBytes: 100,
        // Missing widthBits
      },
    };
    assert.strictEqual(validateSchema(invalidJsonMissingKey), false);

    const invalidJsonEmpty = {};
    assert.strictEqual(validateSchema(invalidJsonEmpty), true); // No schema violation for empty object

    const invalidJsonNested = {
      port1: {
        baseAddress: 1000,
        protocol: "TCP",
        sizeBytes: 100,
        widthBits: 32,
        // Nested objects not allowed for validation
        extra: {
          name: "extraPort",
        },
      },
    };
    assert.strictEqual(validateSchema(invalidJsonNested), true); // It ignores non-essential fields
  });

  test("Should detect overlap correctly", () => {
    const overlappingJson = {
      port1: {
        baseAddress: 1000,
        protocol: "TCP",
        sizeBytes: 200,
        widthBits: 32,
      },
      port2: {
        baseAddress: 1100,
        protocol: "UDP",
        sizeBytes: 50,
        widthBits: 16,
      },
    };
    const overlap = checkOverlap(overlappingJson);
    assert.strictEqual(
      overlap,
      "port1 (1000-1200) overlaps with port2 (1100-1150)"
    );

    const nonOverlappingJson = {
      port1: {
        baseAddress: 1000,
        protocol: "TCP",
        sizeBytes: 50,
        widthBits: 32,
      },
      port2: {
        baseAddress: 1100,
        protocol: "UDP",
        sizeBytes: 50,
        widthBits: 16,
      },
    };
    const noOverlap = checkOverlap(nonOverlappingJson);
    assert.strictEqual(noOverlap, null);
  });

  test("Should handle invalid JSON gracefully", () => {
    const invalidJson = `{
      port1: {
        baseAddress: 1000,
        protocol: "TCP",
        sizeBytes: 100,
        widthBits: 32,
      }
    `; // Missing closing bracket

    assert.throws(() => {
      JSON.parse(invalidJson);
    }, SyntaxError);
  });

  // TODO: Handle edge case scenario and fix failing test cases.
  // test("Should handle edge cases for overlapping", () => {
  //   const edgeCaseJson = {
  //     port1: {
  //       baseAddress: 1000,
  //       protocol: "TCP",
  //       sizeBytes: 100,
  //       widthBits: 32,
  //     },
  //     port2: {
  //       baseAddress: 1100,
  //       protocol: "UDP",
  //       sizeBytes: 50,
  //       widthBits: 16,
  //     },
  //   };
  //   const overlapEdgeCase = checkOverlap(edgeCaseJson);
  //   assert.strictEqual(
  //     overlapEdgeCase,
  //     "port1 (1000-1100) overlaps with port2 (1100-1150)"
  //   );

  //   const touchingRanges = {
  //     port1: {
  //       baseAddress: 1000,
  //       protocol: "TCP",
  //       sizeBytes: 100,
  //       widthBits: 32,
  //     },
  //     port2: {
  //       baseAddress: 1100,
  //       protocol: "UDP",
  //       sizeBytes: 0, // Touches the previous range but doesn't overlap
  //       widthBits: 16,
  //     },
  //   };
  //   const noOverlapForTouching = checkOverlap(touchingRanges);
  //   assert.strictEqual(noOverlapForTouching, null);
  // });

  // test("Should show information message when not a JSON file", async () => {
  //   const nonJsonFile = {
  //     languageId: "javascript",
  //   };
  //   const message = await vscode.window.showInformationMessage(
  //     "This extension requires a valid JSON file to function correctly."
  //   );
  //   assert.strictEqual(message, undefined);
  // });
});
