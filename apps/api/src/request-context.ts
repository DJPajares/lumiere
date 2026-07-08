import type { MiddlewareHandler } from "hono";

export type ApiBindings = {
  Variables: {
    requestId: string;
  };
};

export const requestIdHeader = "x-request-id";

export const requestIdMiddleware = (): MiddlewareHandler<ApiBindings> => async (context, next) => {
  const incomingRequestId = context.req.header(requestIdHeader)?.trim();
  const requestId = incomingRequestId || crypto.randomUUID();

  context.set("requestId", requestId);
  context.header(requestIdHeader, requestId);

  await next();
};
