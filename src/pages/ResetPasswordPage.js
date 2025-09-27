// src/pages/ResetPasswordPage.js
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import { getApi } from "../api";
import bgImage from "../images/login_page_background_image.png";

const ResetPasswordPage = () => {
  const { token } = useParams(); // token from URL
  console.log("Reset token:", token);  
  const [form, setForm] = useState({ password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const api = await getApi();
      const response = await api.post(`/users/reset-password/${token}/`, form);
      setSuccess(response.data.message || "Password reset successfully.");
      setForm({ password: "", confirm_password: "" });

      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center", 
      }}
    >
      <Paper sx={{ p: 4, borderRadius: 2, minWidth: 300, boxShadow: 6 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Reset Password
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            name="password"
            fullWidth
            sx={{ mb: 2 }}
            value={form.password}
            onChange={handleChange}
            required
          />
          <TextField
            label="Confirm Password"
            type="password"
            name="confirm_password"
            fullWidth
            sx={{ mb: 2 }}
            value={form.confirm_password}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <Button
          sx={{ mt: 2, textTransform: "none" }}
          onClick={() => navigate("/login")}
        >
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
