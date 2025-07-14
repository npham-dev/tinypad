export function notFound() {
  return new Response(null, {
    status: 404,
    statusText: "Not found",
  });
}

export function serverError() {
  return new Response(null, {
    status: 500,
    statusText: "Internal server error",
  });
}

export function standardResponse<T>(args: {
  message: string;
  success: boolean;
  data?: T;
}) {
  return new Response(JSON.stringify(args), {
    status: args.success ? 200 : 500,
  });
}
