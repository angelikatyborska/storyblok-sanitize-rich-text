import {
  type AttributeMapper,
  type ContentMapper,
  type MarkMapper,
  removeAllAttributes,
  removeAllContent,
  removeAllMarks,
} from "./mappers.ts";

export type Options = {
  // There is no toolbar option for hard breaks, but it's useful to be able to disallow them.
  allowHardBreak: boolean;
  contentMapper: ContentMapper;
  markMapper: MarkMapper;
  attributeMapper: AttributeMapper;
};

export const defaultOptions = {
  allowHardBreak: true,
  contentMapper: removeAllContent,
  markMapper: removeAllMarks,
  attributeMapper: removeAllAttributes,
};
