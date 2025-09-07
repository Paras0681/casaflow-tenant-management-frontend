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
  Chip,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import api from "../api"; // axios instance

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
  const [filterType, setFilterType] = useState("All");

  // ---------- Receipts State ----------
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptError, setReceiptError] = useState("");
  const [receiptRoom, setReceiptRoom] = useState("");
  const [receiptDesc, setReceiptDesc] = useState("");
  const [uploadedReceipts, setUploadedReceipts] = useState([]);
  const [searchReceipt, setSearchReceipt] = useState("");
    const [rent, setRent] = useState("");
  const [water, setWater] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [other, setOther] = useState("");
  const [billDate, setBillDate] = useState("");
  const [previewData, setPreviewData] = useState(null);

  // Handle preview
  const handlePreview = (e) => {
    e.preventDefault();
    const total = Number(rent || 0) + Number(water || 0) + Number(maintenance || 0) + Number(other || 0);
    setPreviewData({
      rent,
      water,
      maintenance,
      other,
      billDate,
      total,
    });
  };

  // Handle PDF generation
  const handleGeneratePDF = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/invoices/generate/", {
        rent,
        water,
        maintenance,
        other,
        bill_date: billDate,
      });

      if (response.data.pdf_url) {
        window.open(response.data.pdf_url, "_blank");
      } else {
        alert("PDF generated but no URL received.");
      }
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Failed to generate PDF.");
    }
  };

  // ---------- Helpers ----------
  const cleanUrl = (url) => (url ? url.replace("image/upload/", "") : "");
  const handleView = (url) => window.open(url, "_blank");

  // File validation (used for both bills & receipts)
  const validateFile = (file, setError, setState, e) => {
    const fileSizeKB = file.size / 1024;
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];

    if (!validTypes.includes(file.type)) {
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
    setState(file);
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
        setUploadedReceipts(response.data);
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
      alert("Please fill required fields and upload a file!");
      return;
    }
    const formData = new FormData();
    formData.append("file", billFile);
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

  // ---------- Submit Receipt ----------
  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    if (!receiptFile || !receiptRoom) {
      alert("Please fill required fields and upload a file!");
      return;
    }
    const formData = new FormData();
    formData.append("file", receiptFile);
    formData.append("room_number", receiptRoom);
    if (receiptDesc) formData.append("description", receiptDesc);

    try {
      const response = await api.post("/tenants/receipts/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedReceipts((prev) => [...prev, response.data]);
      alert("Receipt uploaded successfully!");
      setReceiptFile(null);
      setReceiptRoom("");
      setReceiptDesc("");
    } catch (error) {
      console.error(error);
      alert("Error uploading receipt.");
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
      (r.description && r.description.toLowerCase().includes(q)) ||
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
          <Paper elevation={4} sx={{p: 3,mb: 4,maxWidth: "500px",mx: "auto",borderRadius: "12px",}}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Upload New Bill
            </Typography>
            <Box
              component="form"
              onSubmit={handleBillSubmit}
              sx={{ display: "grid", gap: 2 }}
            >
              <TextField
                label="Room Number"
                type="number"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                required
              />
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
                  type="file"
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
              <Button
                variant="contained"
                type="submit"
                disabled={!billFile || !!fileError}
              >
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 3,
            }}
          >
            {filteredBills.map((bill) => (
              <Card key={bill.id}>
                {bill.file?.endsWith(".pdf") ? (
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {bill.file_type.toUpperCase()}
                    </Typography>
                    <a href={cleanUrl(bill.file)} target="_blank">
                      View PDF
                    </a>
                  </CardContent>
                ) : (
                  <CardMedia
                    component="img"
                    height="150"
                    image={cleanUrl(bill.file)}
                  />
                )}
                <CardContent>
                  <Typography>Room: {bill.room_number}</Typography>
                  <Typography>Description: {bill.description || "N/A"}</Typography>
                  <Typography>
                    Time: <TimeDisplay isoString={bill.uploaded_at} />
                  </Typography>
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Button onClick={() => handleView(cleanUrl(bill.file))}>
                      View
                    </Button>
                    <Button
                      color="error"
                      onClick={() => handleDeleteBill(bill.id)}
                    >
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
          {/* Upload Receipt Form */}
          <Paper
            elevation={4}
            sx={{
              p: 3,
              maxWidth: "500px",
              mx: "auto",
              borderRadius: "12px",
            }}
          >
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Generate Receipt
            </Typography>

            <Box
              component="form"
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Rent Amount"
                type="number"
                value={rent}
                onChange={(e) => setRent(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Water Bill Amount"
                type="number"
                value={water}
                onChange={(e) => setWater(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Maintenance Amount"
                type="number"
                value={maintenance}
                onChange={(e) => setMaintenance(e.target.value)}
                required
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
                label="Bill Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                required
                fullWidth
              />

              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={handlePreview}
                >
                  Preview
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={handleGeneratePDF}
                >
                  Generate PDF
                </Button>
              </Box>
            </Box>

            {/* Preview Section */}
            {previewData && (
              <Paper
                variant="outlined"
                sx={{ mt: 3, p: 2, borderRadius: "8px", background: "#fafafa" }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Receipt Preview ({previewData.billDate})
                </Typography>
                <Typography variant="body2">Rent: ₹{previewData.rent}</Typography>
                <Typography variant="body2">Water: ₹{previewData.water}</Typography>
                <Typography variant="body2">Maintenance: ₹{previewData.maintenance}</Typography>
                <Typography variant="body2">Other: ₹{previewData.other}</Typography>
                <Typography variant="h6" mt={1}>
                  Total: ₹{previewData.total}
                </Typography>
              </Paper>
            )}
          </Paper>

          {/* Receipts List */}
          <TextField
            placeholder="Search receipts..."
            value={searchReceipt}
            onChange={(e) => setSearchReceipt(e.target.value)}
            sx={{ mb: 3 }}
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
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 3,
            }}
          >
            {filteredReceipts.map((r) => (
              <Card key={r.id}>
                {r.file?.endsWith(".pdf") ? (
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      RECEIPT
                    </Typography>
                    <a href={cleanUrl(r.file)} target="_blank">
                      View PDF
                    </a>
                  </CardContent>
                ) : (
                  <CardMedia
                    component="img"
                    height="150"
                    image={cleanUrl(r.file)}
                  />
                )}
                <CardContent>
                  <Typography>Room: {r.room_number}</Typography>
                  <Typography>Description: {r.description || "N/A"}</Typography>
                  <Typography>
                    Time: <TimeDisplay isoString={r.uploaded_at} />
                  </Typography>
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Button onClick={() => handleView(cleanUrl(r.file))}>
                      View
                    </Button>
                    <Button
                      color="error"
                      onClick={() => handleDeleteReceipt(r.id)}
                    >
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
