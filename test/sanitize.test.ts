import { describe, it, expect, vi } from "vitest";
import {
  sanitizeAttrs,
  sanitizeRichText,
  UnchangedContentMappingError,
} from "../src/sanitize.ts";
import { defaultOptions } from "../src/options.ts";
import {
  type AttributeMapper,
  type MarkMapper,
  type NodeMapper,
  turnNodeIntoParagraphOrRemove,
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
                    {
                      type: "styled",
                      attrs: {
                        class: "gradient-red-500",
                      },
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
                      type: "styled",
                      attrs: {
                        class: "custom-class",
                      },
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

  it("keeps whitelisted custom CSS classes", () => {
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
                  type: "styled",
                  attrs: {
                    class: "gradient-red-500",
                  },
                },
              ],
            },
            {
              text: "ipsum",
              type: "text",
              marks: [
                {
                  type: "styled",
                  attrs: {
                    class: "custom-class",
                  },
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
      style_options: [{ name: "Custom Class", value: "custom-class" }],
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
                  type: "styled",
                  attrs: {
                    class: "custom-class",
                  },
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

      const nodeMapper: NodeMapper = vi.fn().mockImplementation(() => "foo");

      const options = {
        ...defaultOptions,
        allowHardBreak: false,
        nodeMapper,
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
      expect(nodeMapper).toHaveBeenCalledTimes(3);
      expect(nodeMapper).toHaveBeenCalledWith(input.content[0]);
      expect(nodeMapper).toHaveBeenCalledWith(input.content[1]);
      expect(nodeMapper).toHaveBeenCalledWith(input.content[3]);
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
        nodeMapper: () => ["foo", "bar"],
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
    });

    it("runs the mapper on the output of the mapper", () => {
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
          // h1 replaced with a paragraph, that then gets removed by a second run of the mapper
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
        nodeMapper: (node: any) => {
          if (node.type === "heading") {
            return {
              ...node,
              type: "paragraph",
            };
          } else {
            return null;
          }
        },
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
    });

    it("throws UnchangedContentMappingError if the mapper does not modify not allowed content", () => {
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

      const schema = { customize_toolbar: true, toolbar: ["paragraph"] };

      const options = {
        ...defaultOptions,
        nodeMapper: (node: any) => node,
      };

      expect(() => sanitizeRichText(input, schema, options)).toThrow(
        UnchangedContentMappingError,
      );
    });

    // This behavior is necessary for the library core function. Certain components are "wrappers".
    // E.g. a blockquote can contain paragraphs, headings, lists etc., a list item can contain a list.
    // The mappers need to be able to "unwrap" content, and still provide whitelisting for the nested content.
    it("throws UnchangedContentMappingError if the mapper returns modified content that is not allowed because it loops", () => {
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

      const schema = { customize_toolbar: true, toolbar: ["h1"] };

      const options = {
        ...defaultOptions,
        nodeMapper: (node: any) => ({ ...node, type: "paragraph" }),
      };

      expect(() => sanitizeRichText(input, schema, options)).toThrow(
        UnchangedContentMappingError,
      );
    });

    it("throws 'Maximum call stack size exceeded' if the mapper has an infinite loop that changes the content", () => {
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

      const schema = { customize_toolbar: true, toolbar: ["paragraph"] };

      const options = {
        ...defaultOptions,
        nodeMapper: (node: any) => {
          if (node.type === "heading") {
            return {
              ...node,
              attrs: {
                // swapped heading levels, even though neither is allowed, will cause an infinite loop
                level: node.attrs.level === 1 ? 2 : 1,
              },
            };
          }
        },
      };

      expect(() => sanitizeRichText(input, schema, options)).toThrow(
        "Maximum call stack size exceeded",
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
        nodeMapper: (n: any) => ({ ...n, type: "foo" }),
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
        nodeMapper: (n: any) => [
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
        nodeMapper: turnNodeIntoParagraphOrRemove,
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

      const markMapper: MarkMapper = vi.fn().mockImplementation(() => ({
        type: "highlight",
        attrs: {
          color: "#9AE69D",
        },
      }));
      const options = {
        ...defaultOptions,
        markMapper,
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
      expect(markMapper).toHaveBeenCalledTimes(2);
      expect(markMapper).toHaveBeenCalledWith(input?.content[0]?.content[0], {
        type: "italic",
      });
      expect(markMapper).toHaveBeenCalledWith(input?.content[0]?.content[2], {
        type: "strike",
      });
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

      const attributeMapper: AttributeMapper = vi
        .fn()
        .mockImplementation(() => ["foo", "bar"]);
      const options = {
        ...defaultOptions,
        attributeMapper,
      };

      expect(sanitizeRichText(input, schema, options)).toStrictEqual(
        expectedOutput,
      );
      expect(attributeMapper).toHaveBeenCalledTimes(1);
      expect(attributeMapper).toHaveBeenCalledWith(
        input.content[0],
        "textAlign",
        "right",
      );
    });
  });
});

describe("sanitizeAttrs", () => {
  describe("textAlign", () => {
    it("removes if specific value not allowed", () => {
      expect(
        sanitizeAttrs(
          {},
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: [] },
          defaultOptions,
        ),
      ).toStrictEqual({
        level: 1,
      });

      expect(
        sanitizeAttrs(
          {},
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-center"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs(
          {},
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-right"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs(
          {},
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-justify"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1 });

      expect(
        sanitizeAttrs(
          {},
          { level: 1, textAlign: "left" },
          { customize_toolbar: true, toolbar: ["align-left"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1, textAlign: "left" });

      expect(
        sanitizeAttrs(
          {},
          { level: 1, textAlign: "center" },
          { customize_toolbar: true, toolbar: ["align-center"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1, textAlign: "center" });

      expect(
        sanitizeAttrs(
          {},
          { level: 1, textAlign: "right" },
          { customize_toolbar: true, toolbar: ["align-right"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1, textAlign: "right" });

      expect(
        sanitizeAttrs(
          {},
          { level: 1, textAlign: "justify" },
          { customize_toolbar: true, toolbar: ["align-justify"] },
          defaultOptions,
        ),
      ).toStrictEqual({ level: 1, textAlign: "justify" });
    });
  });
});
