import React from "react";
import { Typography, Paper, Grid, Box } from "@mui/material";
import { People, Apartment, CurrencyRupee, Payment } from "@mui/icons-material";
import PageWrapper from "./PageWrapper";

// Stats data
const statsData = [
  {
    title: "Total Tenants",
    value: 120,
    icon: <People sx={{ fontSize: 40, color: "primary.main" }} />,
  },
  {
    title: "Active Leases",
    value: 85,
    icon: <Apartment sx={{ fontSize: 40, color: "success.main" }} />,
  },
  {
    title: "Pending Payments",
    value: "₹45,000",
    icon: <CurrencyRupee sx={{ fontSize: 40, color: "warning.main" }} />,
  },
  {
    title: "Vacant Properties",
    value: 12,
    icon: <Apartment sx={{ fontSize: 40, color: "error.main" }} />,
  },
];

// Recent activity data
const recentActivities = [
  { tenant: "John Doe", action: "Payment of ₹12,000", date: "Aug 20, 2025" },
  { tenant: "Priya Sharma", action: "Lease Agreement Signed", date: "Aug 18, 2025" },
  { tenant: "Amit Verma", action: "Moved Out", date: "Aug 15, 2025" },
  { tenant: "Rohit Patil", action: "Payment of ₹8,500", date: "Aug 14, 2025" },
];

const Dashboard = () => {
  return (
    <PageWrapper pageTitle="Dashboard">

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                borderRadius: 2,
                boxShadow: 3,
                bgcolor: "white",
                "&:hover": { transform: "scale(1.03)" },
                transition: "transform 0.2s",
              }}
            >
              {stat.icon}
              <Box>
                <Typography color="text.secondary" variant="body2">{stat.title}</Typography>
                <Typography fontWeight="bold" variant="h6">{stat.value}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity Cards */}
      <Typography variant="h6" fontWeight="bold" mb={2}>Recent Activity</Typography>
      <Grid container spacing={3}>
        {recentActivities.map((activity, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: 3,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                bgcolor: "white",
                "&:hover": { boxShadow: 6, transform: "translateY(-3px)" },
                transition: "all 0.2s",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Payment sx={{ fontSize: 30, color: "primary.main" }} />
                <Typography fontWeight="bold">{activity.tenant}</Typography>
              </Box>
              <Typography color="text.secondary">{activity.action}</Typography>
              <Typography variant="caption" color="text.secondary">{activity.date}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </PageWrapper>
  );
};

export default Dashboard;
