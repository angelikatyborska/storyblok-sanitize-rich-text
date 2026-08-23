export type NodeMapper = (node: any) => null | undefined | any | any[];

export type MarkMapper = (
  node: any,
  mark: any,
) => null | undefined | any | any[];

export type AttributeMapper = (
  node: any,
  name: any,
  value: any,
) => null | [any, any] | [any, any][];

export const removeAllMarks: MarkMapper = () => null;
export const removeAllAttributes: AttributeMapper = () => null;
export const removeAllNodes: NodeMapper = () => null;

export const turnNodeIntoParagraphOrRemove: NodeMapper = (node) => {
  if (node && typeof node === "object" && "type" in node) {
    switch (node.type) {
      case "paragraph":
        return node;
      case "heading":
        return changeType(node, "paragraph");
      case "horizontal_rule":
        return null;
      case "image":
        return null;
      case "blockquote":
        return unwrap(node);
      case "bullet_list":
        return unwrap(node).flatMap(unwrap);
      case "ordered_list":
        return unwrap(node).flatMap(unwrap);
      case "code_block":
        return changeType(node, "paragraph");
      case "table":
        return unwrap(node).flatMap((c: any) => unwrap(c).flatMap(unwrap));
      case "tableHeader":
        return changeType(node, "tableCell");
    }
  }

  return null;
};

export const turnNodeIntoHeadingOrRemove: (
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6,
) => NodeMapper = (level) => (node) => {
  if (node && typeof node === "object" && "type" in node) {
    switch (node.type) {
      case "paragraph":
        return changeType(node, "heading", { level });
      case "heading":
        return changeType(node, "heading", { level });
      case "horizontal_rule":
        return null;
      case "image":
        return null;
      case "blockquote":
        return unwrap(node);
      case "bullet_list":
        return unwrap(node).flatMap(unwrap);
      case "ordered_list":
        return unwrap(node).flatMap(unwrap);
      case "code_block":
        return changeType(node, "heading", { level });
      case "table":
        return unwrap(node).flatMap((c: any) => unwrap(c).flatMap(unwrap));
      case "tableHeader":
        return changeType(node, "tableCell");
    }
  }

  return null;
};

const changeType = (node: any, type: string, attrs?: any) => {
  if (node && typeof node === "object" && "type" in node) {
    const newAttrs = node?.attrs ? { ...node.attrs, ...attrs } : attrs;
    return { ...node, type: type, ...(newAttrs ? { attrs: newAttrs } : {}) };
  } else {
    return node;
  }
};

const unwrap = (node: any) => {
  if (node && typeof node === "object" && "content" in node) {
    return node.content;
  } else {
    return node;
  }
};
