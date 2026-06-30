import { describe, it, expect } from "vitest";
import { sanitizeAttrs, sanitizeRichText } from "../src/sanitize.ts";

describe("sanitizeRichText", () => {
  it("removes nothing if customize toolbar is turned off", () => {
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

    const schema = { customize_toolbar: false, toolbar: [] };

    expect(sanitizeRichText(input, schema)).toStrictEqual(input);
  });

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

    const schema = { customize_toolbar: true, toolbar: [] };

    const expectedOutput = {
      type: "doc",
      content: [],
    };

    expect(sanitizeRichText(input, schema)).toStrictEqual(expectedOutput);
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

    const schema = { customize_toolbar: true, toolbar: ["h2"] };

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

    expect(sanitizeRichText(input, schema)).toStrictEqual(expectedOutput);
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

    const schema = { customize_toolbar: true, toolbar: ["image", "quote"] };

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

    expect(sanitizeRichText(input, schema)).toStrictEqual(expectedOutput);
  });

  it("removes inline formatting from various block elements", () => {
    const input = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              text: "Lorem ",
              type: "text",
              marks: [
                {
                  type: "strike",
                },
              ],
            },
            {
              text: "ipsum",
              type: "text",
              marks: [
                {
                  type: "bold",
                },
                {
                  type: "strike",
                },
              ],
            },
          ],
        },
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
                  text: "Lorem ",
                  type: "text",
                  marks: [
                    {
                      type: "textStyle",
                      attrs: {
                        color: "#E90404",
                      },
                    },
                    {
                      type: "underline",
                    },
                  ],
                },
                {
                  text: "ipsum",
                  type: "text",
                  marks: [
                    {
                      type: "textStyle",
                      attrs: {
                        color: "#E90404",
                      },
                    },
                    {
                      type: "underline",
                    },
                    {
                      type: "highlight",
                      attrs: {
                        color: "#BEEDD3",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const schema = {
      customize_toolbar: true,
      toolbar: ["paragraph", "quote", "bold"],
    };

    const expectedOutput = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {},
          content: [
            {
              text: "Lorem ",
              type: "text",
              marks: [],
            },
            {
              text: "ipsum",
              type: "text",
              marks: [
                {
                  type: "bold",
                },
              ],
            },
          ],
        },
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              attrs: {},
              content: [
                {
                  text: "Lorem ",
                  type: "text",
                  marks: [],
                },
                {
                  text: "ipsum",
                  type: "text",
                  marks: [],
                },
              ],
            },
          ],
        },
      ],
    };

    expect(sanitizeRichText(input, schema)).toStrictEqual(expectedOutput);
  });

  it('gracefully handles completely incompatible "object"', () => {
    expect(sanitizeRichText("", [])).toBe("");
    expect(sanitizeRichText("hello", [])).toBe("hello");
    expect(sanitizeRichText([], [])).toStrictEqual([]);
    expect(sanitizeRichText({ type: "doc" }, [])).toStrictEqual({
      type: "doc",
    });
  });
});

describe("sanitizeAttrs", () => {
  describe("textAlign", () => {
    it("removes if specific value not allowed", () => {
      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: [] },
        ),
      ).toStrictEqual({
        level: 1,
      });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-center"] },
        ),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-right"] },
        ),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-justify"] },
        ),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-left"] },
        ),
      ).toStrictEqual({ level: 1, textAlign: "left" });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "center" },
          { customize_toolbar: true, toolbar: ["align-center"] },
        ),
      ).toStrictEqual({ level: 1, textAlign: "center" });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "right" },
          { customize_toolbar: true, toolbar: ["align-right"] },
        ),
      ).toStrictEqual({ level: 1, textAlign: "right" });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "justify" },
          { customize_toolbar: true, toolbar: ["align-justify"] },
        ),
      ).toStrictEqual({ level: 1, textAlign: "justify" });
    });
  });
});
