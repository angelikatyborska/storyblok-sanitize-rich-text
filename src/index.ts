import { isAttrWhitelisted, isContentWhitelisted } from "./whitelist.ts";

export function sanitizeRichText<T>(object: T, whitelist: string[]): T {
  if (
    object &&
    typeof object === "object" &&
    "content" in object &&
    Array.isArray(object["content"])
  ) {
    object = {
      ...object,
      content: object["content"]
        .map((child) => {
          if (child && typeof child === "object") {
            if (isContentWhitelisted(child, whitelist)) {
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
  }

  if (
    object &&
    typeof object === "object" &&
    "attrs" in object &&
    object["attrs"] &&
    !Array.isArray(object["attrs"])
  ) {
    object = {
      ...object,
      attrs: sanitizeAttrs(object["attrs"], whitelist),
    };
  }

  return object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeAttrs<T extends Record<any, any>>(
  object: T,
  whitelist: string[],
): Partial<T> {
  return Object.keys(object).reduce(
    (acc, key) => {
      if (isAttrWhitelisted(key, acc[key], whitelist)) {
        return acc;
      } else {
        delete acc[key];
        return acc;
      }
    },
    { ...object },
  );
}
