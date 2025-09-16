// src/pages/AnalyticsPage.js
import React from "react";
import PageWrapper from "../components/PageWrapper";
import { Grid, Card, CardContent, Typography } from "@mui/material";

const AnalyticsPage = () => {
  const stats = [
    { title: "Total Revenue", value: "₹3,45,000" },
    { title: "Active Tenants", value: 85 },
    { title: "Pending Payments", value: "₹45,000" },
    { title: "Vacant Properties", value: 12 },
  ];

  return (
    <PageWrapper pageTitle="Analytics">
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card sx={{ p: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">{stat.title}</Typography>
                <Typography variant="h5" fontWeight="bold">{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageWrapper>
  );
};

export default AnalyticsPage;
