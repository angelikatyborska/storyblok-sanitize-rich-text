// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isContentWhitelisted(object: any, whitelist: string[]) {
  if (object && typeof object === "object" && "type" in object) {
    switch (object.type) {
      case "text":
        return true;
      case "paragraph":
        return whitelist.includes(`paragraph`);

      case "heading":
        return whitelist.includes(`h${object.attrs.level}`);

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
