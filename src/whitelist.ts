// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isContentWhitelisted(object: any, whitelist: string[]) {
  if (object && typeof object === "object" && "type" in object) {
    switch (object.type) {
      case "text":
        return true;
      case "paragraph":
        return whitelist.includes("paragraph");
      case "heading":
        return whitelist.includes(`h${object.attrs.level}`);
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

      // allow all unknown blocks
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
    case "textAlign": {
      return whitelist.includes(`align-${attrValue}`);
    }
    // allow all unknown attributes
    default:
      return true;
  }
}
