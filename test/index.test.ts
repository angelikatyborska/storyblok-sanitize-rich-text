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

  it("removes nested block elements if not allowed", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              attrs: {
                textAlign: null,
              },
              content: [
                {
                  text: "Lorem ipsum?",
                  type: "text",
                },
              ],
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "image",
              attrs: {
                id: 192022657793507,
                alt: "",
                src: "https://a.storyblok.com/f/293475179119189/4624x3468/881fb8e793/2026-06-26-10-06-36.jpg",
                title: "",
                source: "",
                copyright: "",
                meta_data: {},
              },
            },
          ],
        },
      ],
    };

    const whitelist = ["image", "quote"];

    // removed nested paragraph from blockquote
    const expectedOutput = {
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [],
        },
      ],
    };

    expect(sanitizeRichText(input, whitelist)).toStrictEqual(expectedOutput);
  });
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
