import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { GoogleOAuthProvider } from "@react-oauth/google";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import GenerateBillPage from "./pages/GenerateBillPage";
import TenantsProfilePage from "./pages/TenantsProfilePage";
import AnalyticsPage from "./pages/AnalyticsPage";
import DocumentUploadPage from "./pages/DocumentUploadPage";
import PropertiesPage from "./pages/PropertiesPage"
import PaymentPage from "./pages/PaymentPage";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  typography: { fontFamily: "Poppins, Roboto, Arial, sans-serif" },
  palette: { background: { default: "#f5f5f5" } },
});

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<LoginPage />} />
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/bills" element={
                <ProtectedRoute><GenerateBillPage /></ProtectedRoute>
              } />
              <Route path="/tenant-docs" element={
                <ProtectedRoute><DocumentUploadPage /></ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
              } />
              <Route path="/tenants-profile" element={
                <ProtectedRoute><TenantsProfilePage /></ProtectedRoute>
              } />
              <Route path="/properties" element={
                <ProtectedRoute><PropertiesPage /></ProtectedRoute>
              } />
              <Route path="/payments" element={
                <ProtectedRoute><PaymentPage /></ProtectedRoute>
              } />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
