import React from "react";
import { Box } from "@mui/material";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "./Footer";

export default function MainLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >

      {/* Top Navbar */}
      <Navbar />

      <Box
        sx={{
          display: "flex",
          flex: 1,
        }}
      >

        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: 3,
          }}
        >
          {children}
        </Box>

      </Box>

      {/* Bottom Bar */}
      <Footer />

    </Box>
  );
}