import React, { useState } from "react";
import PageWrapper from "../pages/PageWrapper";
import { Box, TextField, Button, MenuItem, Typography, Card, CardContent } from "@mui/material";

const GenerateBillPage = () => {
  const [billType, setBillType] = useState("");
  const [billFile, setBillFile] = useState(null);

  const handleFileChange = (e) => {
    setBillFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!billType || !billFile) {
      alert("Please select bill type and upload file!");
      return;
    }
    console.log("Bill Type:", billType);
    console.log("Bill File:", billFile);
    alert("Bill uploaded successfully!");
    setBillType("");
    setBillFile(null);
  };

  return (
    <PageWrapper pageTitle="Generate Bills">
      <Card sx={{ p: 3, maxWidth: 500, mx: "auto", boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Upload New Bill
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Bill Type Dropdown */}
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

            {/* File Upload */}
            <Button
              variant="contained"
              component="label"
            >
              {billFile ? billFile.name : "Upload Bill File"}
              <input
                type="file"
                hidden
                accept=".pdf,.jpg,.png"
                onChange={handleFileChange}
              />
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
