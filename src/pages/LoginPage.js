// src/pages/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import bgImage from "../images/login_page_background_image.png";
import api from "../api";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    first_name: "",
    last_name: "",
    occupation: "",
    phone_number: "",
    room_number: "",
    address: "",
    email: "",
    password: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false); // NEW

  const navigate = useNavigate();
  const { login } = useAuth();

  // Handle login input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle register input
  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  };

  // Login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/users/login/", form);
      const { access, refresh, user } = response.data;

      // Log tokens to console
      console.log("[LOGIN] Access Token:", access);
      console.log("[LOGIN] Refresh Token:", refresh);
      console.log("[LOGIN] User:", user);

      login(user, { access, refresh });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Register submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError("");
    setRegisterSuccess(false);

    try {
      await api.post("/users/register/", registerForm);

      // Registration successful → show alert on login page
      setRegisterSuccess(true);
      setRegisterOpen(false);

      // Reset register form
      setRegisterForm({
        first_name: "",
        last_name: "",
        occupation: "",
        phone_number: "",
        room_number: "",
        address: "",
        email: "",
        password: "",
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => setRegisterSuccess(false), 5000);

    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        const firstError =
          data.error ||
          data.email?.[0] ||
          data.password?.[0] ||
          data.first_name?.[0] ||
          data.last_name?.[0] ||
          data.detail ||
          "Failed to register";
        setRegisterError(firstError);
      } else {
        setRegisterError("Failed to register");
      }
    } finally {
      setRegisterLoading(false);
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
      <Paper
        sx={{
          p: 4,
          borderRadius: 2,
          minWidth: 300,
          boxShadow: 6,
          bgcolor: "rgba(255,255,255,0.9)",
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Login
        </Typography>

        {/* Show registration success alert */}
        {registerSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setRegisterSuccess(false)}
          >
            Registration successful! You can now login.
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={form.email}
            onChange={handleChange}
            required
            autoFocus
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            sx={{ mb: 3 }}
            value={form.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* Register button */}
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => setRegisterOpen(true)}
        >
          Register
        </Button>
      </Paper>

      {/* Register modal */}
      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)}>
        <DialogTitle>Register</DialogTitle>
        <form onSubmit={handleRegisterSubmit}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {registerError && <Alert severity="error">{registerError}</Alert>}
            <TextField
              label="First Name"
              name="first_name"
              type="text"
              fullWidth
              value={registerForm.first_name}
              onChange={handleRegisterChange}
              required
            />
            <TextField
              label="Last Name"
              name="last_name"
              type="text"
              fullWidth
              value={registerForm.last_name}
              onChange={handleRegisterChange}
              required
            />
            <TextField
              label="Occupation"
              name="occupation"
              type="text"
              fullWidth
              value={registerForm.occupation}
              onChange={handleRegisterChange}
              required
            />
            <TextField
              label="Phone No."
              name="phone_number"
              type="text"
              fullWidth
              value={registerForm.phone_number}
              onChange={handleRegisterChange}
              required
            />
            <TextField
              label="Room No."
              name="room_number"
              type="text"
              fullWidth
              value={registerForm.room_number}
              onChange={handleRegisterChange}
              required
            />
            <TextField
              label="Address"
              name="address"
              type="text"
              fullWidth
              value={registerForm.address}
              onChange={handleRegisterChange}
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              value={registerForm.email}
              onChange={handleRegisterChange}
              required
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              value={registerForm.password}
              onChange={handleRegisterChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRegisterOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={registerLoading}>
              {registerLoading ? "Registering..." : "Register"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LoginPage;
