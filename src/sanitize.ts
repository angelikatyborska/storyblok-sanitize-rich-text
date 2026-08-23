import {
  isAttrWhitelisted,
  isNodeWhitelisted,
  isMarkWhitelisted,
} from "./whitelist.ts";

import {
  getRelevantRichTextSchema,
  type RelevantRichTextFieldSchema,
} from "./schema.ts";
import { defaultOptions, type Options } from "./options.ts";

export function sanitizeRichText<T>(
  object: T,
  schema: any,
  options?: Partial<Options>,
): T {
  const relevantSchema = getRelevantRichTextSchema(schema);
  const mergedOptions = { ...defaultOptions, ...options };

  if (
    object &&
    typeof object === "object" &&
    "type" in object &&
    object["type"] === "doc" &&
    "content" in object &&
    Array.isArray(object["content"])
  ) {
    return {
      ...object,
      content: object.content
        .flatMap((child) =>
          doSanitizeRichText(child, relevantSchema, mergedOptions),
        )
        .filter((child: any) => !!child),
    };
  } else {
    return object;
  }
}

function doSanitizeRichText<T>(
  object: T,
  schema: RelevantRichTextFieldSchema,
  options: Options,
): T | null {
  if (!isNodeWhitelisted(object, schema, options)) {
    const objectStringBefore = JSON.stringify(object);
    let mappedObject = options.nodeMapper(object);
    const objectStringAfter = JSON.stringify(mappedObject);

    if (objectStringBefore === objectStringAfter) {
      throw new UnchangedContentMappingError(object);
    }

    if (mappedObject) {
      if (typeof mappedObject === "object" && Array.isArray(mappedObject)) {
        mappedObject = mappedObject.flatMap((innerChild) =>
          doSanitizeRichText(innerChild, schema, options),
        );
      } else {
        mappedObject = doSanitizeRichText(mappedObject, schema, options);
      }

      object = mappedObject;
    } else {
      return null;
    }
  }

  if (
    object &&
    typeof object === "object" &&
    "content" in object &&
    Array.isArray(object["content"])
  ) {
    object = {
      ...object,
      content: object["content"]
        .flatMap((child) => {
          if (child && typeof child === "object") {
            return doSanitizeRichText(child, schema, options);
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
      attrs: sanitizeAttrs(object["attrs"], schema, options),
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
        .flatMap((mark) => {
          if (mark && typeof mark === "object") {
            if (isMarkWhitelisted(mark, schema)) {
              return mark;
            } else {
              const newMark = options.markMapper(object, mark);
              if (newMark) {
                return newMark;
              } else {
                return null;
              }
            }
          } else {
            return mark;
          }
        })
        .filter((mark) => mark !== null && mark !== undefined),
    };
  }

  return object;
}

export function sanitizeAttrs<T extends Record<any, any>>(
  object: T,
  schema: RelevantRichTextFieldSchema,
  options: Options,
): T {
  return Object.keys(object).reduce(
    (acc, key) => {
      if (isAttrWhitelisted(key, acc[key], schema)) {
        return acc;
      } else {
        const newAttr = options.attributeMapper(object, key, acc[key]);
        delete acc[key];

        if (newAttr) {
          const newKey = newAttr[0] as keyof T;
          const newValue = newAttr[1] as T[keyof T];
          acc = { ...acc, [newKey]: newValue };
        }

        return acc;
      }
    },
    { ...object },
  );
}

export class UnchangedContentMappingError extends Error {
  constructor(content: any) {
    const message = `The following content was passed to the mapper function and returned unchanged. It might mean that the mapper returns content that is not allowed by the whitelist. This is not supported.\n${JSON.stringify(content, null, 2)}`;
    super(message);
    this.name = "UnchangedContentMappingError";
  }
}
