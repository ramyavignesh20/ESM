import React from "react";
import { Box, Stack, Typography } from "@mui/material";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Box className="page-header">
      <Box>
        <Typography variant="h4" fontWeight={800}>{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" mt={0.5}>{subtitle}</Typography>}
      </Box>
      {action && <Stack direction="row">{action}</Stack>}
    </Box>
  );
}