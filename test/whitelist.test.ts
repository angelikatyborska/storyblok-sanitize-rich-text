import { describe, it, expect } from "vitest";
import { isWhitelisted } from "../src/whitelist.ts";

describe("isWhitelisted", () => {
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

      expect(isWhitelisted(input, ["h1"])).toBe(true);
      expect(isWhitelisted(input, ["h2"])).toBe(false);
      expect(isWhitelisted(input, ["ai-spelling"])).toBe(false);
    });
  });
});
