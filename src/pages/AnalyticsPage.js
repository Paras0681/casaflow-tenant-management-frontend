// src/pages/AnalyticsPage.js
import React, { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableFooter,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
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
import api from "../api"
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import { useAuth } from "../context/AuthContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const AnalyticsPage = () => {
  const { user } = useAuth();
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

  // Build aggregated tenantsMap first (sums multiple entries per tenant/month)
  const tenantsMap = {};
  yearlyData.forEach((entry) => {
    // ensure numeric values and defensive keys
    const date = new Date(entry.created_at);
    const monthName = MONTHS[date.getMonth()] || MONTHS[0];
    const tenantName = entry.name || entry.tenant_name || "Unknown";

    if (!tenantsMap[tenantName]) tenantsMap[tenantName] = {};
    if (!tenantsMap[tenantName][monthName]) tenantsMap[tenantName][monthName] = { rent: 0, light: 0, other: 0 };

    tenantsMap[tenantName][monthName].rent += Number(entry.rent_amount || 0);
    tenantsMap[tenantName][monthName].light += Number(entry.lightbill_amount || 0);
    tenantsMap[tenantName][monthName].other += Number(entry.other_charges || 0);
  });

  // Convert tenantsMap to an array for rendering
  const tenantsData = Object.keys(tenantsMap).map((tenant) => ({
    tenant,
    months: tenantsMap[tenant],
  }));

  // Monthly totals (from aggregated tenantsMap) — used for the chart and totals rows
  const monthlyTotals = MONTHS.map(() => ({ rent: 0, light: 0, other: 0 }));

  Object.values(tenantsMap).forEach((tenantMonths) => {
    MONTHS.forEach((month, idx) => {
      const m = tenantMonths[month];
      if (m) {
        monthlyTotals[idx].rent += Number(m.rent || 0);
        monthlyTotals[idx].light += Number(m.light || 0);
        monthlyTotals[idx].other += Number(m.other || 0);
      }
    });
  });

  // Pie chart from backend (unchanged)
  const pieData = stats
    ? {
        labels: ["Not Paid", "Not Reviewed", "Paid", "Overdue"],
        datasets: [
          {
            data: [
              stats.piechart_data?.not_paid || 0,
              stats.piechart_data?.not_reviewed || 0,
              stats.piechart_data?.paid || 0,
              stats.piechart_data?.overdue || 0,
            ],
           backgroundColor: [
            "#9E9E9E", // Not Paid
            "#7a9fbc", // Not Reviewed
            "#243255", // Paid
            "#222928ff", // Overdue
          ],
          },
        ],
      }
    : null;

  // Bar chart uses monthlyTotals (aggregated)
  const barData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Rent",
        data: monthlyTotals.map((m) => m.rent),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        barPercentage: 0.9,
        categoryPercentage: 0.7,
      },
      {
        label: "Lightbill",
        data: monthlyTotals.map((m) => m.light),
        backgroundColor: "rgba(255, 206, 86, 0.8)",
        barPercentage: 0.9,
        categoryPercentage: 0.7,
      },
      {
        label: "Other",
        data: monthlyTotals.map((m) => m.other),
        backgroundColor: "rgba(75, 192, 192, 0.8)",
        barPercentage: 0.9,
        categoryPercentage: 0.7,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: false },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  // Utility for formatting currency
  const fmt = (v) => (typeof v === "number" ? `₹ ${v.toLocaleString()}` : "-");

  // Inside AnalyticsPage component
  const exportToExcel = () => {
    if (!tenantsData.length) return;

    // Build rows for Excel
    const rows = [];

    tenantsData.forEach((t) => {
      const rentRow = { Tenant: t.tenant, Type: "Rent" };
      const lightRow = { Tenant: t.tenant, Type: "Light Bill" };
      const otherRow = { Tenant: t.tenant, Type: "Other" };

      MONTHS.forEach((m) => {
        rentRow[m] = t.months[m]?.rent || "";
        lightRow[m] = t.months[m]?.light || "";
        otherRow[m] = t.months[m]?.other || "";
      });

      rows.push(rentRow, lightRow, otherRow);
    });

    // Add totals row
    const totalsRow = { Tenant: "Total", Type: "" };
    MONTHS.forEach((m, idx) => {
      totalsRow[m] = monthlyTotals[idx].rent + monthlyTotals[idx].light + monthlyTotals[idx].other;
    });
    rows.push(totalsRow);

    // Create workbook & worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tenant Revenue");

    // Write workbook and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Tenant_Revenue.xlsx");
  };


  return (
    <PageWrapper pageTitle="Analytics">
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Summary Cards - Only for Admin */}
          {user?.is_staff && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ p: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Revenue
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {fmt(stats?.card_data?.total_revenue || 0)}
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
                      {stats?.card_data?.active_tenants || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ p: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Not Paid Payment
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {fmt(stats?.card_data?.not_paid_invoice || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <Card sx={{ p: 2, boxShadow: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Not Reviewed Payment
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {fmt(stats?.card_data?.not_reviewed_invoice || 0)}
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
                      {stats?.card_data?.vacant_beds || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}


          {/* Charts */}
          <Grid container spacing={3} sx={{ mb: 3 }} alignItems="stretch">
            <Grid item xs={12} md={6} sx={{ display: "flex" }}>
              <Card sx={{ p: 2, boxShadow: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" gutterBottom>
                  INVOICE PAYMENT STATUS
                </Typography>
                <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                  {pieData && <Pie data={pieData} />}
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} sx={{ display: "flex" }}>
              <Card sx={{ p: 2, boxShadow: 3, height: "400px", display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" gutterBottom>
                  MONTHLY REVENUE SEGREGATION
                </Typography>
                  <Box sx={{ flexGrow: 1, width: "100%", minHeight: 300 }}>
                    {barData && <Bar data={barData} options={barOptions} />}
                  </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Tenant Revenue Table (Excel-like) */}
          <Card sx={{ p: 2, boxShadow: 3 }}>
            <Box sx={{ mb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Tenant Revenue (Current Year)
              </Typography>
              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadForOfflineIcon />}
                onClick={exportToExcel}
              >
                Download Excel
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ maxHeight: 520 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        border: "1px solid rgba(224, 224, 224, 1)",
                        backgroundColor: "#f3f6fb",
                        fontWeight: "bold",
                      }}
                    >
                      Tenant
                    </TableCell>
                    <TableCell
                      sx={{
                        border: "1px solid rgba(224, 224, 224, 1)",
                        backgroundColor: "#f3f6fb",
                        fontWeight: "bold",
                      }}
                    >
                      Type
                    </TableCell>
                    {MONTHS.map((month) => (
                      <TableCell
                        key={month}
                        align="right"
                        sx={{
                          border: "1px solid rgba(224, 224, 224, 1)",
                          backgroundColor: "#f3f6fb",
                          fontWeight: "bold",
                        }}
                      >
                        {month}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tenantsData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2 + MONTHS.length} align="center">
                        No data
                      </TableCell>
                    </TableRow>
                  )}

                  {tenantsData.map((t) => (
                    <React.Fragment key={t.tenant}>
                      <TableRow hover>
                        <TableCell
                          rowSpan={3}
                          sx={{ verticalAlign: "top", fontWeight: "bold", border: "1px solid rgba(224, 224, 224, 1)" }}
                        >
                          {t.tenant}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 400, border: "1px solid rgba(224, 224, 224, 1)" }}>Rent</TableCell>
                        {MONTHS.map((m) => (
                          <TableCell key={m} align="right" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                            {t.months[m]?.rent ? fmt(t.months[m].rent) : ""}
                          </TableCell>
                        ))}
                      </TableRow>

                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 400, border: "1px solid rgba(224, 224, 224, 1)" }}>Light Bill</TableCell>
                        {MONTHS.map((m) => (
                          <TableCell key={m} align="right" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                            {t.months[m]?.light ? fmt(t.months[m].light) : ""}
                          </TableCell>
                        ))}
                      </TableRow>

                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 400, border: "1px solid rgba(224, 224, 224, 1)" }}>Other</TableCell>
                        {MONTHS.map((m) => (
                          <TableCell key={m} align="right" sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}>
                            {t.months[m]?.other ? fmt(t.months[m].other) : ""}
                          </TableCell>
                        ))}
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow
                    sx={{
                      position: "sticky",
                      bottom: 0,
                      backgroundColor: "#e8f5e9",
                      // height: 40, // taller row
                    }}
                  >
                    <TableCell colSpan={2} sx={{ border: "1px solid rgba(224, 224, 224, 1)", fontWeight: "bold", fontSize: "0.9rem", py: 2 }}>
                      Total
                    </TableCell>
                    {MONTHS.map((m, mi) => (
                      <TableCell
                        key={m}
                        align="right"
                        sx={{ fontWeight: "bold", fontSize: "0.9rem", py: 2 , border: "1px solid rgba(224, 224, 224, 1)"}}
                      >
                        {fmt(monthlyTotals[mi].rent + monthlyTotals[mi].light + monthlyTotals[mi].other)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </PageWrapper>
  );
};

export default AnalyticsPage;
