import { useNavigate, useParams } from "react-router-dom";
import PollResponseForm from "./PollResponseForm";
import { useEffect, useState } from "react";
import { Event } from "nostr-tools/lib/types/core";
import { useRelays } from "../../hooks/useRelays";
import { Box, Button, CircularProgress } from "@mui/material";
import { useNotification } from "../../contexts/notification-context";
import { NOTIFICATION_MESSAGES } from "../../constants/notifications";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { nostrRuntime } from "../../singletons";
import { nip19 } from "nostr-tools";
import { EventPointer } from "nostr-tools/lib/types/nip19";
import { defaultRelays } from "../../nostr";

export const PollResponse = () => {
  const { eventId: neventId } = useParams();
  const [pollEvent, setPollEvent] = useState<Event | undefined>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { relays } = useRelays();
  useEffect(() => {
    if (!neventId) return;
    fetchPollEvent(neventId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [neventId]);

  if (!neventId) return;

  const fetchPollEvent = async (neventId: string) => {
    const decoded = nip19.decode(neventId).data as EventPointer;
    const neventRelays = decoded.relays;
    const relaysToUse = Array.from(
      new Set([...relays, ...defaultRelays, ...(neventRelays || [])])
    );
    try {
      const event = await nostrRuntime.fetchBatched(relaysToUse, decoded.id);
      if (event === null) {
        // Navigate to the note page — it shows the event if found on gossip relays,
        // or a relay diagnostic screen so the user can see what was tried.
        navigate(`/note/${neventId}`, { replace: true });
        return;
      }
      setPollEvent(event);
    } catch (error) {
      console.error("Error fetching poll event:", error);
      showNotification(NOTIFICATION_MESSAGES.POLL_FETCH_ERROR, "error");
      navigate(`/note/${neventId}`, { replace: true });
    }
  };

  return (
    <Box sx={{ maxWidth: { xs: "100%", sm: 600 }, mx: "auto", p: 2 }}>
      <Button variant="outlined" onClick={() => navigate("/")} sx={{ m: 1 }}>
        <ArrowBackIcon />
        Back to Feed
      </Button>
      {pollEvent === undefined ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      ) : (
        <PollResponseForm pollEvent={pollEvent} />
      )}
    </Box>
  );
};
