import * as assert from "assert";
import {
  convertVectorDrawableToSVG,
  getNonce,
  isAndroidVectorDrawable,
} from "../utils";
import * as vscode from "vscode";

const BASIC_VECTOR = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FF0000"
        android:pathData="M3,3L21,3L21,21L3,21Z" />
</vector>`;

suite("convertVectorDrawableToSVG", () => {
  test("returns null for non-vector XML", () => {
    assert.strictEqual(
      convertVectorDrawableToSVG("<shape><solid/></shape>"),
      null
    );
  });

  test("returns null for empty string", () => {
    assert.strictEqual(convertVectorDrawableToSVG(""), null);
  });

  test("converts basic vector with single path", () => {
    const svg = convertVectorDrawableToSVG(BASIC_VECTOR);
    assert.ok(svg, "expected an SVG result");
    assert.ok(svg!.includes('xmlns="http://www.w3.org/2000/svg"'));
    assert.ok(svg!.includes('width="24"'));
    assert.ok(svg!.includes('height="24"'));
    assert.ok(svg!.includes('viewBox="0 0 24 24"'));
    assert.ok(svg!.includes('d="M3,3L21,3L21,21L3,21Z"'));
    assert.ok(svg!.includes('fill="#FF0000"'));
    assert.ok(svg!.includes("</svg>"));
  });

  test("defaults viewport to 24 when missing", () => {
    const xml = `<vector android:width="48dp" android:height="48dp">
      <path android:pathData="M0,0L1,1" android:fillColor="#000"/>
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('viewBox="0 0 24 24"'));
    assert.ok(svg!.includes('width="48"'));
    assert.ok(svg!.includes('height="48"'));
  });

  test("falls back to viewport for width/height when not given", () => {
    const xml = `<vector android:viewportWidth="100" android:viewportHeight="50">
      <path android:pathData="M0,0L1,1" android:fillColor="#000"/>
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('width="100"'));
    assert.ok(svg!.includes('height="50"'));
    assert.ok(svg!.includes('viewBox="0 0 100 50"'));
  });

  test("strips dp suffix from width/height", () => {
    const xml = `<vector android:width="32dp" android:height="32dp" android:viewportWidth="16" android:viewportHeight="16">
      <path android:pathData="M0,0L1,1" android:fillColor="#000"/>
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('width="32"'));
    assert.ok(svg!.includes('height="32"'));
  });

  test("applies tint to path without fillColor", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24" android:tint="#123456">
      <path android:pathData="M0,0L1,1" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('fill="#123456"'));
  });

  test("path fillColor overrides tint", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24" android:tint="#111111">
      <path android:pathData="M0,0L1,1" android:fillColor="#222222" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('fill="#222222"'));
    assert.ok(!svg!.includes('fill="#111111"'));
  });

  test("defaults fill to #000000 when no tint and no fillColor", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <path android:pathData="M0,0L1,1" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('fill="#000000"'));
  });

  test("maps vector alpha to svg opacity", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24" android:alpha="0.5">
      <path android:pathData="M0,0L1,1" android:fillColor="#000"/>
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('opacity="0.5"'));
  });

  test("converts #AARRGGBB color to rgba()", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <path android:pathData="M0,0L1,1" android:fillColor="#80FF0000" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('fill="rgba(255, 0, 0, 0.502)"'));
  });

  test("passes #RRGGBB color through", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <path android:pathData="M0,0L1,1" android:fillColor="#00FF00" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('fill="#00FF00"'));
  });

  test("substitutes placeholder for @color reference", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <path android:pathData="M0,0L1,1" android:fillColor="@color/primary" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('fill="#757575"'));
  });

  test("maps fillAlpha to fill-opacity", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <path android:pathData="M0,0L1,1" android:fillColor="#000" android:fillAlpha="0.25" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('fill-opacity="0.25"'));
  });

  test("maps strokeColor/strokeWidth/strokeAlpha", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <path android:pathData="M0,0L1,1" android:fillColor="#000"
            android:strokeColor="#FFFFFF" android:strokeWidth="2" android:strokeAlpha="0.5" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('stroke="#FFFFFF"'));
    assert.ok(svg!.includes('stroke-width="2"'));
    assert.ok(svg!.includes('stroke-opacity="0.5"'));
  });

  test("maps fillType evenOdd to fill-rule", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <path android:pathData="M0,0L1,1" android:fillColor="#000" android:fillType="evenOdd" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('fill-rule="evenodd"'));
  });

  test("omits fill-rule when fillType is not evenOdd", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <path android:pathData="M0,0L1,1" android:fillColor="#000" android:fillType="nonZero" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(!svg!.includes("fill-rule"));
  });

  test("emits no path element when pathData is missing", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <path android:fillColor="#000" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(!svg!.includes("<path"));
  });

  test("converts multiple paths", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <path android:pathData="M0,0L1,1" android:fillColor="#FF0000" />
      <path android:pathData="M2,2L3,3" android:fillColor="#00FF00" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    const redCount = (svg!.match(/fill="#FF0000"/g) || []).length;
    const greenCount = (svg!.match(/fill="#00FF00"/g) || []).length;
    assert.strictEqual(redCount, 1);
    assert.strictEqual(greenCount, 1);
  });
});

suite("group transforms", () => {
  test("translates group into <g transform>", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <group android:translateX="2" android:translateY="3">
        <path android:pathData="M0,0L1,1" android:fillColor="#000" />
      </group>
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('<g transform="translate(2, 3)">'));
    assert.ok(svg!.includes("</g>"));
  });

  test("emits rotation with pivot", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <group android:rotation="45" android:pivotX="12" android:pivotY="12">
        <path android:pathData="M0,0L1,1" android:fillColor="#000" />
      </group>
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('rotate(45, 12, 12)'));
  });

  test("emits rotation without pivot when pivot is zero", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <group android:rotation="90">
        <path android:pathData="M0,0L1,1" android:fillColor="#000" />
      </group>
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('rotate(90)'));
    assert.ok(!svg!.includes("rotate(90,"));
  });

  test("emits scale transform", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <group android:scaleX="2" android:scaleY="0.5">
        <path android:pathData="M0,0L1,1" android:fillColor="#000" />
      </group>
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes("scale(2, 0.5)"));
  });

  test("emits <g> with no transform when group has no transform attrs", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <group>
        <path android:pathData="M0,0L1,1" android:fillColor="#000" />
      </group>
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes("<g>\n"));
  });

  test("handles nested groups", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <group android:translateX="1" android:translateY="1">
        <group android:rotation="90">
          <path android:pathData="M0,0L1,1" android:fillColor="#000" />
        </group>
      </group>
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(svg!.includes('transform="translate(1, 1)"'));
    assert.ok(svg!.includes("rotate(90)"));
    const gOpen = (svg!.match(/<g/g) || []).length;
    const gClose = (svg!.match(/<\/g>/g) || []).length;
    assert.strictEqual(gOpen, 2);
    assert.strictEqual(gClose, 2);
  });

  test("skips self-closing group with no children", () => {
    const xml = `<vector android:viewportWidth="24" android:viewportHeight="24">
      <group android:translateX="5" android:translateY="5"/>
      <path android:pathData="M0,0L1,1" android:fillColor="#000" />
    </vector>`;
    const svg = convertVectorDrawableToSVG(xml);
    assert.ok(!svg!.includes("<g"), "self-closing group should not emit <g>");
    assert.ok(svg!.includes('d="M0,0L1,1"'));
  });
});

suite("getNonce", () => {
  test("returns a 32-character alphanumeric string", () => {
    const nonce = getNonce();
    assert.strictEqual(nonce.length, 32);
    assert.match(nonce, /^[A-Za-z0-9]{32}$/);
  });

  test("returns different values on subsequent calls", () => {
    const a = getNonce();
    const b = getNonce();
    assert.notStrictEqual(a, b);
  });
});

suite("isAndroidVectorDrawable", () => {
  test("returns true for xml document containing a <vector> tag", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: BASIC_VECTOR,
      language: "xml",
    });
    assert.strictEqual(isAndroidVectorDrawable(doc), true);
  });

  test("returns false for xml document without a <vector> tag", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: "<shape><solid/></shape>",
      language: "xml",
    });
    assert.strictEqual(isAndroidVectorDrawable(doc), false);
  });

  test("returns false when languageId is not xml (even with vector content)", () => {
    const mockDoc = {
      languageId: "plaintext",
      getText: () => BASIC_VECTOR,
    } as unknown as vscode.TextDocument;
    assert.strictEqual(isAndroidVectorDrawable(mockDoc), false);
  });

  test("returns true when languageId is xml and content has a <vector> tag", () => {
    const mockDoc = {
      languageId: "xml",
      getText: () => BASIC_VECTOR,
    } as unknown as vscode.TextDocument;
    assert.strictEqual(isAndroidVectorDrawable(mockDoc), true);
  });

  test("matches <vector> with attributes and self-closing form", async () => {
    const doc = await vscode.workspace.openTextDocument({
      content: `<vector android:viewportWidth="24"/>`,
      language: "xml",
    });
    assert.strictEqual(isAndroidVectorDrawable(doc), true);
  });
});
