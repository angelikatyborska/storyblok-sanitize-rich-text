// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isWhitelisted(object: any, whitelist: string[]) {
  if (object && typeof object === "object" && "type" in object) {
    switch (object.type) {
      case "text":
        return true;
      case "heading": {
        return whitelist.includes(`h${object.attrs.level}`);
      }
      default:
        return false;
    }
  } else {
    return true;
  }
}
