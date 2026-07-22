import type { ApiError, ApiErrorCode, ApiFieldError } from "@lumiere/types";

export const httpStatusByErrorCode = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  INVITE_EXPIRED: 410,
  INTERNAL_ERROR: 500,
} as const satisfies Record<ApiErrorCode, number>;

export type ApiHttpStatus = (typeof httpStatusByErrorCode)[ApiErrorCode];

export class ApiHttpError extends Error {
  readonly code: ApiErrorCode;
  readonly fields?: ApiFieldError[];
  readonly status: ApiHttpStatus;

  constructor(code: ApiErrorCode, message: string, options?: { fields?: ApiFieldError[] }) {
    super(message);
    this.name = "ApiHttpError";
    this.code = code;
    this.fields = options?.fields;
    this.status = httpStatusByErrorCode[code];
  }
}

export const createApiError = (
  code: ApiErrorCode,
  message: string,
  requestId: string,
  fields?: ApiFieldError[],
): ApiError => ({
  error: {
    code,
    message,
    requestId,
    ...(fields ? { fields } : {}),
  },
});
