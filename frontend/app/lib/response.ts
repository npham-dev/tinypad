export enum StatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export function notFound() {
  return standardResponse({
    message: "Not found",
    status: StatusCode.NOT_FOUND,
  });
}

export function internalServerError() {
  return standardResponse({
    message: "Internal server error",
    status: StatusCode.INTERNAL_SERVER_ERROR,
  });
}

export function notAuthorized() {
  return standardResponse({
    message: "Unathorized",
    status: StatusCode.UNAUTHORIZED,
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

// @todo is standard response
