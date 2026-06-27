import { describe, it, expect } from "vitest";
import { isAttrWhitelisted, isContentWhitelisted } from "../src/whitelist.ts";

describe("isContentWhitelisted", () => {
  describe("text", () => {
    it("always allowed", () => {
      const input = {
        text: "Lorem ipsum",
        type: "text",
      };

      expect(isContentWhitelisted(input, ["hrule", "ai-spelling"])).toBe(true);
      expect(isContentWhitelisted(input, [])).toBe(true);
    });
  });

  describe("heading", () => {
    it("has to match level", () => {
      const input = {
        type: "heading",
        attrs: {
          level: 1,
          textAlign: null,
        },
        content: [
          {
            text: "Heading 1",
            type: "text",
          },
        ],
      };

      expect(isContentWhitelisted(input, ["h1"])).toBe(true);
      expect(isContentWhitelisted(input, ["paragraph", "h1"])).toBe(true);
      expect(isContentWhitelisted(input, ["h2"])).toBe(false);
      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });

  describe("paragraph", () => {
    it("simple type match", () => {
      const input = {
        type: "paragraph",
        attrs: {
          textAlign: null,
        },
        content: [
          {
            text: "Lorem ipsum",
            type: "text",
          },
        ],
      };

      expect(isContentWhitelisted(input, ["paragraph"])).toBe(true);
      expect(isContentWhitelisted(input, ["h2", "paragraph"])).toBe(true);
      expect(isContentWhitelisted(input, ["h2"])).toBe(false);
      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });

  describe("hr", () => {
    it("simple type match", () => {
      const input = {
        type: "horizontal_rule",
      };

      expect(isContentWhitelisted(input, ["hrule"])).toBe(true);
      expect(isContentWhitelisted(input, ["h2", "hrule"])).toBe(true);
      expect(isContentWhitelisted(input, ["h2"])).toBe(false);
      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });

  describe("image", () => {
    it("simple type match", () => {
      const input = {
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
      };

      expect(isContentWhitelisted(input, ["h2", "image"])).toBe(true);
      expect(isContentWhitelisted(input, ["h2"])).toBe(false);
      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });

  describe("blockquote", () => {
    it("simple type match", () => {
      const input = {
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
      };

      expect(isContentWhitelisted(input, ["h2", "quote"])).toBe(true);
      expect(isContentWhitelisted(input, ["h2"])).toBe(false);
      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });

  describe("ul", () => {
    it("simple type match", () => {
      const input = {
        type: "bullet_list",
        content: [
          {
            type: "list_item",
            content: [
              {
                type: "paragraph",
                attrs: {
                  textAlign: null,
                },
                content: [
                  {
                    text: "foo",
                    type: "text",
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(isContentWhitelisted(input, ["h2", "list"])).toBe(true);
      expect(isContentWhitelisted(input, ["h2"])).toBe(false);
      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });

  describe("ol", () => {
    it("simple type match", () => {
      const input = {
        type: "ordered_list",
        content: [
          {
            type: "list_item",
            content: [
              {
                type: "paragraph",
                attrs: {
                  textAlign: null,
                },
                content: [
                  {
                    text: "foo",
                    type: "text",
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(isContentWhitelisted(input, ["h2", "olist"])).toBe(true);
      expect(isContentWhitelisted(input, ["h2"])).toBe(false);
      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });

  describe("codeblock", () => {
    it("simple type match", () => {
      const input = {
        type: "code_block",
        attrs: {
          class: "language-bash",
        },
        content: [
          {
            text: "console.log('hi')",
            type: "text",
          },
        ],
      };

      // code = code block, inlinecode = inline code
      expect(isContentWhitelisted(input, ["h2", "code"])).toBe(true);
      expect(isContentWhitelisted(input, ["h2"])).toBe(false);
      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });
});

describe("isAttrWhitelisted", () => {
  describe("textAlign", () => {
    it("has to match value", () => {
      expect(isAttrWhitelisted("textAlign", "left", ["align-left"])).toBe(true);
      expect(isAttrWhitelisted("textAlign", "center", ["align-center"])).toBe(
        true,
      );
      expect(isAttrWhitelisted("textAlign", "right", ["align-right"])).toBe(
        true,
      );
      expect(isAttrWhitelisted("textAlign", "justify", ["align-justify"])).toBe(
        true,
      );

      expect(isAttrWhitelisted("textAlign", "center", ["align-left"])).toBe(
        false,
      );
      expect(isAttrWhitelisted("textAlign", "center", ["align-right"])).toBe(
        false,
      );
      expect(isAttrWhitelisted("textAlign", "center", ["align-justify"])).toBe(
        false,
      );
      expect(isAttrWhitelisted("textAlign", undefined, ["align-justify"])).toBe(
        false,
      );
    });
  });
});
