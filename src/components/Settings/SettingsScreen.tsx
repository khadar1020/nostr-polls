import { Box, IconButton, Tab, Tabs, Typography, useTheme } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RelaySettings } from "../Header/RelaySettings";
import { RelayAnalytics } from "../Header/RelayAnalytics";
import { AISettings } from "../Header/AISettings";
import { BlossomSettings } from "../Header/BlossomSettings";
import { ModerationSettings } from "../Header/ModerationSettings";
import { AppearanceSettings } from "../Header/AppearanceSettings";

export const SettingsScreen: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", px: 1, pt: 1 }}>
        <IconButton onClick={() => navigate(-1)} edge="start">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          Settings
        </Typography>
      </Box>

      <Tabs
        value={tabIndex}
        onChange={(_, newVal) => setTabIndex(newVal)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider", minHeight: 36 }}
      >
        <Tab label="Appearance" />
        <Tab label="Relay Settings" />
        <Tab label="Relay Analytics" />
        <Tab label="AI Settings" />
        <Tab label="Media" />
        <Tab label="Moderation" />
      </Tabs>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2 }}>
        {tabIndex === 0 && <AppearanceSettings />}
        {tabIndex === 1 && <RelaySettings />}
        {tabIndex === 2 && <RelayAnalytics />}
        {tabIndex === 3 && <AISettings />}
        {tabIndex === 4 && <BlossomSettings />}
        {tabIndex === 5 && <ModerationSettings />}
      </Box>
    </Box>
  );
};
