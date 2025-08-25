// src/pages/TenantsProfilePage.js
import React from "react";
import PageWrapper from "../pages/PageWrapper";
import { Grid, Card, CardContent, Typography, Avatar, Box } from "@mui/material";

const TenantsProfilePage = () => {
  const tenants = [
    { name: "John Doe", email: "john@example.com", phone: "9876543210", avatar: "https://i.pravatar.cc/40?img=1" },
    { name: "Priya Sharma", email: "priya@example.com", phone: "9123456780", avatar: "https://i.pravatar.cc/40?img=2" },
    { name: "Amit Verma", email: "amit@example.com", phone: "9988776655", avatar: "https://i.pravatar.cc/40?img=3" },
    { name: "Sneha Patil", email: "sneha@example.com", phone: "9871234560", avatar: "https://i.pravatar.cc/40?img=4" },
  ];

  return (
    <PageWrapper pageTitle="Tenants">
      <Grid container spacing={3}>
        {tenants.map((tenant, index) => (
          <Grid item xs={12} md={6} lg={3} key={index}>
            <Card sx={{ p: 2, boxShadow: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <Avatar src={tenant.avatar} alt={tenant.name} />
                  <Typography variant="h6" fontWeight="bold">{tenant.name}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">{tenant.email}</Typography>
                <Typography variant="body2" color="text.secondary">{tenant.phone}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageWrapper>
  );
};

export default TenantsProfilePage;
