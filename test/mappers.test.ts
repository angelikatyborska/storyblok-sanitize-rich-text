import { describe, it, expect } from "vitest";
import {
  removeAllMarks,
  removeAllAttributes,
  removeAllContent,
  turnContentIntoParagraphOrRemove,
  turnContentIntoHeadingOrRemove,
} from "../src/mappers.ts";

describe("mappers", () => {
  describe("removeAllMarks", () => {
    it("should return null", () => {
      const mark = { type: "bold" };
      expect(removeAllMarks({}, mark)).toBeNull();
    });
  });

  describe("removeAllAttributes", () => {
    it("should return null", () => {
      expect(removeAllAttributes({}, "level", 1)).toBeNull();
    });
  });

  describe("removeAllContent", () => {
    it("should return null", () => {
      const content = {
        type: "paragraph",
        content: [{ text: "Hello", type: "text" }],
      };
      expect(removeAllContent(content)).toBeNull();
    });
  });

  describe("turnContentToParagraphOrRemove", () => {
    it("should handle content without content property", () => {
      const input = { type: "hard_break" };
      expect(turnContentIntoParagraphOrRemove(input)).toBeNull();
    });

    it("should handle null input", () => {
      expect(turnContentIntoParagraphOrRemove(null)).toBeNull();
    });

    it("should handle non-object input", () => {
      expect(turnContentIntoParagraphOrRemove("text")).toBeNull();
    });

    describe("paragraph", () => {
      it("leaves unchanged", () => {
        const input = {
          type: "paragraph",
          content: [
            {
              text: "Lorem ipsum",
              type: "text",
            },
          ],
        };

        const expectedResult = input;

        expect(turnContentIntoParagraphOrRemove(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("heading", () => {
      it("turns to a paragraph", () => {
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

        const expectedResult = {
          type: "paragraph",
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

        expect(turnContentIntoParagraphOrRemove(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("horizontal_rule", () => {
      it("gets removed", () => {
        const input = {
          type: "horizontal_rule",
        };

        const expectedResult = null;

        expect(turnContentIntoParagraphOrRemove(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("image", () => {
      it("gets removed", () => {
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

        const expectedResult = null;

        expect(turnContentIntoParagraphOrRemove(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("blockquote", () => {
      it("unwraps content", () => {
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
                  text: "paragraph",
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
                          text: "one",
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
                          text: "two",
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

        const expectedResult = [...input.content];

        expect(turnContentIntoParagraphOrRemove(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("bullet_list", () => {
      it("unwraps content", () => {
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
                      text: "one",
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
                      text: "two",
                      type: "text",
                    },
                  ],
                },
              ],
            },
          ],
        };

        const expectedResult = [
          {
            type: "paragraph",
            attrs: {
              textAlign: null,
            },
            content: [
              {
                text: "one",
                type: "text",
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
                text: "two",
                type: "text",
              },
            ],
          },
        ];

        expect(turnContentIntoParagraphOrRemove(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("ordered_list", () => {
      it("unwraps content", () => {
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
                      text: "one",
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
                      text: "two",
                      type: "text",
                    },
                  ],
                },
              ],
            },
          ],
        };

        const expectedResult = [
          {
            type: "paragraph",
            attrs: {
              textAlign: null,
            },
            content: [
              {
                text: "one",
                type: "text",
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
                text: "two",
                type: "text",
              },
            ],
          },
        ];

        expect(turnContentIntoParagraphOrRemove(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("code_block", () => {
      it("turns to a paragraph", () => {
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

        const expectedResult = {
          type: "paragraph",
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

        expect(turnContentIntoParagraphOrRemove(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("table", () => {
      it("unwraps content", () => {
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
                          text: "name",
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
                          text: "planet of origin",
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
                          text: "Spock",
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
                          text: "Vulcan",
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

        const expectedResult = [
          {
            type: "paragraph",
            attrs: {
              textAlign: null,
            },
            content: [
              {
                text: "name",
                type: "text",
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
                text: "planet of origin",
                type: "text",
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
                text: "Spock",
                type: "text",
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
                text: "Vulcan",
                type: "text",
              },
            ],
          },
        ];

        expect(turnContentIntoParagraphOrRemove(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("tableHeader", () => {
      it("changes it to a table cell", () => {
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
                  text: "name",
                  type: "text",
                },
              ],
            },
          ],
        };

        const expectedResult = {
          type: "tableCell",
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
                  text: "name",
                  type: "text",
                },
              ],
            },
          ],
        };
        expect(turnContentIntoParagraphOrRemove(input)).toStrictEqual(
          expectedResult,
        );
      });
    });
  });

  describe("turnContentIntoHeadingOrRemove", () => {
    it("should handle content without content property", () => {
      const input = { type: "hard_break" };
      expect(turnContentIntoHeadingOrRemove(1)(input)).toBeNull();
    });

    it("should handle null input", () => {
      expect(turnContentIntoHeadingOrRemove(1)(null)).toBeNull();
    });

    it("should handle non-object input", () => {
      expect(turnContentIntoHeadingOrRemove(1)("text")).toBeNull();
    });

    describe("paragraph", () => {
      it("turns to a heading", () => {
        const input = {
          type: "paragraph",
          content: [
            {
              text: "Lorem impsum",
              type: "text",
            },
          ],
        };

        const expectedResult = {
          type: "heading",
          attrs: {
            level: 1,
          },
          content: [
            {
              text: "Lorem impsum",
              type: "text",
            },
          ],
        };

        expect(turnContentIntoHeadingOrRemove(1)(input)).toStrictEqual(
          expectedResult,
        );
      });

      it("uses specified heading level", () => {
        const input = {
          type: "paragraph",
          content: [
            {
              text: "Lorem impsum",
              type: "text",
            },
          ],
        };

        const expectedResult = {
          type: "heading",
          attrs: {
            level: 5,
          },
          content: [
            {
              text: "Lorem impsum",
              type: "text",
            },
          ],
        };

        expect(turnContentIntoHeadingOrRemove(5)(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("heading", () => {
      it("leaves unchanged in levels match", () => {
        const input = {
          type: "heading",
          attrs: {
            level: 1,
          },
          content: [
            {
              text: "Lorem ipsum",
              type: "text",
            },
          ],
        };

        const expectedResult = input;

        expect(turnContentIntoHeadingOrRemove(1)(input)).toStrictEqual(
          expectedResult,
        );
      });

      it("changes heading level", () => {
        const input = {
          type: "heading",
          attrs: {
            level: 3,
          },
          content: [
            {
              text: "Lorem ipsum",
              type: "text",
            },
          ],
        };

        const expectedResult = {
          type: "heading",
          attrs: {
            level: 1,
          },
          content: [
            {
              text: "Lorem ipsum",
              type: "text",
            },
          ],
        };

        expect(turnContentIntoHeadingOrRemove(1)(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("horizontal_rule", () => {
      it("gets removed", () => {
        const input = {
          type: "horizontal_rule",
        };

        const expectedResult = null;

        expect(turnContentIntoHeadingOrRemove(1)(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("image", () => {
      it("gets removed", () => {
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

        const expectedResult = null;

        expect(turnContentIntoHeadingOrRemove(1)(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("blockquote", () => {
      it("unwraps content", () => {
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
                  text: "paragraph",
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
                          text: "one",
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
                          text: "two",
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

        const expectedResult = [...input.content];

        expect(turnContentIntoHeadingOrRemove(1)(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("bullet_list", () => {
      it("unwraps content", () => {
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
                      text: "one",
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
                      text: "two",
                      type: "text",
                    },
                  ],
                },
              ],
            },
          ],
        };

        const expectedResult = [
          {
            type: "paragraph",
            attrs: {
              textAlign: null,
            },
            content: [
              {
                text: "one",
                type: "text",
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
                text: "two",
                type: "text",
              },
            ],
          },
        ];

        expect(turnContentIntoHeadingOrRemove(1)(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("ordered_list", () => {
      it("unwraps content", () => {
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
                      text: "one",
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
                      text: "two",
                      type: "text",
                    },
                  ],
                },
              ],
            },
          ],
        };

        const expectedResult = [
          {
            type: "paragraph",
            attrs: {
              textAlign: null,
            },
            content: [
              {
                text: "one",
                type: "text",
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
                text: "two",
                type: "text",
              },
            ],
          },
        ];

        expect(turnContentIntoHeadingOrRemove(1)(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("code_block", () => {
      it("turns to a heading", () => {
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

        const expectedResult = {
          type: "heading",
          attrs: {
            level: 1,
            class: "language-bash",
          },
          content: [
            {
              text: "console.log('hi')",
              type: "text",
            },
          ],
        };

        expect(turnContentIntoHeadingOrRemove(1)(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("table", () => {
      it("unwraps content", () => {
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
                          text: "name",
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
                          text: "planet of origin",
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
                          text: "Spock",
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
                          text: "Vulcan",
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

        const expectedResult = [
          {
            type: "paragraph",
            attrs: {
              textAlign: null,
            },
            content: [
              {
                text: "name",
                type: "text",
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
                text: "planet of origin",
                type: "text",
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
                text: "Spock",
                type: "text",
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
                text: "Vulcan",
                type: "text",
              },
            ],
          },
        ];

        expect(turnContentIntoHeadingOrRemove(1)(input)).toStrictEqual(
          expectedResult,
        );
      });
    });

    describe("tableHeader", () => {
      it("changes it to a table cell", () => {
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
                  text: "name",
                  type: "text",
                },
              ],
            },
          ],
        };

        const expectedResult = {
          type: "tableCell",
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
                  text: "name",
                  type: "text",
                },
              ],
            },
          ],
        };
        expect(turnContentIntoHeadingOrRemove(1)(input)).toStrictEqual(
          expectedResult,
        );
      });
    });
  });
});
