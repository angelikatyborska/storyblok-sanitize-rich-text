import { describe, it, expect } from "vitest";
import { isAttrWhitelisted, isContentWhitelisted } from "../src/whitelist.ts";

describe("isContentWhitelisted", () => {
  describe("text", () => {
    it("always allowed", () => {
      const input = {
        text: "Lorem ipsum",
        type: "text",
      };

      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(true);
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
      expect(isContentWhitelisted(input, ["h2"])).toBe(false);
      expect(isContentWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });

  describe("paragraph", () => {
    it("has to match level", () => {
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
