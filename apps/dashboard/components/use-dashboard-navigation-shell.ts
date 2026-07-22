"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useDashboardAuth } from "../auth/dashboard-auth-provider";
import type { DashboardEventSwitcherState } from "./dashboard-event-switcher";
import { getDashboardNavigation } from "./dashboard-navigation";

export function useDashboardNavigationShell(activePath: string) {
  const router = useRouter();
  const { apiClient, status } = useDashboardAuth();
  const navigation = useMemo(() => getDashboardNavigation(activePath), [activePath]);
  const [eventListState, setEventListState] = useState<DashboardEventSwitcherState>({
    error: null,
    events: [],
    status: "idle",
  });
  const [eventListRevision, setEventListRevision] = useState(0);

  useEffect(() => {
    if (status !== "authenticated" || !apiClient) {
      setEventListState({ error: null, events: [], status: "idle" });
      return;
    }

    let isMounted = true;
    setEventListState((current) => ({ ...current, error: null, status: "loading" }));

    apiClient
      .listEvents()
      .then(({ events }) => {
        if (isMounted) {
          setEventListState({ error: null, events, status: "ready" });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setEventListState({
            error: error instanceof Error ? error.message : "Unable to load your events.",
            events: [],
            status: "error",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiClient, eventListRevision, status]);

  const currentEvent = eventListState.events.find(
    (event) => event.id === navigation.context.eventId,
  );

  useEffect(() => {
    if (
      eventListState.status !== "ready" ||
      !navigation.context.eventId ||
      currentEvent
    ) {
      return;
    }

    router.replace("/");
  }, [currentEvent, eventListState.status, navigation.context.eventId, router]);

  const retryEventList = useCallback(() => {
    setEventListRevision((revision) => revision + 1);
  }, []);

  return {
    currentEvent,
    eventListState,
    navigation,
    retryEventList,
  };
}
