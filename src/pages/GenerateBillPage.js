import React, { useState } from "react";
import PageWrapper from "../pages/PageWrapper";
import { Box, TextField, Button, MenuItem, Typography, Card, CardContent } from "@mui/material";
import api from "../api"; // Use the shared axios instance

const GenerateBillPage = () => {
  const [billType, setBillType] = useState("");
  const [billFile, setBillFile] = useState(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [unitReading, setUnitReading] = useState("");
  const [description, setDescription] = useState("");

  const handleFileChange = (e) => setBillFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!billType || !billFile || !roomNumber) {
      alert("Please select bill type, room number, and upload file!");
      return;
    }

    // Log tokens before making the API call
    const accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refresh");
    console.log("[GENERATE BILL] Access Token:", accessToken);
    console.log("[GENERATE BILL] Refresh Token:", refreshToken);

    const formData = new FormData();
    formData.append("file", billFile);
    formData.append("file_type", billType.toLowerCase());
    formData.append("room_number", roomNumber);
    if (unitReading) formData.append("unit_reading", unitReading);
    if (description) formData.append("description", description);

    try {
      const response = await api.post("/tenants/files/upload/", formData);
      alert("Bill uploaded successfully!");
      console.log(response.data);

      // Reset form
      setBillType("");
      setBillFile(null);
      setRoomNumber("");
      setUnitReading("");
      setDescription("");
    } catch (error) {
      console.error(error);
      alert("Error uploading file. Check console for details.");
    }
  };

  return (
    <PageWrapper pageTitle="Generate Bills">
      <Card sx={{ p: 3, maxWidth: 500, mx: "auto", boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Upload New Bill
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
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
              label="Select Bill Type"
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
              {billFile ? billFile.name : "Upload Bill File"}
              <input type="file" hidden accept=".pdf,.jpg,.png" onChange={handleFileChange} />
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default GenerateBillPage;
