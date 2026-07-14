import {
  isAttrWhitelisted,
  isContentWhitelisted,
  isMarkWhitelisted,
} from "./whitelist.ts";

import {
  getRelevantRichTextSchema,
  type RelevantRichTextFieldSchema,
} from "./schema.ts";
import { defaultOptions, type Options } from "./options.ts";

export function sanitizeRichText<T>(
  object: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any,
  options: Partial<Options>,
): T {
  const relevantSchema = getRelevantRichTextSchema(schema);
  const mergedOptions = { ...defaultOptions, ...options };
  return doSanitizeRichText(object, relevantSchema, mergedOptions);
}
function doSanitizeRichText<T>(
  object: T,
  schema: RelevantRichTextFieldSchema,
  options: Options,
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
            if (isContentWhitelisted(child, schema, options)) {
              return doSanitizeRichText(child, schema, options);
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
            if (isMarkWhitelisted(object, mark, schema)) {
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
