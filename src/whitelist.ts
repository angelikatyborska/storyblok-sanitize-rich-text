// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isContentWhitelisted(content: any, whitelist: string[]) {
  if (content && typeof content === "object" && "type" in content) {
    switch (content.type) {
      case "text":
        return true;
      case "paragraph":
        return whitelist.includes("paragraph");
      case "heading":
        return whitelist.includes(`h${content.attrs.level}`);
      case "horizontal_rule":
        return whitelist.includes("hrule");
      case "image":
        return whitelist.includes("image");
      case "blockquote":
        return whitelist.includes("quote");
      case "bullet_list":
        return whitelist.includes("list");
      case "ordered_list":
        return whitelist.includes("olist");
      case "code_block":
        return whitelist.includes("code");
      case "table":
        return whitelist.includes("add-table");
      case "tableHeader":
        // the rich text object does not differentiate between header columns, rows, or cells, it's all cells
        return (
          whitelist.includes("toggle-header-column") ||
          whitelist.includes("toggle-header-row") ||
          whitelist.includes("toggle-header-cell")
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mark: any,
  whitelist: string[],
) {
  if (mark && typeof mark === "object" && "type" in mark) {
    switch (mark.type) {
      case "bold":
        return whitelist.includes("bold");
      case "underline":
        return whitelist.includes("underline");
      case "textStyle":
        return whitelist.includes("textStyle");
      case "highlight":
        return whitelist.includes("highlight");
      case "strike":
        return whitelist.includes("strike");
      case "superscript":
        return whitelist.includes("superscript");
      case "subscript":
        return whitelist.includes("subscript");
      case "code":
        return whitelist.includes("inlinecode");
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attrValue: any,
  whitelist: string[],
) {
  switch (attrName) {
    case "textAlign":
      return whitelist.includes(`align-${attrValue}`);
    // is such a generic attr name really used only for cell-colors? hopefully, because this check is not aware of the context
    case "backgroundColor":
      return whitelist.includes("cell-color");
    case "colspan":
    case "rowspan":
      return attrValue > 1 ? whitelist.includes("merge-cells") : true;
    // allow all unknown attributes
    default:
      return true;
  }
}
