export enum StatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export function notFound() {
  return new Response(null, {
    status: StatusCode.NOT_FOUND,
    statusText: "Not found",
  });
}

export function internalServerError() {
  return new Response(null, {
    status: StatusCode.INTERNAL_SERVER_ERROR,
    statusText: "Internal server error",
  });
}

export function notAuthorized() {
  return new Response(null, {
    status: StatusCode.UNAUTHORIZED,
    statusText: "Unathorized",
  });
}

export function standardResponse<T>(args: {
  message: string;
  data?: T;
  status?: StatusCode;
}) {
  return new Response(JSON.stringify(args), {
    status: args.status || StatusCode.OK,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export type StandardResponse<T = unknown> = {
  message: string;
  data?: T;
  status: StatusCode;
};
