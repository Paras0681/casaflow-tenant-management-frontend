import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

const PageWrapper = ({ children, pageTitle }) => {
  const { user } = useAuth();
  const username = user?.email || "Admin";

  return (
    <Box sx={{ display: "flex" }}>
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content */}
      <Box sx={{ flex: 1, bgcolor: "#f5f5f5", minHeight: "100vh", ml: "240px", pt: "64px", px: 4 }}>
        {/* Fixed Topbar */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: "240px",
            right: 0,
            height: "64px",
            bgcolor: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 4,
            boxShadow: 2,
            zIndex: 1000,
          }}
        >
          <Typography variant="h6" fontWeight="bold">{pageTitle}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src="https://i.pravatar.cc/40" alt={username} />
            <Typography fontWeight="medium">{username}</Typography>
          </Box>
        </Box>

        {/* Page content */}
        <Box sx={{ mt: 2 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default PageWrapper;
