export type ContentMapper = (content: any) => null | undefined | any | any[];
export type MarkMapper = (
  content: any,
  mark: any,
) => null | undefined | any | any[];
export type AttributeMapper = (
  content: any,
  name: any,
  value: any,
) => null | [any, any] | [any, any][];

export const removeAllMarks: MarkMapper = () => null;
export const removeAllAttributes: AttributeMapper = () => null;
export const removeAllContent: ContentMapper = () => null;

export const turnContentToParagraphOrRemove: ContentMapper = (content) => {
  if (content && typeof content === "object" && "type" in content) {
    switch (content.type) {
      case "heading":
        return changeType(content, "paragraph");
      case "horizontal_rule":
        return null;
      case "image":
        return null;
      case "blockquote":
        return unwrap(content);
      case "bullet_list":
        return unwrap(content).flatMap(unwrap);
      case "ordered_list":
        return unwrap(content).flatMap(unwrap);
      case "code_block":
        return changeType(content, "paragraph");
      case "table":
        return unwrap(content).flatMap((c: any) => unwrap(c).flatMap(unwrap));
      case "tableHeader":
        return changeType(content, "tableCell");
    }
  }

  return null;
};

const changeType = (content: any, type: string) => {
  if (content && typeof content === "object" && "type" in content) {
    return { ...content, type: type };
  } else {
    return content;
  }
};

const unwrap = (content: any) => {
  if (content && typeof content === "object" && "content" in content) {
    return content.content;
  } else {
    return content;
  }
};
