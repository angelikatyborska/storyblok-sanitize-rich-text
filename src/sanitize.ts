import {
  isAttrWhitelisted,
  isContentWhitelisted,
  isMarkWhitelisted,
} from "./whitelist.ts";

import {
  getRelevantRichTextSchema,
  type RelevantRichTextFieldSchema,
} from "./schema.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeRichText<T>(object: T, schema: any): T {
  const relevantSchema = getRelevantRichTextSchema(schema);
  return doSanitizeRichText(object, relevantSchema);
}
function doSanitizeRichText<T>(
  object: T,
  schema: RelevantRichTextFieldSchema,
): T {
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
            if (isContentWhitelisted(child, schema)) {
              return doSanitizeRichText(child, schema);
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
      attrs: sanitizeAttrs(object["attrs"], schema),
    };
  }

  if (
    object &&
    typeof object === "object" &&
    "marks" in object &&
    object["marks"] &&
    Array.isArray(object["marks"])
  ) {
    object = {
      ...object,
      marks: object["marks"]
        .map((mark) => {
          if (mark && typeof mark === "object") {
            if (isMarkWhitelisted(mark, schema)) {
              return mark;
            } else {
              return null;
            }
          } else {
            return mark;
          }
        })
        .filter((mark) => mark !== null),
    };
  }

  return object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeAttrs<T extends Record<any, any>>(
  object: T,
  schema: RelevantRichTextFieldSchema,
): Partial<T> {
  return Object.keys(object).reduce(
    (acc, key) => {
      if (isAttrWhitelisted(key, acc[key], schema)) {
        return acc;
      } else {
        delete acc[key];
        return acc;
      }
    },
    { ...object },
  );
}
