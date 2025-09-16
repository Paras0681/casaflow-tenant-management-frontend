import { Box, Typography, ListItemButton, ListItemIcon } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Logout } from "@mui/icons-material";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PageWrapper = ({ children, pageTitle }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const username = user?.email || "Bleh";
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
            <AccountCircleIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography fontWeight="medium">{username}</Typography>
          <ListItemButton>
            <ListItemIcon onClick={handleLogout}><Logout />Exit</ListItemIcon>
          </ListItemButton>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default PageWrapper;
