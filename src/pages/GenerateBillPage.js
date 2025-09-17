import React, { useState, useEffect } from "react";
import {
  Alert,
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PageWrapper from "../components/PageWrapper.js";
import DisplayCard from "../components/DisplayCard.js";
import FormComponent from "../components/FormComponent.js";
import api from "../api";

const TimeDisplay = ({ isoString }) => {
  const date = new Date(isoString);

  // Format day - month - year two digits with leading zeros as needed
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  // Format hour in 12-hour clock with AM/PM
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // the hour '0' should be '12'

  return (
    <span>
      {`${day}-${month}-${year} ${hours}:${minutes}${ampm}`}
    </span>
  );
};


const ITEMS_PER_PAGE = 10;

const GenerateBillPage = () => {
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

  // Controlled form state for uploads and invoices
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
    per_person: "",
    bill_date: "",
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
      per_person: perPersonVal,
    }));
  }, [formValues.rent_amount, formValues.lightbill_amount, formValues.other_charges, formValues.room_number, roomsList]);


  // Fetch bills
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

  // Fetch receipts and rooms list
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await api.get("/tenants/receipts/");
        setRoomsList(response.data.rooms || []);
        setUploadedReceipts(response.data.receipts || []);
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
    {
      name: "rent_amount",
      label: "Rent Amount",
      type: "number",
      required: true,
    },
    {
      name: "lightbill_amount",
      label: "Light Bill Amount",
      type: "number",
    },
    {
      name: "other_charges",
      label: "Other Amount",
      type: "number",
    },
    {
      name: "total_amount",
      label: "Total Amount",
      type: "number",
      disabled: true,
      defaultValue: formValues.total_amount,
    },
    {
      name: "per_person",
      label: "Per Person Share",
      type: "number",
      disabled: true,
      defaultValue: formValues.per_person,
    },
    {
      name: "bill_date",
      label: "Invoice Date",
      type: "date",
      required: true,
      defaultValue: formValues.bill_date,
    },
  ];

  // Filters
  const filteredBills = uploadedBills.filter((bill) => {
    const q = searchQuery.toLowerCase();
    return (
      bill.file_type?.toLowerCase().includes(q) ||
      (bill.description && bill.description.toLowerCase().includes(q)) ||
      (bill.room_number && String(bill.room_number).includes(q))
    );
  });

  const filteredReceipts = uploadedReceipts.filter((r) => {
    const q = searchReceipt.toLowerCase();
    return (
      (r.payment_status && r.payment_status.toLowerCase().includes(q)) ||
      (r.room_number && String(r.room_number).includes(q))
    );
  });

  // Pagination slices
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

  // Handlers for page change
  const handleBillsPageChange = (event, value) => {
    setBillsPage(value);
  };

  const handleReceiptsPageChange = (event, value) => {
    setReceiptsPage(value);
  };

  return (
    <PageWrapper pageTitle="Uploads & Invoices">
      <Box sx={{ width: "100%", boxSizing: "border-box" }}>
        <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)} sx={{ mb: 3 }}>
          <Tab label="Uploads" />
          <Tab label="Invoices" />
        </Tabs>

        {tabIndex === 0 && (
          <>
            <Paper elevation={4} sx={{ p: 3, mb: 4, maxWidth: 500, mx: "auto", borderRadius: 2 }}>
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
                  setUploadedBills((prev) => [data, ...prev]); // add new first
                  setBillsPage(1); // reset to first page
                }}
                onError={(err) => {
                  console.error(err);
                }}
                submitLabel="Upload"
              />
            </Paper>

            <Box sx={{ maxWidth: 500, mx: "auto", mb: 3 }}>
              <TextField
                placeholder="Search bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 3,
                px: 2,
              }}
            >
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
                onChange={handleBillsPageChange}
                sx={{ mt: 3, display: "flex", justifyContent: "center" }}
              />
            )}
          </>
        )}

        {tabIndex === 1 && (
          <>
            <Paper elevation={4} sx={{ p: 3, maxWidth: 500, mx: "auto", borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Generate Invoice PDF's
              </Typography>

              <FormComponent
                formConfig={receiptFormConfig}
                apiUrl="/tenants/receipts/generate/"
                formValues={formValues}
                setFormValues={setFormValues}
                onSuccess={(data) => {
                  setUploadedReceipts((prev) => [data, ...prev]); // add new first
                  setReceiptsPage(1); // reset to first page
                }}
                onError={(err) => {
                  console.error(err);
                }}
                submitLabel="Generate Invoices"
              />
            </Paper>

            <Box sx={{ maxWidth: 500, mx: "auto", mb: 3, mt: 3 }}>
              <TextField
                placeholder="Search receipts..."
                value={searchReceipt}
                onChange={(e) => setSearchReceipt(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

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
                  file={r}
                  fields={[
                    { key: "tenant_name", label: "Name" },
                    { key: "payment_status", label: "Payment Status", fn: (val) => val?.toUpperCase() ?? "N/A" },
                    { key: "total_amount", label: "Amount" },
                  ]}
                />
              ))}
            </Box>

            {receiptsPageCount > 1 && (
              <Pagination
                count={receiptsPageCount}
                page={receiptsPage}
                onChange={handleReceiptsPageChange}
                sx={{ mt: 3, display: "flex", justifyContent: "center" }}
              />
            )}
          </>
        )}
      </Box>
    </PageWrapper>
  );
};

export default GenerateBillPage;
