// src/pages/TenantsProfilePage.js
import React, { useEffect, useState } from "react";
import PageWrapper from "./PageWrapper";
import {
  Alert,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import api from "../api";
import ContactPageIcon from "@mui/icons-material/ContactPage";

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TenantsProfilePage = () => {
  const [tab, setTab] = useState(0);
  const [tenants, setTenants] = useState([]);
  const [filteredTenants, setFilteredTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [editTenant, setEditTenant] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    lease_start_date: "",
    room_number: "",
    address: "",
    occupation: "",
    email: "",
  });

  // Fetch tenants
  const fetchTenants = async () => {
    try {
      const response = await api.get("tenants/tenants-profile/");
      setTenants(response.data);
      setFilteredTenants(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load tenants");
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleTabChange = (e, newValue) => {
    setTab(newValue);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setFilteredTenants(
      tenants.filter(
        (t) =>
          t.first_name.toLowerCase().includes(q) ||
          t.last_name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q)
      )
    );
  };

  // Open edit modal
  const handleEdit = (tenant) => {
    setEditTenant(tenant);
    setFormData({
      first_name: tenant.first_name,
      last_name: tenant.last_name,
      phone_number: tenant.phone_number,
      email: tenant.email,
    });
    setOpenForm(true);
  };

  // Submit edit
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`tenants/tenants-profile/${editTenant.account_id}/`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        email: formData.email,
      });
      setSuccess(true);
      setError("");
      setOpenForm(false);
      fetchTenants();
    } catch (err) {
      console.error(err);
      setError("Failed to update tenant");
      setSuccess(false);
    }
  };

  // Submit new tenant
  const handleSubmitNew = async (e) => {
    e.preventDefault();
    try {
      await api.post("tenants/tenants-profile/", formData);
      setSuccess(true);
      setError("");
      setFormData({
        first_name: "",
        last_name: "",
        phone_number: "",
        lease_start_date: "",
        room_number: "",
        address: "",
        occupation: "",
        email: "",
      });
      fetchTenants();
    } catch (err) {
      console.error(err);
      setError("Failed to create tenant");
      setSuccess(false);
    }
  };

  return (
    <PageWrapper pageTitle="Tenants">
      {success && <Alert severity="success">Operation successful!</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Tabs value={tab} onChange={handleTabChange}>
        <Tab label="View Tenants" />
        <Tab label="Add Tenant" />
      </Tabs>

      {/* Tab 0: View Tenants */}
      <CustomTabPanel value={tab} index={0}>
        <Box mb={2}>
          <TextField
            label="Search tenants..."
            fullWidth
            onChange={handleSearch}
          />
        </Box>

        {!error && tenants.length === 0 ? (
          <Typography>No tenants found</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {filteredTenants.map((tenant) => (
                <Grid item xs={12} md={6} lg={3} key={tenant.account_id}>
                  <Card sx={{ p: 2, boxShadow: 3 }}>
                    <CardContent>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                        <Avatar
                          src={tenant.avatar || <ContactPageIcon color="secondary" />}
                          alt={tenant.first_name}
                        />
                        <Typography variant="h6" fontWeight="bold">
                          {tenant.first_name} {tenant.last_name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Room: {tenant.room_number || "-"} <br />
                        Phone: {tenant.phone_number || "-"} <br />
                        Email: {tenant.email || "-"} <br />
                      </Typography>
                      <Box mt={2} display="flex" gap={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setSelectedTenant(tenant)}
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleEdit(tenant)}
                        >
                          Edit
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Detailed tenant card */}
            {selectedTenant && (
              <Card sx={{ mt: 3, p: 2, boxShadow: 5 }}>
                <CardContent>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedTenant.first_name} {selectedTenant.last_name}
                  </Typography>
                  <Typography variant="body1" mt={1}>
                    Email: {selectedTenant.email || "-"} <br />
                    Phone: {selectedTenant.phone_number || "-"} <br />
                    Room: {selectedTenant.room_number || "-"} <br />
                    Lease Start: {selectedTenant.lease_start_date || "-"} <br />
                    Address: {selectedTenant.address || "-"} <br />
                    Occupation: {selectedTenant.occupation || "-"}
                  </Typography>
                  <Button sx={{ mt: 2 }} onClick={() => setSelectedTenant(null)}>
                    Close
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CustomTabPanel>

      {/* Tab 1: Add tenant */}
      <CustomTabPanel value={tab} index={1}>
        <form onSubmit={handleSubmitNew}>
          <Box display="flex" flexDirection="column" gap={2} maxWidth={400}>
            <TextField
              required
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              required
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              required
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              required
              label="Phone Number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Room Number"
              name="room_number"
              value={formData.room_number}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Lease Start Date"
              name="lease_start_date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.lease_start_date}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              fullWidth
            />
            <Button type="submit" variant="contained">
              Save Tenant
            </Button>
          </Box>
        </form>
      </CustomTabPanel>

      {/* Edit Modal */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>Edit Tenant</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
};

export default TenantsProfilePage;
