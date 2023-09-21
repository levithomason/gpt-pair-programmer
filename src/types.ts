export type OpenAPISpec = {
  openapi: string;
  info: {
    title: string;
    description?: string;
    termsOfService?: string;
    version: string;
  };
  servers?: {
    url: string;
  }[];
  paths: {
    [path: string]: {
      [method: string]: object;
    };
  };
};
