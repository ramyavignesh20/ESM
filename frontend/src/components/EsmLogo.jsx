import React from "react";
import { Box, Stack, Typography } from "@mui/material";

export default function EsmLogo({ variant = "user" }) {
  const admin = variant === "admin";

  return (
    <Stack className={`esm-logo esm-logo-${variant}`} direction="row" spacing={1.25} alignItems="center">
      <Box className="esm-logo-mark" aria-label={`${admin ? "Admin" : "User"} ESM logo`}>
        <span>E</span>
        <span>S</span>
        <span>M</span>
      </Box>
      <Box>
        <Typography className="esm-logo-title">ESM</Typography>
        <Typography className="esm-logo-subtitle">
          {admin ? "ADMIN CONSOLE" : "SCRUM WORKSPACE"}
        </Typography>
      </Box>
    </Stack>
  );
}
