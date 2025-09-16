import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";

const DisplayCard = ({ file, fields, showActions = true }) => {
  // Function to handle View (example)
  const handleView = () => {
    if (file.file_url) window.open(file.file_url, "_blank");
  };

  // Function to handle Download (example)
  const handleDownload = () => {
    if (file.file_url) {
      const link = document.createElement("a");
      link.href = file.file_url;
      link.download = file.file_url.substring(file.file_url.lastIndexOf("/") + 1);
      link.click();
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        borderRadius: 2,
        boxShadow: 3,
        height: 140,
        position: "relative",
        "&:hover .actions-container": showActions ? { opacity: 1, pointerEvents: "auto" } : {},
      }}
    >
      {/* Left image */}
      <CardMedia
        component="img"
        image={file.file_url}
        alt="logo"
        sx={{ width: 140, objectFit: "contain", p: 1, bgcolor: "#f5f5f5" }}
      />

      {/* Content */}
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {fields.map(({ key, label, fn }) => (
          <Box key={key} sx={{ mb: 0.5 }}>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              component="span"
              sx={{ fontWeight: 600 }}
            >
              {label}:
            </Typography>{" "}
            <Typography variant="body2" component="span" sx={{ ml: 0.5 }}>
              {fn ? fn(file[key]) : file[key]?.toString() ?? "N/A"}
            </Typography>
          </Box>
        ))}

        {showActions && (
          <Box
            className="actions-container"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              display: "flex",
              gap: 1,
              opacity: 0,
              pointerEvents: "none",
              transition: "opacity 0.3s ease",
            }}
          >
            <Tooltip title="View">
              <IconButton size="small" onClick={handleView}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton size="small" onClick={handleDownload}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default DisplayCard;
