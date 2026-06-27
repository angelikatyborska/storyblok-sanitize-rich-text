import { describe, it, expect } from "vitest";
import { sanitizeAttrs, sanitizeRichText } from "../src/index.ts";

describe("sanitizeRichText", () => {
  it("removes everything if whitelist is empty", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: {
            level: 1,
          },
          content: [
            {
              text: "Heading 1",
              type: "text",
            },
          ],
        },
        {
          type: "heading",
          attrs: {
            level: 2,
          },
          content: [
            {
              text: "Heading 2",
              type: "text",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {},
          content: [
            {
              text: "paragraph",
              type: "text",
            },
          ],
        },
      ],
    };

    const whitelist: string[] = [];

    const expectedOutput = {
      type: "doc",
      content: [],
    };

    expect(sanitizeRichText(input, whitelist)).toStrictEqual(expectedOutput);
  });

  it("keeps block elements allowed by the whitelist", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: {
            level: 1,
          },
          content: [
            {
              text: "Heading 1",
              type: "text",
            },
          ],
        },
        {
          type: "heading",
          attrs: {
            level: 2,
          },
          content: [
            {
              text: "Heading 2",
              type: "text",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {},
          content: [
            {
              text: "paragraph",
              type: "text",
            },
          ],
        },
      ],
    };

    const whitelist = ["h2"];

    const expectedOutput = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: {
            level: 2,
          },
          content: [
            {
              text: "Heading 2",
              type: "text",
            },
          ],
        },
      ],
    };

    expect(sanitizeRichText(input, whitelist)).toStrictEqual(expectedOutput);
  });

  // TODO: test recursive whitelisting, e.g. in lists
});

describe("sanitizeAttrs", () => {
  describe("textAlign", () => {
    it("removes if specific value not allowed", () => {
      expect(sanitizeAttrs({ level: 1, textAlign: "left" }, [])).toStrictEqual({
        level: 1,
      });

      expect(
        sanitizeAttrs({ level: 1, textAlign: "left" }, ["align-center"]),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs({ level: 1, textAlign: "left" }, ["align-right"]),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs({ level: 1, textAlign: "left" }, ["align-justify"]),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs({ level: 1, textAlign: "left" }, ["align-left"]),
      ).toStrictEqual({ level: 1, textAlign: "left" });

      expect(
        sanitizeAttrs({ level: 1, textAlign: "center" }, ["align-center"]),
      ).toStrictEqual({ level: 1, textAlign: "center" });

      expect(
        sanitizeAttrs({ level: 1, textAlign: "right" }, ["align-right"]),
      ).toStrictEqual({ level: 1, textAlign: "right" });

      expect(
        sanitizeAttrs({ level: 1, textAlign: "justify" }, ["align-justify"]),
      ).toStrictEqual({ level: 1, textAlign: "justify" });
    });
  });
});
