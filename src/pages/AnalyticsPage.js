// src/pages/AnalyticsPage.js
import React, { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import api from "../api";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yearlyData, setYearlyData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [summaryRes, yearlyRes] = await Promise.all([
          api.get("/tenants/analytics-summary/"),
          api.get("/tenants/yearlydata/")
        ]);
        setStats(summaryRes.data);
        setYearlyData(yearlyRes.data);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Pie chart from backend
  const pieData = stats
    ? {
        labels: ["Paid", "Not Paid", "Overdue"],
        datasets: [
          {
            data: [
              stats.piechart_data.paid || 0,
              stats.piechart_data.not_paid || 0,
              stats.piechart_data.overdue || 0,
            ],
            backgroundColor: [
              "rgba(75, 192, 192, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(255, 99, 132, 0.6)",
            ],
          },
        ],
      }
    : null;

  // === Transform Yearly Data for Bar Chart ===
  const monthlyTotals = MONTHS.map((month) => ({
    rent: 0,
    light: 0,
    other: 0,
  }));

  yearlyData.forEach((entry) => {
    const date = new Date(entry.created_at);
    const monthIndex = date.getMonth(); // 0-11
    monthlyTotals[monthIndex].rent += entry.rent_amount;
    monthlyTotals[monthIndex].light += entry.lightbill_amount;
    monthlyTotals[monthIndex].other += entry.other_charges;
  });

  const barData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Rent",
        data: monthlyTotals.map((m) => m.rent),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Lightbill",
        data: monthlyTotals.map((m) => m.light),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
      {
        label: "Other",
        data: monthlyTotals.map((m) => m.other),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  // === Transform Yearly Data for Table ===
  const tenantsMap = {};
  yearlyData.forEach((entry) => {
    const date = new Date(entry.created_at);
    const monthName = MONTHS[date.getMonth()];

    if (!tenantsMap[entry.name]) {
      tenantsMap[entry.name] = {};
    }

    tenantsMap[entry.name][monthName] = {
      rent: entry.rent_amount,
      light: entry.lightbill_amount,
      other: entry.other_charges,
    };
  });

  const tenantsData = Object.keys(tenantsMap).map((tenant) => ({
    tenant,
    months: tenantsMap[tenant],
  }));

  return (
    <PageWrapper pageTitle="Analytics">
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ p: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ₹{stats?.card_data.total_revenue?.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ p: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Active Tenants
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats?.card_data.active_tenants}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ p: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pending Payments
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    ₹{stats?.card_data.pending_payments?.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={3}>
              <Card sx={{ p: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Vacant Beds
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {stats?.card_data.vacant_beds}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom>
                  INVOICE PAYMENT STATUS
                </Typography>
                {pieData && <Pie data={pieData} />}
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, boxShadow: 3 }}>
                <Typography variant="h6" gutterBottom>
                  MONTHLY REVENUE SEGREGATION
                </Typography>
                <Bar data={barData} />
              </Card>
            </Grid>
          </Grid>

          {/* Tenant Revenue Table */}
          <Card sx={{ p: 2, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom>
              User-wise Tenant Revenue (Current Year)
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tenant</strong></TableCell>
                    {MONTHS.map((month) => (
                      <TableCell key={month} align="center">
                        <strong>{month}</strong>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenantsData.map((tenant, index) => (
                    <TableRow key={index}>
                      <TableCell>{tenant.tenant}</TableCell>
                      {MONTHS.map((month) => (
                        <TableCell key={month} align="center">
                          {tenant.months[month] ? (
                            <>
                              Rent: ₹{tenant.months[month].rent}<br />
                              Light: ₹{tenant.months[month].light}<br />
                              Other: ₹{tenant.months[month].other}
                            </>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </PageWrapper>
  );
};

export default AnalyticsPage;
