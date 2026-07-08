import type { MiddlewareHandler } from "hono";

import type { AuthenticatedManager } from "./auth";

export type ApiBindings = {
  Variables: {
    manager: AuthenticatedManager;
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
