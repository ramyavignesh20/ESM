import React from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";

export default function StatCard({ title, value, caption, icon }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={0.7}>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
            <Typography variant="h4" fontWeight={800}>{value}</Typography>
            {caption && <Typography variant="caption" color="text.secondary">{caption}</Typography>}
          </Stack>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );
}