// src/pages/GenerateBillPage.js
import React, { useState, useEffect } from "react";
import PageWrapper from "../pages/PageWrapper";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Paper,
  InputAdornment,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import api from "../api"; // axios instance
import invoice_card_img from "../images/invoice_card_img.png";

const TimeDisplay = ({ isoString }) => {
  const date = new Date(isoString);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const GenerateBillPage = () => {
  const [tabIndex, setTabIndex] = useState(0);

  // ---------- Bills State ----------
  const [billType, setBillType] = useState("");
  const [billFile, setBillFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [unitReading, setUnitReading] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedBills, setUploadedBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ---------- Receipts State ----------
  const [rent, setRent] = useState("");
  const [light, setLight] = useState("");
  const [other, setOther] = useState("");
  const [total, setTotal] = useState(0);
  const [billDate, setBillDate] = useState("");
  const [uploadedReceipts, setUploadedReceipts] = useState([]);
  const [searchReceipt, setSearchReceipt] = useState("");
  const [roomsList, setRoomsList] = useState([]);
  const [receiptRoom, setReceiptRoom] = useState("");
  const [perPerson, setPerPerson] = useState(0); 

  // Auto calculate total
  useEffect(() => {
    const totalVal =
      (parseFloat(rent) || 0) +
      (parseFloat(light) || 0) +
      (parseFloat(other) || 0);
    setTotal(totalVal);

    // avoid divide by zero
    // find occupants of selected room
    const selectedRoom = roomsList.find((room) => room.room === receiptRoom);
    if (selectedRoom && selectedRoom.occupants > 0) {
      setPerPerson(totalVal / selectedRoom.occupants);
    } else {
      setPerPerson(0);
    }
  }, [rent, light, other, roomsList]);

  // Handle PDF generation
  const handleGeneratePDF = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/tenants/receipts/generate/", {
        room_number: receiptRoom,
        rent_amount: rent,
        lightbill_amount: light,
        other_charges: other,
        total_amount: total,
        bill_date: billDate,
        per_tenant_share: perPerson
      });

    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Failed to generate receipt.");
    }
  };

  // ---------- Helpers ----------
  const cleanUrl = (url) => (url ? url.replace("image/upload/", "") : "");
  const handleView = (url) => window.open(url, "_blank");

  const validateFile = (file_url, setError, setState, e) => {
    const fileSizeKB = file_url.size / 1024;
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!validTypes.includes(file_url.type)) {
      setError("Only PDF, JPG, and PNG files are allowed.");
      setState(null);
      e.target.value = "";
      return false;
    }
    if (fileSizeKB < 50 || fileSizeKB > 100) {
      setError("File size must be between 50KB and 100KB.");
      setState(null);
      e.target.value = "";
      return false;
    }
    setError("");
    setState(file_url);
    return true;
  };

  // ---------- Fetch Bills ----------
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

  // ---------- Fetch Receipts ----------
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await api.get("/tenants/receipts/");
        const rooms_list = response.data["rooms"]
        setRoomsList(rooms_list || []);
        const receipts = response.data["receipts"]
        setUploadedReceipts(receipts);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      }
    };
    fetchReceipts();
  }, []);

  // ---------- Submit Bill ----------
  const handleBillSubmit = async (e) => {
    e.preventDefault();
    if (!billType || !billFile || !roomNumber) {
      alert("Please fill required fields and upload a file_url!");
      return;
    }
    const formData = new FormData();
    formData.append("file_url", billFile);
    formData.append("file_type", billType.toLowerCase());
    formData.append("room_number", roomNumber);
    if (unitReading) formData.append("unit_reading", unitReading);
    if (description) formData.append("description", description);

    try {
      const response = await api.post("/tenants/files/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedBills((prev) => [...prev, response.data]);
      alert("Bill uploaded successfully!");
      setBillType("");
      setBillFile(null);
      setRoomNumber("");
      setUnitReading("");
      setDescription("");
    } catch (error) {
      console.error(error);
      alert("Error uploading bill.");
    }
  };

  // ---------- Delete ----------
  const handleDeleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await api.delete(`/tenants/files/${id}/`);
      setUploadedBills((prev) => prev.filter((bill) => bill.id !== id));
    } catch (error) {
      console.error("Error deleting bill:", error);
    }
  };

  const handleDeleteReceipt = async (id) => {
    if (!window.confirm("Delete this receipt?")) return;
    try {
      await api.delete(`/tenants/receipts/${id}/`);
      setUploadedReceipts((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting receipt:", error);
    }
  };

  // ---------- Filters ----------
  const filteredBills = uploadedBills.filter((bill) => {
    const q = searchQuery.toLowerCase();
    return (
      bill.file_type.toLowerCase().includes(q) ||
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

  return (
    <PageWrapper pageTitle="Bills & Receipts">
      {/* Tabs */}
      <Tabs
        value={tabIndex}
        onChange={(e, newValue) => setTabIndex(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Bills" />
        <Tab label="Receipts" />
      </Tabs>

      {/* ---------- Bills Tab ---------- */}
      {tabIndex === 0 && (
        <>
          {/* Upload Bill Form */}
          <Paper elevation={4} sx={{ p: 3, mb: 4, maxWidth: "500px", mx: "auto", borderRadius: "12px" }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Upload New Bill
            </Typography>
            <Box component="form" onSubmit={handleBillSubmit} sx={{ display: "grid", gap: 2 }}>
              <TextField
                select
                label="Room Number"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
              >
                {roomsList.map((room_no) => (
                  <MenuItem key={room_no.room} value={room_no.room}>
                  {room_no.room}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Bill Type"
                value={billType}
                onChange={(e) => setBillType(e.target.value)}
                required
              >
                <MenuItem value="Electricity">Electricity</MenuItem>
                <MenuItem value="Water">Water</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              <TextField
                label="Unit Reading (optional)"
                type="number"
                value={unitReading}
                onChange={(e) => setUnitReading(e.target.value)}
              />
              <TextField
                label="Description (optional)"
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button variant="contained" component="label">
                {billFile ? billFile.name : "Choose File"}
                <input
                  type="file_url"
                  hidden
                  accept=".pdf,.jpg,.png,.jpeg"
                  onChange={(e) =>
                    validateFile(e.target.files[0], setFileError, setBillFile, e)
                  }
                />
              </Button>
              {fileError && (
                <Typography color="error" variant="body2">
                  {fileError}
                </Typography>
              )}
              <Button variant="contained" type="submit" disabled={!billFile || !!fileError}>
                Upload
              </Button>
            </Box>
          </Paper>

          {/* Bills List */}
          <TextField
            placeholder="Search bills..."
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
            {filteredBills.map((bill) => (
              <Card key={bill.id}>
                  <CardMedia component="img" height="150" image={cleanUrl(bill.file_url)} />
                <CardContent>
                  <Typography>Room: {bill.room_number}</Typography>
                  <Typography>Description: {bill.description || "N/A"}</Typography>
                  <Typography>
                    Time: <TimeDisplay isoString={bill.uploaded_at} />
                  </Typography>
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Button onClick={() => handleView(cleanUrl(bill.file_url))}>
                      View
                    </Button>
                    <Button color="error" onClick={() => handleDeleteBill(bill.id)}>
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* ---------- Receipts Tab ---------- */}
      {tabIndex === 1 && (
        <>
          {/* Receipt Form */}
          <Paper elevation={4} sx={{ p: 3, maxWidth: "500px", mx: "auto", borderRadius: "12px" }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Generate Invoice PDF's
            </Typography>
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                select
                label="Select Room"
                value={receiptRoom}
                onChange={(e) => setReceiptRoom(e.target.value)}
                required
                fullWidth
              >
                {roomsList.map((room_no) => (
                  <MenuItem key={room_no.room} value={room_no.room}>
                  {room_no.room}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Rent Amount"
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Light Bill Amount"
                type="number"
                value={light}
                onChange={(e) => setLight(e.target.value)}
                fullWidth
              />
              <TextField
                label="Other Amount"
                type="number"
                value={other}
                onChange={(e) => setOther(e.target.value)}
                fullWidth
              />
              <TextField
                label="Total Amount"
                type="number"
                value={total}
                disabled
                fullWidth
              />
              <TextField
                label="Per Person Share"
                type="number"
                value={perPerson}
                disabled
                fullWidth
              />
              <TextField
                label="Invoice Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                required
                fullWidth
              />
              <Button variant="contained" color="success" fullWidth onClick={handleGeneratePDF}>
                Generate Invoices
              </Button>
            </Box>
          </Paper>

          {/* Receipts List */}
          <TextField
            placeholder="Search receipts..."
            value={searchReceipt}
            onChange={(e) => setSearchReceipt(e.target.value)}
            sx={{ mb: 3, mt: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 3 }}>
            {filteredReceipts.map((r) => (
              <Card key={r.id}>
                {r.file_url?.endsWith(".pdf") ? (
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      RECEIPT
                    </Typography>
                    <a href={cleanUrl(r.file_url)} target="_blank">
                      View PDF
                    </a>
                  </CardContent>
                ) : (
                  <CardMedia component="img" height="150" image={invoice_card_img} />
                )}
                <CardContent>
                  <Typography>Name: {r.tenant_name}</Typography>
                  <Typography>Payment Status: {r.payment_status.toUpperCase()}</Typography>
                  <Typography>Amount: {r.total_amount}</Typography>
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Button onClick={() => handleView(cleanUrl(r.file_url))}>View</Button>
                    <Button color="error" onClick={() => handleDeleteReceipt(r.id)}>
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}
    </PageWrapper>
  );
};

export default GenerateBillPage;
