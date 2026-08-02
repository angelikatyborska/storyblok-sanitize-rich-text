import { describe, it, expect } from "vitest";
import { sanitizeAttrs, sanitizeRichText } from "../src/sanitize.ts";
import { defaultOptions } from "../src/options.ts";
import {
  type MarkMapper,
  turnContentToParagraphOrRemove,
} from "../src/mappers.ts";

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

    expect(sanitizeRichText(input, schema, defaultOptions)).toStrictEqual(
      input,
    );
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
        { type: "hard_break" },
      ],
    };

    const schema = { customize_toolbar: true, toolbar: [] };

    const expectedOutput = {
      type: "doc",
      content: [{ type: "hard_break" }],
    };

    expect(sanitizeRichText(input, schema, defaultOptions)).toStrictEqual(
      expectedOutput,
    );
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
        { type: "hard_break" },
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
        { type: "hard_break" },
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

    expect(sanitizeRichText(input, schema, defaultOptions)).toStrictEqual(
      expectedOutput,
    );
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

    expect(sanitizeRichText(input, schema, defaultOptions)).toStrictEqual(
      expectedOutput,
    );
  });

  it("removes hard breaks if option passed", () => {
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
        { type: "hard_break" },
      ],
    };

    const schema = { customize_toolbar: false, toolbar: [] };

    const expectedOutput = {
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
      ],
    };

    expect(
      sanitizeRichText(input, schema, {
        ...defaultOptions,
        allowHardBreak: false,
      }),
    ).toStrictEqual(expectedOutput);
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

    expect(sanitizeRichText(input, schema, defaultOptions)).toStrictEqual(
      expectedOutput,
    );
  });

  it('gracefully handles completely incompatible "object"', () => {
    expect(sanitizeRichText("", [], defaultOptions)).toBe("");
    expect(sanitizeRichText("hello", [], defaultOptions)).toBe("hello");
    expect(sanitizeRichText([], [], defaultOptions)).toStrictEqual([]);

    expect(sanitizeRichText({ type: "doc" }, [], defaultOptions)).toStrictEqual(
      {
        type: "doc",
      },
    );
  });

  it("only works with root doc objects, leaves other inputs unchanged", () => {
    const input = {
      type: "paragraph",
      attrs: {
        textAlign: "center",
      },
      content: [
        {
          text: "Lorem ipsum",
          type: "text",
        },
      ],
    };

    expect(sanitizeRichText(input, [], defaultOptions)).toStrictEqual(input);
  });

  describe("with custom content mapper", () => {
    it("does not run the mapper on whitelisted content types", () => {
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
          { type: "hard_break" },
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
          // replaced h1
          "foo",
          // replaces hard_break
          "foo",
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
          // replaces paragraph
          "foo",
        ],
      };

      const options = {
        ...defaultOptions,
        allowHardBreak: false,
        contentMapper: () => "foo",
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
    });

    it("the mapper can return an array", () => {
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
        ],
      };

      const schema = { customize_toolbar: true, toolbar: ["h2"] };

      const expectedOutput = {
        type: "doc",
        content: [
          // replaced h1
          "foo",
          "bar",
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

      const options = {
        ...defaultOptions,
        allowHardBreak: false,
        contentMapper: () => ["foo", "bar"],
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
    });

    it("still checks nested content, marks, and attrs of mapped content", () => {
      const input = {
        type: "doc",
        content: [
          {
            type: "blockquote",
            content: [
              {
                type: "heading",
                attrs: {
                  level: 1,
                  textAlign: "center",
                },
                content: [
                  {
                    text: "test",
                    type: "text",
                    marks: [
                      {
                        type: "bold",
                      },
                      {
                        type: "highlight",
                        attrs: {
                          color: "#9AE69D",
                        },
                      },
                    ],
                  },
                  {
                    text: " ",
                    type: "text",
                    marks: [
                      {
                        type: "bold",
                      },
                    ],
                  },
                  {
                    text: "foo",
                    type: "text",
                    marks: [
                      {
                        type: "textStyle",
                        attrs: {
                          color: "#F69A9A",
                        },
                      },
                      {
                        type: "bold",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const schema = { customize_toolbar: true, toolbar: ["highlight"] };

      const expectedOutput = {
        type: "doc",
        content: [
          {
            type: "foo",
            content: [
              {
                type: "foo",
                attrs: {
                  level: 1,
                },
                content: [
                  {
                    text: "test",
                    type: "text",
                    marks: [
                      {
                        type: "highlight",
                        attrs: {
                          color: "#9AE69D",
                        },
                      },
                    ],
                  },
                  {
                    text: " ",
                    type: "text",
                    marks: [],
                  },
                  {
                    text: "foo",
                    type: "text",
                    marks: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const options = {
        ...defaultOptions,
        allowHardBreak: false,
        contentMapper: (n: any) => ({ ...n, type: "foo" }),
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
    });

    it("still checks nested content, marks, and attrs of mapped content when returned an array", () => {
      const input = {
        type: "doc",
        content: [
          {
            type: "blockquote",
            content: [
              {
                type: "heading",
                attrs: {
                  level: 1,
                  textAlign: "center",
                },
                content: [
                  {
                    text: "test",
                    type: "text",
                    marks: [
                      {
                        type: "bold",
                      },
                      {
                        type: "highlight",
                        attrs: {
                          color: "#9AE69D",
                        },
                      },
                    ],
                  },
                  {
                    text: " ",
                    type: "text",
                    marks: [
                      {
                        type: "bold",
                      },
                    ],
                  },
                  {
                    text: "foo",
                    type: "text",
                    marks: [
                      {
                        type: "textStyle",
                        attrs: {
                          color: "#F69A9A",
                        },
                      },
                      {
                        type: "bold",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };

      const schema = { customize_toolbar: true, toolbar: ["highlight"] };

      const expectedOutput = {
        type: "doc",
        content: [
          {
            type: "foo",
            content: [
              {
                type: "foo",
                attrs: {
                  level: 1,
                },
                content: [
                  {
                    text: "test",
                    type: "text",
                    marks: [
                      {
                        type: "highlight",
                        attrs: {
                          color: "#9AE69D",
                        },
                      },
                    ],
                  },
                  {
                    text: " ",
                    type: "text",
                    marks: [],
                  },
                  {
                    text: "foo",
                    type: "text",
                    marks: [],
                  },
                ],
              },
              {
                type: "bar",
                attrs: {
                  level: 1,
                },
                content: [
                  {
                    text: "test",
                    type: "text",
                    marks: [
                      {
                        type: "highlight",
                        attrs: {
                          color: "#9AE69D",
                        },
                      },
                    ],
                  },
                  {
                    text: " ",
                    type: "text",
                    marks: [],
                  },
                  {
                    text: "foo",
                    type: "text",
                    marks: [],
                  },
                ],
              },
            ],
          },
          {
            type: "bar",
            content: [
              {
                type: "foo",
                attrs: {
                  level: 1,
                },
                content: [
                  {
                    text: "test",
                    type: "text",
                    marks: [
                      {
                        type: "highlight",
                        attrs: {
                          color: "#9AE69D",
                        },
                      },
                    ],
                  },
                  {
                    text: " ",
                    type: "text",
                    marks: [],
                  },
                  {
                    text: "foo",
                    type: "text",
                    marks: [],
                  },
                ],
              },
              {
                type: "bar",
                attrs: {
                  level: 1,
                },
                content: [
                  {
                    text: "test",
                    type: "text",
                    marks: [
                      {
                        type: "highlight",
                        attrs: {
                          color: "#9AE69D",
                        },
                      },
                    ],
                  },
                  {
                    text: " ",
                    type: "text",
                    marks: [],
                  },
                  {
                    text: "foo",
                    type: "text",
                    marks: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const options = {
        ...defaultOptions,
        allowHardBreak: false,
        contentMapper: (n: any) => [
          { ...n, type: "foo" },
          { ...n, type: "bar" },
        ],
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
    });

    it("works with the provided mapper `turnContentToParagraphOrRemove`", () => {
      const input = {
        type: "doc",
        content: [
          {
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
          },
          {
            type: "heading",
            attrs: {
              level: 2,
              textAlign: null,
            },
            content: [
              {
                text: "Heading 2",
                type: "text",
              },
            ],
          },
          {
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
                        text: "list item 1",
                        type: "text",
                      },
                    ],
                  },
                ],
              },
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
                        text: "list item 2",
                        type: "text",
                      },
                    ],
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
                    text: "A ",
                    type: "text",
                  },
                  {
                    text: "blockquote",
                    type: "text",
                    marks: [
                      {
                        type: "textStyle",
                        attrs: {
                          color: "#9BEFAF",
                        },
                      },
                      {
                        type: "bold",
                      },
                    ],
                  },
                  {
                    text: " with a list.",
                    type: "text",
                  },
                ],
              },
              {
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
                            text: "list item 1",
                            type: "text",
                          },
                        ],
                      },
                    ],
                  },
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
                            text: "list item 2",
                            type: "text",
                          },
                        ],
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
        toolbar: ["h1", "paragraph", "bold"],
      };

      const expectedOutput = {
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
            type: "paragraph",
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
                text: "list item 1",
                type: "text",
              },
            ],
          },
          {
            type: "paragraph",
            attrs: {},
            content: [
              {
                text: "list item 2",
                type: "text",
              },
            ],
          },
          {
            type: "paragraph",
            attrs: {},
            content: [
              {
                text: "A ",
                type: "text",
              },
              {
                text: "blockquote",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                ],
              },
              {
                text: " with a list.",
                type: "text",
              },
            ],
          },
          {
            type: "paragraph",
            attrs: {},
            content: [
              {
                text: "list item 1",
                type: "text",
              },
            ],
          },
          {
            type: "paragraph",
            attrs: {},
            content: [
              {
                text: "list item 2",
                type: "text",
              },
            ],
          },
        ],
      };

      const options = {
        ...defaultOptions,
        contentMapper: turnContentToParagraphOrRemove,
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
    });
  });

  describe("with custom mark mapper", () => {
    it("does not run the mapper on whitelisted marks", () => {
      const input = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: {
              textAlign: "left",
            },
            content: [
              {
                text: "foo",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                  {
                    type: "italic",
                  },
                ],
              },
              {
                text: " ",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                ],
              },
              {
                text: "bar",
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
        ],
      };

      const schema = {
        customize_toolbar: true,
        toolbar: ["paragraph", "bold"],
      };

      const expectedOutput = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: {},
            content: [
              {
                text: "foo",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                  {
                    type: "highlight",
                    attrs: {
                      color: "#9AE69D",
                    },
                  },
                ],
              },
              {
                text: " ",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                ],
              },
              {
                text: "bar",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                  {
                    type: "highlight",
                    attrs: {
                      color: "#9AE69D",
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const markMapper: MarkMapper = () => ({
        type: "highlight",
        attrs: {
          color: "#9AE69D",
        },
      });
      const options = {
        ...defaultOptions,
        markMapper,
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
    });

    it("the mapper can return an array", () => {
      const input = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: {
              textAlign: "left",
            },
            content: [
              {
                text: "foo",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                  {
                    type: "italic",
                  },
                ],
              },
              {
                text: " ",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                ],
              },
              {
                text: "bar",
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
        ],
      };

      const schema = {
        customize_toolbar: true,
        toolbar: ["paragraph", "bold"],
      };

      const expectedOutput = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: {},
            content: [
              {
                text: "foo",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                  {
                    type: "textStyle",
                    attrs: {
                      color: "#266528",
                    },
                  },
                  {
                    type: "highlight",
                    attrs: {
                      color: "#9AE69D",
                    },
                  },
                ],
              },
              {
                text: " ",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                ],
              },
              {
                text: "bar",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                  {
                    type: "textStyle",
                    attrs: {
                      color: "#266528",
                    },
                  },
                  {
                    type: "highlight",
                    attrs: {
                      color: "#9AE69D",
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const markMapper: MarkMapper = () => [
        {
          type: "textStyle",
          attrs: {
            color: "#266528",
          },
        },
        {
          type: "highlight",
          attrs: {
            color: "#9AE69D",
          },
        },
      ];

      const options = {
        ...defaultOptions,
        markMapper,
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
    });
  });

  describe("with custom attr mapper", () => {
    it("does not run the mapper on whitelisted attributes", () => {
      const input = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: {
              dir: "ltr",
              textAlign: "right",
            },
            content: [
              {
                text: "foo bar",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                ],
              },
            ],
          },
        ],
      };

      const schema = {
        customize_toolbar: true,
        rtl: true,
        toolbar: ["ltr", "rtl", "paragraph", "bold"],
      };

      const expectedOutput = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: {
              dir: "ltr",
              foo: "bar",
            },
            content: [
              {
                text: "foo bar",
                type: "text",
                marks: [
                  {
                    type: "bold",
                  },
                ],
              },
            ],
          },
        ],
      };

      const attributeMapper: () => [string, string] = () => ["foo", "bar"];
      const options = {
        ...defaultOptions,
        attributeMapper,
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
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
          defaultOptions,
        ),
      ).toStrictEqual({
        level: 1,
      });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-center"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-right"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-justify"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-left"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1, textAlign: "left" });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "center" },
          { customize_toolbar: true, toolbar: ["align-center"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1, textAlign: "center" });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "right" },
          { customize_toolbar: true, toolbar: ["align-right"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1, textAlign: "right" });

      expect(
        sanitizeAttrs(
          { level: 1, textAlign: "justify" },
          { customize_toolbar: true, toolbar: ["align-justify"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1, textAlign: "justify" });
    });
  });
});
