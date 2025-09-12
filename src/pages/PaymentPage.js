import React, { useState } from "react";
import PageWrapper from "../pages/PageWrapper";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Paper,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import api from "../api"; // axios instance

const PaymentsPage = () => {
  const [invoiceId, setInvoiceId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("invoice_id", invoiceId);
    formData.append("payment_id", paymentId);
    formData.append("amount", amount);
    formData.append("paid_at", date);
    if (screenshot) {
        formData.append("screenshot", screenshot);
    }

    try {
        const response = await api.post("/payments/mark-payments/", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        });

        if (response.status === 201 || response.status === 200) {
        setPayments((prev) => [...prev, response.data]);
        alert("Payment submitted successfully!");
        setInvoiceId("");
        setPaymentId("");
        setAmount("");
        setDate("");
        setScreenshot(null);
        } else {
        alert("Error submitting payment.");
        }
    } catch (error) {
        console.error(error);
        alert("Something went wrong.");
    }
    };

  const handleView = (url) => window.open(url, "_blank");

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.invoice_id && p.invoice_id.toLowerCase().includes(q)) ||
      (p.payment_id && p.payment_id.toLowerCase().includes(q))
    );
  });

  return (
    <PageWrapper pageTitle="Payments">
      {/* Upload Payment Form */}
      <Paper elevation={4} sx={{ p: 3, mb: 4, maxWidth: "500px", mx: "auto", borderRadius: "12px" }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Mark a Payment
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Invoice ID"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Payment ID"
            value={paymentId}
            onChange={(e) => setPaymentId(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
          <Button variant="outlined" component="label">
            {screenshot ? screenshot.name : "Upload Screenshot"}
            <input type="file" hidden accept="image/*" onChange={(e) => setScreenshot(e.target.files[0])} />
          </Button>
          <Button variant="contained" type="submit">
            Submit Payment
          </Button>
        </Box>
      </Paper>

      {/* Payments List */}
      <TextField
        placeholder="Search payments..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 3 }}>
        {filteredPayments.map((p) => (
          <Card key={p.id}>
            <CardContent>
              <Typography>Invoice ID: {p.invoice_id}</Typography>
              <Typography>Payment ID: {p.payment_id}</Typography>
              <Typography>Amount: {p.amount}</Typography>
              <Typography>Paid Date: {p.paid_at}</Typography>
              {p.screenshot && (
                <Button onClick={() => handleView(p.screenshot)}>View Screenshot</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </PageWrapper>
  );
};

export default PaymentsPage;