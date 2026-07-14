export type Options = {
  // There is no toolbar option for hard breaks, but it's useful to be able to disallow them.
  allowHardBreak: boolean;
};

export const defaultOptions = {
  allowHardBreak: true,
};
