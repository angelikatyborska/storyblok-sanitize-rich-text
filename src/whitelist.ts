import type { RelevantRichTextFieldSchema } from "./schema.ts";
import type { Options } from "./options.ts";

function shouldCheckToolbar(schema: RelevantRichTextFieldSchema) {
  return schema.customize_toolbar && Array.isArray(schema.toolbar);
}

export function isContentWhitelisted(
  content: any,
  schema: RelevantRichTextFieldSchema,
  options: Options,
) {
  if (content && typeof content === "object" && "type" in content) {
    switch (content.type) {
      case "text":
        return true;
      case "emoji":
        return !shouldCheckToolbar(schema) || schema.toolbar?.includes("emoji");
      case "hard_break":
        return options.allowHardBreak;
      case "paragraph":
        return (
          !shouldCheckToolbar(schema) || schema.toolbar?.includes("paragraph")
        );
      case "heading":
        return (
          !shouldCheckToolbar(schema) ||
          schema.toolbar?.includes(`h${content.attrs.level}`)
        );
      case "horizontal_rule":
        return !shouldCheckToolbar(schema) || schema.toolbar?.includes("hrule");
      case "image":
        return !shouldCheckToolbar(schema) || schema.toolbar?.includes("image");
      case "blockquote":
        return !shouldCheckToolbar(schema) || schema.toolbar?.includes("quote");
      case "bullet_list":
        return !shouldCheckToolbar(schema) || schema.toolbar?.includes("list");
      case "ordered_list":
        return !shouldCheckToolbar(schema) || schema.toolbar?.includes("olist");
      case "code_block":
        return !shouldCheckToolbar(schema) || schema.toolbar?.includes("code");
      case "table":
        return (
          !shouldCheckToolbar(schema) || schema.toolbar?.includes("add-table")
        );
      case "tableHeader":
        // the rich text object does not differentiate between header columns, rows, or cells, it's all cells
        return (
          !shouldCheckToolbar(schema) ||
          schema.toolbar?.includes("toggle-header-column") ||
          schema.toolbar?.includes("toggle-header-row") ||
          schema.toolbar?.includes("toggle-header-cell")
        );

      // allow all unknown blocks
      default:
        return true;
    }
  } else {
    return true;
  }
}

export function isMarkWhitelisted(
  mark: any,
  schema: RelevantRichTextFieldSchema,
) {
  if (mark && typeof mark === "object" && "type" in mark) {
    switch (mark.type) {
      case "bold":
        return !shouldCheckToolbar(schema) || schema.toolbar?.includes("bold");
      case "italic":
        return (
          !shouldCheckToolbar(schema) || schema.toolbar?.includes("italic")
        );
      case "underline":
        return (
          !shouldCheckToolbar(schema) || schema.toolbar?.includes("underline")
        );
      case "textStyle":
        return !shouldCheckToolbar(schema) || schema.toolbar?.includes("color");
      case "highlight":
        return (
          !shouldCheckToolbar(schema) || schema.toolbar?.includes("highlight")
        );
      case "strike":
        return (
          !shouldCheckToolbar(schema) || schema.toolbar?.includes("strike")
        );
      case "superscript":
        return (
          !shouldCheckToolbar(schema) || schema.toolbar?.includes("superscript")
        );
      case "subscript":
        return (
          !shouldCheckToolbar(schema) || schema.toolbar?.includes("subscript")
        );
      case "code":
        return (
          !shouldCheckToolbar(schema) || schema.toolbar?.includes("inlinecode")
        );
      case "link":
        return !shouldCheckToolbar(schema) || schema.toolbar?.includes("link");
      case "anchor":
        return (
          !shouldCheckToolbar(schema) || schema.toolbar?.includes("anchor")
        );
      case "styled":
        return (
          !!schema.style_options &&
          !!schema.style_options.find(
            (option) => option.value === mark.attrs?.class,
          )
        );
      // allow all unknown marks
      default:
        return true;
    }
  } else {
    return true;
  }
}

export function isAttrWhitelisted(
  attrName: string,
  attrValue: any,
  schema: RelevantRichTextFieldSchema,
) {
  switch (attrName) {
    case "textAlign":
      return (
        !shouldCheckToolbar(schema) ||
        schema.toolbar?.includes(`align-${attrValue}`)
      );
    // is such a generic attr name really used only for cell-colors? hopefully, because this check is not aware of the context
    case "backgroundColor":
      return (
        !shouldCheckToolbar(schema) || schema.toolbar?.includes("cell-color")
      );
    case "colspan":
    case "rowspan":
      return attrValue > 1
        ? !shouldCheckToolbar(schema) || schema.toolbar?.includes("merge-cells")
        : true;
    case "dir":
      // ltr or rtl
      return (
        (schema.rtl && !shouldCheckToolbar(schema)) ||
        schema.toolbar?.includes(attrValue)
      );
    case "target":
      return attrValue === "_blank" ? schema.allow_target_blank : true;
    case "custom":
      // custom attributes on links
      return schema.allow_custom_attributes;
    // allow all unknown attributes
    default:
      return true;
  }
}
