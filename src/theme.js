import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: { default: "#ffffff", paper: "#fafafa" },
    text: { primary: "#253255", secondary: "#7A9FBC" },
    primary: { main: "#253255" },
    secondary: { main: "#7A9FBC" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
      lineHeight: 1.6,
      letterSpacing: "0.03em",
      color: "#333333",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "0.05em",
      color: "#222222",
    },
    button: {
      fontWeight: 500,
      letterSpacing: "0.1em",
      textTransform: "none",
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#1e1e2f",
    },
    text: { primary: "#7A9FBC", secondary: "#aab9d1" },
    primary: { main: "#7A9FBC" },
    secondary: { main: "#aab9d1" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
    body1: {
      fontWeight: 400,
      fontSize: "1rem",
      lineHeight: 1.6,
      letterSpacing: "0.03em",
      color: "#aab9d1",
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "0.05em",
      color: "#7A9FBC",
    },
    button: {
      fontWeight: 500,
      letterSpacing: "0.1em",
      textTransform: "none",
    },
  },
});
