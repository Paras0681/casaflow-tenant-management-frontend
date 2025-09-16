import React from "react";
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Dashboard, People, Analytics, CurrencyRupee, Logout } from "@mui/icons-material";
import PaymentsIcon from '@mui/icons-material/Payments';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../images/casaflow_logo.png";

const navItems = [
  { label: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { label: "Uploads/Invoice", icon: <CurrencyRupee />, path: "/bills" },
  { label: "Payments", icon: <PaymentsIcon />, path: "/payments" },
  { label: "Analytics", icon: <Analytics />, path: "/analytics" },
  { label: "Tenants", icon: <People />, path: "/tenants-profile" },
  { label: "Properties", icon: <MapsHomeWorkIcon />, path: "/properties" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        <Box
          component="img"
          src={logo}
          alt="Page Banner"
          sx={{ width: 90, height: "auto", mb: 3 }}
        />
      </Box>
      <List>
        {navItems.map(({ label, icon, path }) => {
          const selected = location.pathname === path;
          return (
            <ListItemButton
              key={path}
              onClick={() => handleNavigation(path)}
              sx={{
                bgcolor: selected ? "#253255" : "transparent",
                color: selected ? "#fff" : "#7A9FBC",
                '&:hover': {
                  bgcolor: "#253255",
                  color: "#fff",
                  '& .MuiListItemIcon-root': {
                    color: "#fff",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: selected ? "#fff" : "#7A9FBC",
                  minWidth: 36,
                }}
              >
                {icon}
              </ListItemIcon>
              <ListItemText primary={label} sx={{ '& span': { fontWeight: 600 } }} />
            </ListItemButton>
          );
        })}
        <ListItemButton
          onClick={handleLogout}
          sx={{
            mt: 4,
            bgcolor: "transparent",
            color: "#7A9FBC",
            '&:hover': {
              bgcolor: "#253255",
              color: "#fff",
              '& .MuiListItemIcon-root': {
                color: "#fff",
              },
            },
          }}
        >
          <ListItemIcon sx={{ color: "#7A9FBC", minWidth: 36 }}>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" sx={{ '& span': { fontWeight: 600 } }} />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default Sidebar;
