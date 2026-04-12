import React from "react";
import {
  Avatar,
  Badge,
  Box,
  Chip,
  Divider,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useUserContext } from "../../hooks/useUserContext";
import { ColorSchemeToggle } from "../ColorScheme";
import { styled } from "@mui/system";
import { LoginModal } from "../Login/LoginModal";
import { ContactsModal } from "./ContactsModal";
import { signerManager } from "../../singletons/Signer/SignerManager";
import { WarningAmber, Check, PersonAdd } from "@mui/icons-material";
import { ViewKeysModal } from "../User/ViewKeysModal";
import { useNavigate } from "react-router-dom";
import { nip19 } from "nostr-tools";
import { useRelayHealth } from "../../contexts/RelayHealthContext";
import WifiIcon from "@mui/icons-material/Wifi";

const ListItem = styled("li")(() => ({
  padding: "0 16px",
}));

export const UserMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showKeysModal, setShowKeysModal] = React.useState(false);
  const [showContactsModal, setShowContactsModal] = React.useState(false);
  const { user, accounts, switchAccount, removeAccount } = useUserContext();
  const navigate = useNavigate();
  const { connected, total, gossipConnected, gossipTotal } = useRelayHealth();

  const handleLogOut = async () => {
    setAnchorEl(null);
    await signerManager.logout();
  };

  const handleProfileClick = () => {
    if (user?.pubkey) {
      const npub = nip19.npubEncode(user.pubkey);
      navigate(`/profile/${npub}`);
      setAnchorEl(null);
    }
  };

  const handleContactsClick = () => {
    setShowContactsModal(true);
    setAnchorEl(null);
  };

  const handleSwitchAccount = async (pubkey: string) => {
    setAnchorEl(null);
    await switchAccount(pubkey);
  };

  const handleAddAccount = () => {
    setAnchorEl(null);
    setShowLoginModal(true);
  };

  return (
    <div style={{ marginLeft: 10 }}>
      <Tooltip
        title={user?.privateKey ? "Guest key stored insecurely in browser" : ""}
      >
        <Badge
          color="warning"
          variant="standard"
          invisible={!user?.privateKey}
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={<WarningAmber fontSize="small" />}
        >
          <Avatar
            src={user?.picture}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ cursor: "pointer" }}
          >
            {!user?.picture && user?.name?.[0]}
          </Avatar>
        </Badge>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {/* Relay health */}
        <ListItem key="relay-health">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
            <WifiIcon
              fontSize="small"
              color={
                connected === total && total > 0
                  ? "success"
                  : connected > 0
                  ? "warning"
                  : "error"
              }
            />
            <Box>
              <Tooltip title={`Own relays: ${connected}/${total} connected`}>
                <Chip
                  size="small"
                  label={total > 0 ? `${connected}/${total} own` : "no relays"}
                  color={
                    connected === total && total > 0
                      ? "success"
                      : connected > 0
                      ? "warning"
                      : "error"
                  }
                  variant="outlined"
                  sx={{ mr: 0.5 }}
                />
              </Tooltip>
              {gossipTotal > 0 && (
                <Tooltip
                  title={`Gossip relays: ${gossipConnected}/${gossipTotal} active`}
                >
                  <Chip
                    size="small"
                    label={`${gossipConnected}/${gossipTotal} gossip`}
                    color={gossipConnected > 0 ? "info" : "default"}
                    variant="outlined"
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
        </ListItem>

        <Divider />

        {user ? (
          <>
            {/* Account switcher — one row per stored account */}
            {accounts.map((account) => {
              const isActive = account.pubkey === user.pubkey;
              const displayName =
                account.userData?.name || account.pubkey.slice(0, 10) + "…";
              return (
                <MenuItem
                  key={account.pubkey}
                  onClick={() =>
                    isActive ? undefined : handleSwitchAccount(account.pubkey)
                  }
                  sx={{
                    gap: 1,
                    opacity: isActive ? 1 : 0.75,
                    cursor: isActive ? "default" : "pointer",
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 36 }}>
                    <Avatar
                      src={account.userData?.picture}
                      sx={{ width: 28, height: 28, fontSize: "0.8rem" }}
                    >
                      {!account.userData?.picture && displayName[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={isActive ? 700 : 400}>
                        {displayName}
                      </Typography>
                    }
                    secondary={
                      account.loginMethod !== "guest" ? (
                        <Typography variant="caption" color="text.secondary">
                          {account.loginMethod}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="warning.main">
                          guest
                        </Typography>
                      )
                    }
                  />
                  {isActive && (
                    <Check fontSize="small" sx={{ color: "primary.main", ml: 1 }} />
                  )}
                </MenuItem>
              );
            })}

            {/* Add account */}
            <MenuItem onClick={handleAddAccount} sx={{ gap: 1 }}>
              <ListItemAvatar sx={{ minWidth: 36 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "action.hover" }}>
                  <PersonAdd sx={{ fontSize: 16, color: "text.secondary" }} />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" color="text.secondary">
                    Add account
                  </Typography>
                }
              />
            </MenuItem>

            <Divider />

            {/* Active account actions */}
            <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
            <MenuItem onClick={handleContactsClick}>Contacts</MenuItem>
            {user?.privateKey && (
              <MenuItem
                onClick={() => {
                  setShowKeysModal(true);
                  setAnchorEl(null);
                }}
              >
                View Keys
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                navigate("/settings");
                setAnchorEl(null);
              }}
            >
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogOut}>Log Out</MenuItem>

            <ListItem key="color-scheme">
              <ColorSchemeToggle />
            </ListItem>

            {user?.privateKey && (
              <MenuItem
                onClick={async () => {
                  const confirmed = window.confirm(
                    "Are you sure you want to delete your keys? This action is irreversible.",
                  );
                  if (confirmed) {
                    setAnchorEl(null);
                    await removeAccount(user.pubkey);
                  }
                }}
                style={{ color: "red" }}
              >
                Delete Keys
              </MenuItem>
            )}
          </>
        ) : (
          <>
            <MenuItem onClick={() => setShowLoginModal(true)}>Log In</MenuItem>
            <ListItem key="color-scheme">
              <ColorSchemeToggle />
            </ListItem>
          </>
        )}
      </Menu>

      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <ViewKeysModal
        open={showKeysModal}
        onClose={() => setShowKeysModal(false)}
        pubkey={user?.pubkey || ""}
        privkey={user?.privateKey || ""}
      />
      <ContactsModal
        open={showContactsModal}
        onClose={() => setShowContactsModal(false)}
      />
    </div>
  );
};
