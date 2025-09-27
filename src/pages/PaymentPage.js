import React, { useState, useEffect } from "react";
import PageWrapper from "../components/PageWrapper";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getApi } from "../api";
import FormComponent from "../components/FormComponent";

// Define payment form fields
const paymentFormConfig = [
  { name: "invoice_id", label: "Invoice ID", type: "text", required: true },
  { name: "payment_id", label: "Payment ID", type: "text", required: true },
  { name: "payment_utr", label: "Payment UTR", type: "text", required: true },
  { name: "amount", label: "Amount", type: "number", required: true },
  { name: "paid_at", label: "Date", type: "date", required: true },
  {
    name: "screenshot",
    label: "Payment Screenshot",
    type: "file",
    required: true,
    allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
    sizeRangeKB: [30, 100],
  },
];

const initialFormValues = {
  invoice_id: "",
  payment_id: "",
  payment_utr: "",
  amount: "",
  paid_at: "",
  screenshot: null,
};

const ITEMS_PER_PAGE = 10;

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formValues, setFormValues] = useState(initialFormValues);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const api = await getApi();
        const response = await api.get("/payments/get-payments");
        if (response.status === 200) {
          setPayments(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      }
    };
    fetchPayments();
  }, []);

  const handlePaymentSuccess = (newPayment) => {
    setPayments((prev) => [...prev, newPayment]);
    setFormValues(initialFormValues);
    setCurrentPage(1);
  };

  const handleView = (url) => window.open(url, "_blank");

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.invoice_id && p.invoice_id.toLowerCase().includes(q)) ||
      (p.payment_id && p.payment_id.toLowerCase().includes(q)) ||
      (p.payment_utr && p.payment_utr.toLowerCase().includes(q))
    );
  });

  const pageCount = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <PageWrapper pageTitle="Payments">
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", md: "row" },
            alignItems: "flex-start", // prevents stretch
          }}
        >

        {/* Left side: Form */}
        <Box sx={{ flex: "1 1 40%" }}>
          <Paper elevation={4} sx={{ p: 3, borderRadius: "12px" }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Mark a Payment
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Please read before uploading:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <b>• Paste the correct Invoice ID from invoice PDF.</b>
                <br />
                <b>• Payment UTR is the 12 digit code in successful transaction.</b>
                <br />
                • Only JPG, PNG, PDF files are allowed.
                <br />
                • File size must be between <b>50KB and 100KB</b>.
                <br />
                • Ensure the document is clear and not blurry.
              </Typography>
            </Alert>

            <FormComponent
              formConfig={paymentFormConfig}
              apiUrl="/payments/mark-payments/"
              formValues={formValues}
              setFormValues={setFormValues}
              submitLabel="Submit Payment"
              onSuccess={handlePaymentSuccess}
            />
          </Paper>
        </Box>

        {/* Right side: Search bar, pagination, and table */}
        <Box sx={{ flex: "1 1 60%" }}>
          <TextField
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {pageCount > 1 && (
            <Pagination
              count={pageCount}
              page={currentPage}
              onChange={handlePageChange}
              sx={{ mb: 2, display: "flex", justifyContent: "center" }}
            />
          )}

          <Box sx={{ overflowX: "auto" }}>
            <TableContainer component={Paper}>
              <Table aria-label="payments table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice ID</TableCell>
                    <TableCell>Payment ID</TableCell>
                    <TableCell>Payment UTR</TableCell>
                    <TableCell>Uploaded By</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Paid Date</TableCell>
                    <TableCell>Screenshot</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPayments.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.invoice_id}</TableCell>
                      <TableCell>{p.payment_id}</TableCell>
                      <TableCell>{p.payment_utr}</TableCell>
                      <TableCell>{p.uploaded_by}</TableCell>
                      <TableCell>₹{p.amount}</TableCell>
                      <TableCell>{p.paid_at}</TableCell>
                      <TableCell>
                        {p.payment_receipt_url ? (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleView(p.payment_receipt_url)}
                          >
                            View
                          </Button>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default PaymentsPage;
