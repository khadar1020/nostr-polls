import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useUserContext } from "../../hooks/useUserContext";
import { useAppContext } from "../../hooks/useAppContext";
import { useListContext } from "../../hooks/useListContext";
import { DEFAULT_IMAGE_URL } from "../../utils/constants";
import { nip19 } from "nostr-tools";
import { useNavigate } from "react-router-dom";
import { Nip05Badge } from "../Common/Nip05Badge";
import { useBackClose } from "../../hooks/useBackClose";

interface ContactsModalProps {
  open: boolean;
  onClose: () => void;
}

export const ContactsModal: React.FC<ContactsModalProps> = ({
  open,
  onClose,
}) => {
  const { user } = useUserContext();
  const { profiles, fetchUserProfileThrottled } = useAppContext();
  const { unfollowContact } = useListContext();
  const navigate = useNavigate();
  useBackClose(open, onClose);
  const [loading, setLoading] = useState(true);
  const [unfollowingPubkey, setUnfollowingPubkey] = useState<string | null>(null);

  useEffect(() => {
    if (open && user?.follows) {
      setLoading(true);
      user.follows.forEach((pubkey) => {
        if (!profiles?.has(pubkey)) {
          fetchUserProfileThrottled(pubkey);
        }
      });
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.follows]);

  const handleContactClick = (pubkey: string) => {
    const npub = nip19.npubEncode(pubkey);
    navigate(`/profile/${npub}`);
    onClose();
  };

  const handleUnfollow = async (pubkeyToRemove: string) => {
    setUnfollowingPubkey(pubkeyToRemove);
    try {
      await unfollowContact(pubkeyToRemove);
    } catch (error) {
      console.error("Failed to unfollow:", error);
    } finally {
      setUnfollowingPubkey(null);
    }
  };

  if (!user || !user.follows) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Contacts
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>Please log in to view your contacts.</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Contacts ({user.follows.length})
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : user.follows.length === 0 ? (
          <Typography>You don't follow anyone yet.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {user.follows.map((pubkey) => {
              const profile = profiles?.get(pubkey);
              const npub = nip19.npubEncode(pubkey);
              const displayName =
                profile?.name ||
                profile?.username ||
                profile?.nip05 ||
                `${npub.slice(0, 8)}...${npub.slice(-4)}`;

              return (
                <Card key={pubkey} variant="outlined">
                  <CardContent
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      py: 1.5,
                      "&:last-child": { pb: 1.5 },
                    }}
                  >
                    <Avatar
                      src={profile?.picture || DEFAULT_IMAGE_URL}
                      alt={displayName}
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleContactClick(pubkey)}
                    />
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        cursor: "pointer",
                      }}
                      onClick={() => handleContactClick(pubkey)}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {displayName}
                      </Typography>
                      {profile?.nip05 && (
                        <Nip05Badge nip05={profile.nip05} pubkey={pubkey} />
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      disabled={unfollowingPubkey === pubkey}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnfollow(pubkey);
                      }}
                    >
                      {unfollowingPubkey === pubkey ? "..." : "Unfollow"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
