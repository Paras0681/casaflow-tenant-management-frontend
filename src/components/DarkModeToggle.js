import React from "react";
import { FormControlLabel, Switch } from "@mui/material";

const DarkModeToggle = ({ darkMode, setDarkMode }) => (
  <FormControlLabel
    control={
      <Switch
        checked={darkMode}
        onChange={() => setDarkMode(!darkMode)}
        color="primary"
      />
    }
    label={darkMode ? "Dark Mode" : "Light Mode"}
  />
);

export default DarkModeToggle;
