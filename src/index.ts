import { isWhitelisted } from "./whitelist.ts";

export function sanitizeRichText<T>(object: T, whitelist: string[]): T {
  if (
    object &&
    typeof object === "object" &&
    "content" in object &&
    Array.isArray(object["content"])
  ) {
    return {
      ...object,
      content: object["content"]
        .map((child) => {
          if (child && typeof child === "object") {
            if (isWhitelisted(child, whitelist)) {
              return sanitizeRichText(child, whitelist);
            } else {
              return null;
            }
          } else {
            return child;
          }
        })
        .filter((child) => child !== null),
    };
  } else {
    return object;
  }
}
