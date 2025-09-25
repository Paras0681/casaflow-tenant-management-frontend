import React, { useState, useEffect } from "react";
import {
    Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Pagination,
  Button
} from "@mui/material";
import { IconButton, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import SearchIcon from "@mui/icons-material/Search";
import PageWrapper from "../components/PageWrapper.js";
import DisplayCard from "../components/DisplayCard.js";
import FormComponent from "../components/FormComponent.js";

import api from "../api";
import { useAuth } from "../context/AuthContext";


const TimeDisplay = ({ isoString }) => {
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  return (
    <span>
      {`${day}-${month}-${year} ${hours}:${minutes}${ampm}`}
    </span>
  );
};

const ITEMS_PER_PAGE = 10;

const GenerateBillPage = () => {
  const iconAnimation = {
    "@keyframes pop": {
      "0%": { transform: "scale(0.5)", opacity: 0 },
      "80%": { transform: "scale(1.1)", opacity: 1 },
      "100%": { transform: "scale(1)", opacity: 1 },
    },
    animation: "pop 0.5s ease",
  };


  const { user } = useAuth();
  const [tabIndex, setTabIndex] = useState(0);

  // Bills state
  const [uploadedBills, setUploadedBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roomsList, setRoomsList] = useState([]);

  // Receipts state
  const [uploadedReceipts, setUploadedReceipts] = useState([]);
  const [searchReceipt, setSearchReceipt] = useState("");

  // Pagination states
  const [billsPage, setBillsPage] = useState(1);
  const [receiptsPage, setReceiptsPage] = useState(1);

  // Controlled form state
  const [formValues, setFormValues] = useState({
    room_number: "",
    file_type: "",
    unit_reading: "",
    description: "",
    file_url: null,
    rent_amount: "",
    lightbill_amount: "",
    other_charges: "",
    total_amount: "",
    per_tenant_share: "",
    bill_date: "",
  });

  // Material UI modal alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [statusDialog, setStatusDialog] = useState({
  open: false,
  type: "", // "success" | "error"
  message: "",
});


  useEffect(() => {
    const rentVal = parseFloat(formValues.rent_amount) || 0;
    const lightVal = parseFloat(formValues.lightbill_amount) || 0;
    const otherVal = parseFloat(formValues.other_charges) || 0;
    const totalVal = rentVal + lightVal + otherVal;

    let perPersonVal = 0;
    if (formValues.room_number) {
      const selectedRoom = roomsList.find((room) => room.room === formValues.room_number);
      if (selectedRoom && selectedRoom.occupants > 0) {
        perPersonVal = totalVal / selectedRoom.occupants;
      }
    }

    setFormValues((prev) => ({
      ...prev,
      total_amount: totalVal,
      per_tenant_share: perPersonVal,
    }));
  }, [formValues.rent_amount, formValues.lightbill_amount, formValues.other_charges, formValues.room_number, roomsList]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await api.get("/tenants/files/");
        setUploadedBills(response.data);
      } catch (error) {
        console.error("Error fetching bills:", error);
      }
    };
    fetchBills();
  }, []);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await api.get("/tenants/invoice/");
        setUploadedReceipts(response.data || []);
        const get_rooms_list = await api.get("/tenants/rooms/");
        const rooms = get_rooms_list.data.map((r) => ({
          room: r.room_number,
          occupants: r.active_tenants || 1,
      }));
      setRoomsList(rooms);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    };
    fetchReceipts();
  }, []);

  const billFormConfig = [
    {
      name: "room_number",
      label: "Room Number",
      type: "select",
      required: true,
      options: roomsList.map((r) => ({ value: r.room, label: r.room })),
    },
    {
      name: "file_type",
      label: "Bill Type",
      type: "select",
      required: true,
      options: [
        { value: "meter_reading", label: "Light Meter Reading" },
        { value: "light_bill", label: "Light Bill" },
        { value: "maintenance", label: "Maintenance Bill" },
        { value: "id_proof", label: "ID Proof" },
        { value: "driving_license", label: "Driving License" },
        { value: "aadhar_card", label: "Aadhar Card" },
        { value: "pan_card", label: "Lease Agreement" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "unit_reading",
      label: "Unit Reading (optional)",
      type: "number",
    },
    {
      name: "description",
      label: "Description (optional)",
      type: "text",
      multiline: true,
      rows: 2,
    },
    {
      name: "file_url",
      label: "Choose File",
      type: "file",
      required: true,
      allowedTypes: ["application/pdf", "image/jpeg", "image/png"],
      sizeRangeKB: [50, 100],
    },
  ];

  const receiptFormConfig = [
    {
      name: "room_number",
      label: "Select Room",
      type: "select",
      required: true,
      options: roomsList.map((r) => ({ value: r.room, label: r.room })),
    },
    { name: "rent_amount", label: "Rent Amount", type: "number", required: true },
    { name: "lightbill_amount", label: "Light Bill Amount", type: "number" },
    { name: "other_charges", label: "Other Amount", type: "number" },
    {
      name: "total_amount",
      label: "Total Amount",
      type: "number",
      disabled: true,
      defaultValue: formValues.total_amount,
    },
    {
      name: "per_tenant_share",
      label: "Per Person Share",
      type: "number",
      disabled: true,
      defaultValue: formValues.per_tenant_share,
    },
    {
      name: "bill_date",
      label: "Invoice Date",
      type: "date",
      required: true,
      defaultValue: formValues.bill_date,
    },
  ];

  const filteredBills = uploadedBills.filter((bill) => {
    const q = searchQuery.toLowerCase();
    return (
      bill.file_type?.toLowerCase().includes(q) ||
      (bill.room_number && String(bill.room_number).includes(q))
    );
  });

  const filteredReceipts = uploadedReceipts.filter((r) => {
    const q = searchReceipt.toLowerCase();
    return (
      (r.payment_status && r.payment_status.toLowerCase().includes(q)) ||
      (r.invoice_id && r.invoice_id.toLowerCase().includes(q))
    );
  });

  const billsPageCount = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
  const receiptsPageCount = Math.ceil(filteredReceipts.length / ITEMS_PER_PAGE);

  const paginatedBills = filteredBills.slice(
    (billsPage - 1) * ITEMS_PER_PAGE,
    billsPage * ITEMS_PER_PAGE
  );

  const paginatedReceipts = filteredReceipts.slice(
    (receiptsPage - 1) * ITEMS_PER_PAGE,
    receiptsPage * ITEMS_PER_PAGE
  );

const handleMarkPaid = async (invoice) => {
  try {
    const response = await api.post("/tenants/mark-invoice/", {
      invoice_id: invoice.invoice_id,
    });
    if (response.status === 200) {
       invoice.payment_status = "paid";
      setStatusDialog({
        open: true,
        type: "success",
        message: "Payment marked as paid successfully!",
      });
    }
  } catch (error) {
    setStatusDialog({
      open: true,
      type: "error",
      message: error.response?.data?.error || "Something went wrong!",
    });
  }
};





  return (
    <PageWrapper pageTitle="Uploads">
      <Box sx={{ width: "100%", boxSizing: "border-box" }}>
        <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)} sx={{ mb: 3 }}>
          <Tab label="Uploads" />
          <Tab label="Invoices" />
        </Tabs>

        {tabIndex === 0 && (
          <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start" }}>
            {/* Left: Upload Form */}
            <Box sx={{ flex: "1 1 40%", maxWidth: 400 }}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Upload files here
                </Typography>
                <Alert sx={{ mb: 2 }} severity="info">
                  <Typography variant="subtitle2" fontWeight="bold">
                    Please read before uploading:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    • Only JPG, PNG, PDF files are allowed.
                    <br />
                    • File size must be between <b>50KB and 100KB</b>.
                    <br />
                    • Ensure the document is clear and not blurry.
                  </Typography>
                </Alert>

                <FormComponent
                  formConfig={billFormConfig}
                  apiUrl="/tenants/files/upload/"
                  formValues={formValues}
                  setFormValues={setFormValues}
                  onSuccess={(data) => {
                    setUploadedBills((prev) => [data, ...prev]);
                    setBillsPage(1);
                  }}
                  onError={(err) => console.error(err)}
                  submitLabel="Upload"
                />
              </Paper>
            </Box>

            {/* Right: Search + Cards */}
            <Box sx={{ flex: "1 1 60%" }}>
              <TextField
                placeholder="Search file by File category/ Room no."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 3 }}>
                {paginatedBills.map((bill) => (
                  <DisplayCard
                    key={bill.id}
                    file={bill}
                    fields={[
                      { key: "uploaded_at", label: "Time", fn: (v) => <TimeDisplay isoString={v} /> },
                      { key: "description", label: "Description" },
                    ]}
                  />
                ))}
              </Box>

              {billsPageCount > 1 && (
                <Pagination
                  count={billsPageCount}
                  page={billsPage}
                  onChange={(e, v) => setBillsPage(v)}
                  sx={{ mt: 3, display: "flex", justifyContent: "center" }}
                />
              )}
            </Box>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start" }}>
            {/* Left: Invoice Form */}
            <Box sx={{ flex: "1 1 40%", maxWidth: 400 }}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Generate Invoice PDF's
                </Typography>

                <FormComponent
                  formConfig={receiptFormConfig}
                  apiUrl="/tenants/invoice/generate/"
                  formValues={formValues}
                  setFormValues={setFormValues}
                  onSuccess={(data) => {
                    setUploadedReceipts((prev) => [...data, ...prev]);
                    setReceiptsPage(1);
                  }}
                  onError={(err) => console.error(err)}
                  submitLabel="Generate Invoices"
                />
              </Paper>
            </Box>

            {/* Right: Search + Receipts */}
            <Box sx={{ flex: "1 1 60%" }}>
              <TextField
                placeholder="Search invoices by Invoice ID/ Payment status"
                value={searchReceipt}
                onChange={(e) => setSearchReceipt(e.target.value)}
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

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 3,
                px: 2,
              }}
            >
              {paginatedReceipts.map((r) => (
              <DisplayCard
                key={r.id}
                file={{ ...r, file_url: r.invoice_url }}
                fields={[
                  { key: "first_name", label: "Name" },
                  { key: "invoice_id", label: "Invoice Id" },
                  { key: "payment_status", label: "Payment Status", fn: (v) => v?.toUpperCase() },
                  { key: "per_tenant_share", label: "Amount" },
                  { key: "created_at", label: "Created At", fn: (v) => {
                      const date = new Date(v);
                      const day = String(date.getDate()).padStart(2, "0");
                      const month = String(date.getMonth() + 1).padStart(2, "0");
                      const year = date.getFullYear();
                      return `${day}-${month}-${year}`;
                  }},
                ]}
                actions={
                  <>
                    {/* View Invoice */}
                    <Tooltip title="View Invoice">
                      <IconButton
                        size="small"
                        onClick={() => window.open(r.invoice_url, "_blank")}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        r.payment_status === "paid"
                          ? "Already Paid"
                          : "Mark as Paid"
                      }
                    >
                      <IconButton
                        size="small"
                        disabled={r.payment_status === "paid"} // disable when already paid
                        onClick={() =>
                          r.payment_status !== "paid" && user?.is_staff && handleMarkPaid(r)
                        }
                      >
                        {r.payment_status === "not_paid" ? (
                          <HighlightOffIcon fontSize="small" sx={{ color: "gray" }} />   // ❌ Not Paid
                        ) : r.payment_status === "paid" ? (
                          <CheckCircleIcon fontSize="small" sx={{ color: "#243255" }} />  // ✅ Paid
                        ) : r.payment_status === "not_reviewed" ? (
                          <PendingActionsIcon fontSize="small" sx={{ color: "#7a9fbc" }} /> // 🔍 Not Reviewed
                        ) : r.payment_status === "pending" ? (
                          <AccessTimeIcon fontSize="small" sx={{ color: "#b0bec5" }} /> // ⏳ Pending
                        ) : null}
                      </IconButton>
                    </Tooltip>
                  </>
                }
              />
              ))}
            </Box>
              {receiptsPageCount > 1 && (
                <Pagination
                  count={receiptsPageCount}
                  page={receiptsPage}
                  onChange={(e, v) => setReceiptsPage(v)}
                  sx={{ mt: 3, display: "flex", justifyContent: "center" }}
                />
              )}
            </Box>
          </Box>
        )}
      </Box>
      <Dialog
  open={statusDialog.open}
  onClose={() => setStatusDialog({ open: false, type: "", message: "" })}
>
<DialogTitle sx={{ textAlign: "center" }}>
  {statusDialog.type === "success" ? "Success" : "Error"}
</DialogTitle>
<DialogContent sx={{ textAlign: "center" }}>
  {statusDialog.type === "success" ? (
    <CheckCircleOutlineIcon
      sx={{ fontSize: 60, color: "green", mb: 2, ...iconAnimation }}
    />
  ) : (
    <HighlightOffIcon
      sx={{ fontSize: 60, color: "red", mb: 2, ...iconAnimation }}
    />
  )}
  <Typography
    color={statusDialog.type === "error" ? "error" : "green"}
    variant="subtitle1"
    fontWeight="bold"
  >
    {statusDialog.message}
  </Typography>
</DialogContent>

  <DialogActions>
    <Button
      onClick={() =>
        setStatusDialog({ open: false, type: "", message: "" })
      }
      autoFocus
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

    </PageWrapper>
    
  );
};

export default GenerateBillPage;
