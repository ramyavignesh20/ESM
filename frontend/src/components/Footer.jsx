import React from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  Divider,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: "#212121",
        color: "#ffffff",
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">

        {/* Top Footer Content */}
        <Box
          sx={{
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >

          {/* Application Name */}
          <Box>
            <Typography
              variant="h10"
              sx={{
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              Enterprise Scrum Management
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#bdbdbd",
                mt: 0.5,
              }}
            >
              Scrum Project Management Application
            </Typography>
          </Box>

          {/* Contact Details */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >

            {/* Email */}
            <Link
              href="mailto:ramya853144@gmail.com"
              underline="none"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#ffffff",
                "&:hover": {
                  color: "#e0e0e0",
                },
              }}
            >
              <EmailIcon fontSize="small" />
              <Typography variant="body2">
                ramya853144@gmail.com
              </Typography>
            </Link>

            {/* Phone */}
            <Link
              href="tel:+919876543210"
              underline="none"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#ffffff",
                "&:hover": {
                  color: "#e0e0e0",
                },
              }}
            >
              <PhoneIcon fontSize="small" />
              <Typography variant="body2">
                +91 98765 43210
              </Typography>
            </Link>

            {/* GitHub */}
            <Link
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#ffffff",
                "&:hover": {
                  color: "#e0e0e0",
                },
              }}
            >
              <GitHubIcon fontSize="small" />
              <Typography variant="body2">
                GitHub
              </Typography>
            </Link>

            {/* LinkedIn */}
            <Link
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "#ffffff",
                "&:hover": {
                  color: "#e0e0e0",
                },
              }}
            >
              <LinkedInIcon fontSize="small" />
              <Typography variant="body2">
                LinkedIn
              </Typography>
            </Link>

          </Stack>
        </Box>

        <Divider sx={{ borderColor: "#616161" }} />

        {/* Bottom Copyright */}
        <Box
          sx={{
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#bdbdbd" }}
          >
            © {new Date().getFullYear()} Enterprise Scrum Management
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "#bdbdbd" }}
          >
            Developed by Ramyavignesh
          </Typography>
        </Box>

      </Container>
    </Box>
  );
}