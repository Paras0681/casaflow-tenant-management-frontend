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
    email: "",
    password: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

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

    try {
      const response = await api.post("/users/register/", registerForm);
      const { access, refresh, user } = response.data;
      login(user, { access, refresh });
      setRegisterOpen(false);
      navigate("/dashboard");
    } catch (err) {
      setRegisterError(err.response?.data?.detail || "Failed to register");
      console.error("Register error:", err);
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
          color="secondary"
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
