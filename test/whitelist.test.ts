import { describe, it, expect } from "vitest";
import {
  isAttrWhitelisted,
  isContentWhitelisted,
  isMarkWhitelisted,
} from "../src/whitelist.ts";

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

  describe("table", () => {
    it("simple type match", () => {
      const input = {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              {
                type: "tableHeader",
                attrs: {
                  colspan: 1,
                  rowspan: 1,
                  colwidth: null,
                },
                content: [
                  {
                    type: "paragraph",
                    attrs: {
                      textAlign: null,
                    },
                    content: [
                      {
                        text: "order",
                        type: "text",
                      },
                    ],
                  },
                ],
              },
              {
                type: "tableHeader",
                attrs: {
                  colspan: 1,
                  rowspan: 1,
                  colwidth: null,
                },
                content: [
                  {
                    type: "paragraph",
                    attrs: {
                      textAlign: null,
                    },
                    content: [
                      {
                        text: "date",
                        type: "text",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                attrs: {
                  colspan: 1,
                  rowspan: 1,
                  colwidth: null,
                  backgroundColor: null,
                },
                content: [
                  {
                    type: "paragraph",
                    attrs: {
                      textAlign: null,
                    },
                    content: [
                      {
                        text: "1",
                        type: "text",
                      },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                attrs: {
                  colspan: 1,
                  rowspan: 1,
                  colwidth: null,
                  backgroundColor: null,
                },
                content: [
                  {
                    type: "paragraph",
                    attrs: {
                      textAlign: null,
                    },
                    content: [
                      {
                        text: "2023.01.04",
                        type: "text",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      expect(isContentWhitelisted(input, ["h2", "add-table"])).toBe(true);
      expect(isContentWhitelisted(input, ["h2"])).toBe(false);
      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });

  describe("tableHeader", () => {
    it("match one of many formatting options", () => {
      const input = {
        type: "tableHeader",
        attrs: {
          colspan: 1,
          rowspan: 1,
          colwidth: null,
        },
        content: [
          {
            type: "paragraph",
            attrs: {
              textAlign: null,
            },
            content: [
              {
                text: "order",
                type: "text",
              },
            ],
          },
        ],
      };

      expect(isContentWhitelisted(input, ["h2", "toggle-header-row"])).toBe(
        true,
      );
      expect(isContentWhitelisted(input, ["h2", "toggle-header-column"])).toBe(
        true,
      );
      expect(isContentWhitelisted(input, ["h2", "toggle-header-cell"])).toBe(
        true,
      );
      expect(isContentWhitelisted(input, ["h2"])).toBe(false);
      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });
});

describe("isAttrWhitelisted", () => {
  describe("textAlign", () => {
    it("whitelisting is value-specific", () => {
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

  describe("backgroundColor", () => {
    it("is cell-color", () => {
      expect(
        isAttrWhitelisted("backgroundColor", "#83EB92", ["cell-color"]),
      ).toBe(true);
      expect(
        isAttrWhitelisted("backgroundColor", "#83EB92", [
          "highlight",
          "cell-color",
        ]),
      ).toBe(true);
      expect(
        isAttrWhitelisted("backgroundColor", "#83EB92", ["highlight"]),
      ).toBe(false);
    });
  });

  describe("colspan / rowspan", () => {
    it("always allows value of 1", () => {
      expect(isAttrWhitelisted("rowspan", 1, [])).toBe(true);
      expect(isAttrWhitelisted("colspan", 1, [])).toBe(true);
    });

    it("requires merging cells for higher values", () => {
      expect(isAttrWhitelisted("rowspan", 2, ["h2", "merge-cells"])).toBe(true);
      expect(isAttrWhitelisted("rowspan", 2, ["h2"])).toBe(false);
      expect(isAttrWhitelisted("colspan", 3, ["h2", "merge-cells"])).toBe(true);
      expect(isAttrWhitelisted("colspan", 3, ["h2"])).toBe(false);
    });
  });
});

describe("isMarkWhitelisted", () => {
  describe("bold", () => {
    it("simple type match", () => {
      const input = {
        type: "bold",
      };

      expect(isMarkWhitelisted(input, ["bold"])).toBe(true);
      expect(isMarkWhitelisted(input, ["h2", "bold"])).toBe(true);
      expect(isMarkWhitelisted(input, ["underline"])).toBe(false);
      expect(isMarkWhitelisted(input, ["h1"])).toBe(false);
    });
  });

  describe("underline", () => {
    it("simple type match", () => {
      const input = {
        type: "underline",
      };

      expect(isMarkWhitelisted(input, ["underline"])).toBe(true);
      expect(isMarkWhitelisted(input, ["h2", "underline"])).toBe(true);
      expect(isMarkWhitelisted(input, ["bold"])).toBe(false);
      expect(isMarkWhitelisted(input, ["h1"])).toBe(false);
    });
  });

  describe("textStyle", () => {
    it("simple type match", () => {
      const input = {
        type: "textStyle",
      };

      expect(isMarkWhitelisted(input, ["color"])).toBe(true);
      expect(isMarkWhitelisted(input, ["h2", "color"])).toBe(true);
      expect(isMarkWhitelisted(input, ["bold"])).toBe(false);
      expect(isMarkWhitelisted(input, ["h1"])).toBe(false);
    });
  });

  describe("highlight", () => {
    it("simple type match", () => {
      const input = {
        type: "highlight",
      };

      expect(isMarkWhitelisted(input, ["highlight"])).toBe(true);
      expect(isMarkWhitelisted(input, ["h2", "highlight"])).toBe(true);
      expect(isMarkWhitelisted(input, ["bold"])).toBe(false);
      expect(isMarkWhitelisted(input, ["h1"])).toBe(false);
    });
  });

  describe("strike", () => {
    it("simple type match", () => {
      const input = {
        type: "strike",
      };

      expect(isMarkWhitelisted(input, ["strike"])).toBe(true);
      expect(isMarkWhitelisted(input, ["h2", "strike"])).toBe(true);
      expect(isMarkWhitelisted(input, ["bold"])).toBe(false);
      expect(isMarkWhitelisted(input, ["h1"])).toBe(false);
    });
  });

  describe("superscript", () => {
    it("simple type match", () => {
      const input = {
        type: "superscript",
      };

      expect(isMarkWhitelisted(input, ["superscript"])).toBe(true);
      expect(isMarkWhitelisted(input, ["h2", "superscript"])).toBe(true);
      expect(isMarkWhitelisted(input, ["subscript"])).toBe(false);
      expect(isMarkWhitelisted(input, ["h1"])).toBe(false);
    });
  });

  describe("subscript", () => {
    it("simple type match", () => {
      const input = {
        type: "subscript",
      };

      expect(isMarkWhitelisted(input, ["subscript"])).toBe(true);
      expect(isMarkWhitelisted(input, ["h2", "subscript"])).toBe(true);
      expect(isMarkWhitelisted(input, ["superscript"])).toBe(false);
      expect(isMarkWhitelisted(input, ["h1"])).toBe(false);
    });
  });

  describe("code (inline)", () => {
    it("simple type match", () => {
      const input = {
        type: "code",
      };

      // code = code block, inlinecode = inline code
      expect(isMarkWhitelisted(input, ["inlinecode"])).toBe(true);
      expect(isMarkWhitelisted(input, ["h2", "inlinecode"])).toBe(true);
      expect(isMarkWhitelisted(input, ["code"])).toBe(false);
      expect(isMarkWhitelisted(input, ["bold"])).toBe(false);
    });
  });
});
