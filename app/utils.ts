import debug from "debug";

export const classNames = (...args: any[]) => {
  return args.filter(Boolean).join(" ");
};

export const makeDebug = (name: string) => debug(`gpp:app:${name}`);

export const queryString = (obj: { [key: string]: any }) => {
  if (obj === null || typeof obj !== "object") return "";

  const keyValuePairs = Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  if (keyValuePairs.length === 0) return "";

  return `?${keyValuePairs}`;
};
