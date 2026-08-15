import { ApiClientError } from "@lumiere/api-client";

export function toFriendlyApiMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.apiError.error.message;
  }

  return error instanceof Error ? error.message : "Unable to complete the guest group request.";
}
