import { HTTPStatusCode } from "./enum";

export const responseAPI = (data: any, statusCode: HTTPStatusCode) => {
  return {
    statusCode,
    data,
  };
};
