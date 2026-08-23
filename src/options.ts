import {
  type AttributeMapper,
  type NodeMapper,
  type MarkMapper,
  removeAllAttributes,
  removeAllNodes,
  removeAllMarks,
} from "./mappers.ts";

export type Options = {
  // There is no toolbar option for hard breaks, but it's useful to be able to disallow them.
  allowHardBreak: boolean;
  nodeMapper: NodeMapper;
  markMapper: MarkMapper;
  attributeMapper: AttributeMapper;
};

export const defaultOptions = {
  allowHardBreak: true,
  nodeMapper: removeAllNodes,
  markMapper: removeAllMarks,
  attributeMapper: removeAllAttributes,
};
