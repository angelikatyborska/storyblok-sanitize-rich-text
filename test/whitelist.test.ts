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

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["hrule", "ai-spelling"],
        }),
      ).toBe(true);

      expect(
        isContentWhitelisted(input, { customize_toolbar: true, toolbar: [] }),
      ).toBe(true);

      expect(
        isContentWhitelisted(input, { customize_toolbar: false, toolbar: [] }),
      ).toBe(true);
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

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h1"],
        }),
      ).toBe(true);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["paragraph", "h1"],
        }),
      ).toBe(true);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["ai-spelling"],
        }),
      ).toBe(false);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
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

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["paragraph"],
        }),
      ).toBe(true);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "paragraph"],
        }),
      ).toBe(true);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["ai-spelling"],
        }),
      ).toBe(false);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("hr", () => {
    it("simple type match", () => {
      const input = {
        type: "horizontal_rule",
      };

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["hrule"],
        }),
      ).toBe(true);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "hrule"],
        }),
      ).toBe(true);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["ai-spelling"],
        }),
      ).toBe(false);

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
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

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "image"],
        }),
      ).toBe(true);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["ai-spelling"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
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

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "quote"],
        }),
      ).toBe(true);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["ai-spelling"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
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

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "list"],
        }),
      ).toBe(true);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["ai-spelling"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
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

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "olist"],
        }),
      ).toBe(true);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["ai-spelling"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
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
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "code"],
        }),
      ).toBe(true);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["ai-spelling"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
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

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "add-table"],
        }),
      ).toBe(true);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["ai-spelling"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
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

      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "toggle-header-row"],
        }),
      ).toBe(true);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "toggle-header-column"],
        }),
      ).toBe(true);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "toggle-header-cell"],
        }),
      ).toBe(true);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["ai-spelling"],
        }),
      ).toBe(false);
      expect(
        isContentWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });
});

describe("isMarkWhitelisted", () => {
  describe("bold", () => {
    it("simple type match", () => {
      const input = {
        type: "bold",
      };

      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["bold"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "bold"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["underline"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, { customize_toolbar: true, toolbar: ["h1"] }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("underline", () => {
    it("simple type match", () => {
      const input = {
        type: "underline",
      };

      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["underline"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "underline"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["bold"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, { customize_toolbar: true, toolbar: ["h1"] }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("textStyle", () => {
    it("simple type match", () => {
      const input = {
        type: "textStyle",
        attrs: {
          color: "#AB1A1A",
        },
      };

      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["color"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "color"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["bold"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, { customize_toolbar: true, toolbar: ["h1"] }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("highlight", () => {
    it("simple type match", () => {
      const input = {
        type: "highlight",
        attrs: {
          color: "#9BEFAF",
        },
      };

      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["highlight"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "highlight"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["bold"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, { customize_toolbar: true, toolbar: ["h1"] }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("strike", () => {
    it("simple type match", () => {
      const input = {
        type: "strike",
      };

      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["strike"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "strike"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["bold"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, { customize_toolbar: true, toolbar: ["h1"] }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("superscript", () => {
    it("simple type match", () => {
      const input = {
        type: "superscript",
      };

      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["superscript"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "superscript"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["bold"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, { customize_toolbar: true, toolbar: ["h1"] }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("subscript", () => {
    it("simple type match", () => {
      const input = {
        type: "subscript",
      };

      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["subscript"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "subscript"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["bold"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, { customize_toolbar: true, toolbar: ["h1"] }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("code (inline)", () => {
    it("simple type match", () => {
      const input = {
        type: "code",
      };

      // code = code block, inlinecode = inline code
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["inlinecode"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "inlinecode"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["code"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["bold"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("emoji", () => {
    it("simple type match", () => {
      const input = {
        type: "emoji",
        attrs: {
          name: "nerd_face",
          emoji: "🤓",
          fallbackImage:
            "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f913.png",
        },
      };

      // code = code block, inlinecode = inline code
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["emoji"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "emoji"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["code"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["bold"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("link", () => {
    it("simple type match", () => {
      const input = {
        type: "link",
        attrs: {
          href: "https://example.com",
          uuid: null,
          anchor: null,
          target: "_self",
          linktype: "url",
        },
      };

      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["link"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["h2", "link"],
        }),
      ).toBe(true);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["code"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: true,
          toolbar: ["bold"],
        }),
      ).toBe(false);
      expect(
        isMarkWhitelisted(input, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });
});

describe("isAttrWhitelisted", () => {
  describe("textAlign", () => {
    it("whitelisting is value-specific", () => {
      expect(
        isAttrWhitelisted("textAlign", "left", {
          customize_toolbar: true,
          toolbar: ["align-left"],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("textAlign", "center", {
          customize_toolbar: true,
          toolbar: ["align-center"],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("textAlign", "right", {
          customize_toolbar: true,
          toolbar: ["align-right"],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("textAlign", "justify", {
          customize_toolbar: true,
          toolbar: ["align-justify"],
        }),
      ).toBe(true);

      expect(
        isAttrWhitelisted("textAlign", "center", {
          customize_toolbar: true,
          toolbar: ["align-left"],
        }),
      ).toBe(false);
      expect(
        isAttrWhitelisted("textAlign", "center", {
          customize_toolbar: true,
          toolbar: ["align-right"],
        }),
      ).toBe(false);
      expect(
        isAttrWhitelisted("textAlign", "center", {
          customize_toolbar: true,
          toolbar: ["align-justify"],
        }),
      ).toBe(false);
      expect(
        isAttrWhitelisted("textAlign", undefined, {
          customize_toolbar: true,
          toolbar: ["align-justify"],
        }),
      ).toBe(false);
      expect(
        isAttrWhitelisted("textAlign", "left", {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("backgroundColor", () => {
    it("is cell-color", () => {
      expect(
        isAttrWhitelisted("backgroundColor", "#83EB92", {
          customize_toolbar: true,
          toolbar: ["cell-color"],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("backgroundColor", "#83EB92", {
          customize_toolbar: true,
          toolbar: ["highlight", "cell-color"],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("backgroundColor", "#83EB92", {
          customize_toolbar: true,
          toolbar: ["highlight"],
        }),
      ).toBe(false);
      expect(
        isAttrWhitelisted("backgroundColor", "#83EB92", {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("colspan / rowspan", () => {
    it("always allows value of 1", () => {
      expect(
        isAttrWhitelisted("rowspan", 1, {
          customize_toolbar: true,
          toolbar: [],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("colspan", 1, {
          customize_toolbar: true,
          toolbar: [],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("rowspan", 1, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });

    it("requires merging cells for higher values", () => {
      expect(
        isAttrWhitelisted("rowspan", 2, {
          customize_toolbar: true,
          toolbar: ["h2", "merge-cells"],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("rowspan", 2, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);
      expect(
        isAttrWhitelisted("colspan", 3, {
          customize_toolbar: true,
          toolbar: ["h2", "merge-cells"],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("colspan", 3, {
          customize_toolbar: true,
          toolbar: ["h2"],
        }),
      ).toBe(false);
      expect(
        isAttrWhitelisted("rowspan", 2, {
          customize_toolbar: false,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });

  describe("dir (ltr/rtl)", () => {
    it("whitelisting is value-specific", () => {
      expect(
        isAttrWhitelisted("dir", "ltr", {
          customize_toolbar: true,
          rtl: true,
          toolbar: ["ltr", "rtl"],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("dir", "rtl", {
          customize_toolbar: true,
          rtl: true,
          toolbar: ["ltr", "rtl"],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("dir", "ltr", {
          customize_toolbar: true,
          rtl: true,
          toolbar: ["ltr"],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("dir", "rtl", {
          customize_toolbar: true,
          rtl: true,
          toolbar: ["ltr"],
        }),
      ).toBe(false);
      expect(
        isAttrWhitelisted("dir", "ltr", {
          customize_toolbar: true,
          rtl: true,
          toolbar: ["rtl"],
        }),
      ).toBe(false);
      expect(
        isAttrWhitelisted("dir", "rtl", {
          customize_toolbar: true,
          rtl: true,
          toolbar: ["rtl"],
        }),
      ).toBe(true);
      expect(
        isAttrWhitelisted("dir", "ltr", {
          customize_toolbar: false,
          rtl: true,
          toolbar: [],
        }),
      ).toBe(true);
    });
  });
});
