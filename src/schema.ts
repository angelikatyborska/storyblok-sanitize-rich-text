export interface RelevantRichTextFieldSchema {
  toolbar?: string[];
  rtl?: boolean;
  allow_target_blank?: boolean;
  allow_custom_attributes?: boolean;
  customize_toolbar?: boolean;
}

export function getRelevantRichTextSchema(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any,
): RelevantRichTextFieldSchema {
  const relevant: RelevantRichTextFieldSchema = {};
  if (schema && typeof schema === "object" && !Array.isArray(schema)) {
    if ("toolbar" in schema && Array.isArray(schema.toolbar)) {
      relevant.toolbar = schema.toolbar as string[];
    }

    if ("rtl" in schema) {
      relevant.rtl = schema.rtl as boolean;
    }

    if ("allow_target_blank" in schema) {
      relevant.allow_target_blank = schema.allow_target_blank as boolean;
    }

    if ("customize_toolbar" in schema) {
      relevant.customize_toolbar = schema.customize_toolbar as boolean;
    }

    if ("allow_custom_attributes" in schema) {
      relevant.allow_custom_attributes =
        schema.allow_custom_attributes as boolean;
    }
  }

  return relevant;
}
