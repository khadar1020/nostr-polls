import { useNavigate, useParams } from "react-router-dom";
import { Filter } from "nostr-tools/lib/types/filter";
import { Event } from "nostr-tools/lib/types/core";
import { useRelays } from "../../hooks/useRelays";
import { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Analytics } from "./Analytics";
import { nostrRuntime } from "../../singletons";
import { useNotification } from "../../contexts/notification-context";
import { NOTIFICATION_MESSAGES } from "../../constants/notifications";

export const PollResults = () => {
  let { eventId } = useParams();
  const [pollEvent, setPollEvent] = useState<Event | undefined>();
  const [respones, setResponses] = useState<Event[] | undefined>();
  const [eoseReceived, setEoseReceived] = useState(false);
  const { showNotification } = useNotification();
  const { relays } = useRelays();
  const startedRef = useRef(false);
  let navigate = useNavigate();

  const getUniqueLatestEvents = (events: Event[]) => {
    const eventMap = new Map<string, any>();
    events.forEach((event) => {
      if (
        !eventMap.has(event.pubkey) ||
        event.created_at > eventMap.get(event.pubkey).created_at
      ) {
        eventMap.set(event.pubkey, event);
      }
    });
    return Array.from(eventMap.values());
  };

  const handleResultEvent = (event: Event) => {
    if (event.kind === 1068) {
      setPollEvent(event);
    }
    if (event.kind === 1070 || event.kind === 1018) {
      setResponses((prevResponses) => [...(prevResponses || []), event]);
    }
  };

  useEffect(() => {
    if (startedRef.current || !relays?.length) return;
    startedRef.current = true;

    if (!eventId) {
      showNotification(NOTIFICATION_MESSAGES.INVALID_URL, "error");
      navigate("/");
      return;
    }

    const resultFilter: Filter = { "#e": [eventId!], kinds: [1070, 1018] };
    const pollFilter: Filter = { ids: [eventId!] };

    // NIP-88: poll event contains ["relay", "wss://..."] tags specifying where
    // responses were published. Include those relays from the start if cached,
    // or add them via a secondary subscription when the poll event arrives.
    const cachedPoll = nostrRuntime.get(eventId);
    const pollRelays = cachedPoll?.tags
      .filter(t => t[0] === 'relay' && t[1]).map(t => t[1]) ?? [];
    const queryRelays = Array.from(new Set([...relays, ...pollRelays]));

    let extraUnsub: (() => void) | null = null;

    const closer = nostrRuntime.subscribe(queryRelays, [resultFilter, pollFilter], {
      onEvent: (event) => {
        handleResultEvent(event);
        // When the poll event arrives, subscribe for results on any relay tags
        // not already covered by queryRelays.
        if (event.kind === 1068) {
          const newRelays = event.tags
            .filter(t => t[0] === 'relay' && t[1] && !queryRelays.includes(t[1]))
            .map(t => t[1]);
          if (newRelays.length > 0) {
            const extra = nostrRuntime.subscribe(newRelays, [resultFilter], {
              onEvent: handleResultEvent,
            });
            extraUnsub = extra.unsubscribe;
          }
        }
      },
      onEose: () => setEoseReceived(true),
    });

    // Fallback: mark EOSE after 6s in case relays don't send one
    const fallback = setTimeout(() => setEoseReceived(true), 6000);

    return () => {
      closer.unsubscribe();
      extraUnsub?.();
      clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relays]);

  // Waiting for relays to be ready
  if (!relays?.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  // Poll event loaded (with or without EOSE): show Analytics with loading skeleton
  if (pollEvent) {
    return (
      <Analytics
        pollEvent={pollEvent}
        responses={getUniqueLatestEvents(respones || [])}
        loading={!eoseReceived}
      />
    );
  }

  // No poll event yet and EOSE not received: show a minimal loading state
  if (!eoseReceived) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return <Typography sx={{ p: 2 }}>Poll not found.</Typography>;
};
