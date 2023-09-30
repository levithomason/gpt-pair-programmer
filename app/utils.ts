import debug from "debug";

export const classNames = (...args: any[]) => {
  return args.filter(Boolean).join(" ");
};

export const makeLogger = (name: string) => debug(`gpp:app:${name}`);
