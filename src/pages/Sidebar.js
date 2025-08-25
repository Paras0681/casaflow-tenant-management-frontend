import React from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Dashboard, People, Analytics, CurrencyRupee, Logout } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ width: 240, bgcolor: "white", height: "100vh", boxShadow: 2, position: "fixed" }}>
      <Box sx={{ p: 3, borderBottom: "1px solid #eee", textAlign: "center" }}>
        <Typography variant="h6" fontWeight="bold" color="primary">TenantMS</Typography>
      </Box>
      <List>
        <ListItemButton onClick={() => handleNavigation("/dashboard")}>
          <ListItemIcon><Dashboard /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton onClick={() => handleNavigation("/tenants-profile")}>
          <ListItemIcon><People /></ListItemIcon>
          <ListItemText primary="Tenants" />
        </ListItemButton>
        <ListItemButton onClick={() => handleNavigation("/bills")}>
          <ListItemIcon><CurrencyRupee /></ListItemIcon>
          <ListItemText primary="Bills" />
        </ListItemButton>
        <ListItemButton onClick={() => handleNavigation("/analytics")}>
          <ListItemIcon><Analytics /></ListItemIcon>
          <ListItemText primary="Analytics" />
        </ListItemButton>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default Sidebar;
