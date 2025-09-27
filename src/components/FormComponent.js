import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Alert,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { getApi } from "../api";

const FormComponent = ({
  formConfig,
  apiUrl,
  onSuccess,
  onError,
  submitLabel = "Submit",
  formValues,
  setFormValues,
}) => {
  const [formErrors, setFormErrors] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loadingModalOpen, setLoadingModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  const validate = () => {
    const errors = {};
    formConfig.forEach(({ name, label, required }) => {
      if (required && (!formValues[name] && formValues[name] !== 0)) {
        errors[name] = `${label || name} is required`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateFile = (file, allowedTypes, sizeRangeKB) => {
    if (!file) return "";
    if (!allowedTypes.includes(file.type)) {
      return `Allowed file types: ${allowedTypes.join(", ")}`;
    }
    const sizeKB = file.size / 1024;
    if (sizeKB < sizeRangeKB[0] || sizeKB > sizeRangeKB[1]) {
      return `File size must be between ${sizeRangeKB[0]}KB and ${sizeRangeKB[1]}KB`;
    }
    return "";
  };

  const handleChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
    setFormErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleFileChange = (name, e, allowedTypes = [], sizeRangeKB = [0, Infinity]) => {
    const file = e.target.files[0];
    const err = validateFile(file, allowedTypes, sizeRangeKB);
    setFileErrors((prev) => ({ ...prev, [name]: err }));
    if (!err) {
      handleChange(name, file);
    } else {
      handleChange(name, null);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    if (!validate()) return;
    if (Object.values(fileErrors).some((e) => e)) return;

    const submitData = new FormData();
    Object.entries(formValues).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        submitData.append(key, val);
      }
    });

    try {
      setLoadingModalOpen(true);
      const api = await getApi();
      const response = await api.post(apiUrl, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLoadingModalOpen(false);
      setSuccessModalOpen(true);
      if (onSuccess) onSuccess(response.data);
      setFormValues(formConfig.reduce((acc, cur) => ({ ...acc, [cur.name]: null }), {}));
    } catch (error) {
      setLoadingModalOpen(false);
      let msg = "Failed to submit form.";
      if (error.response && error.response.data) {
        msg = error.response.data.message || JSON.stringify(error.response.data);
      } else if (error.message) {
        msg = error.message;
      }
      setGeneralError(msg);
      setErrorModalOpen(true);
      if (onError) onError(error);
    }
  };

  const isFormValid =
    Object.keys(formErrors).length === 0 &&
    Object.values(fileErrors).every((e) => !e) &&
    formConfig.every(({ name, required }) => {
      const val = formValues[name];
      if (required) {
        if (name === "screenshot" && val === null) return false;
        return val !== undefined && val !== "" && val !== null;
      }
      return true;
    });

  const closeSuccessModal = () => setSuccessModalOpen(false);
  const closeErrorModal = () => setErrorModalOpen(false);

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
        {generalError && <Alert sx={{ bgcolor: "#7A9FBC", color: "#253255", fontWeight: "bold" }} severity="error">{generalError}</Alert>}

        {formConfig.map(({ name, label, type, options, required, multiline, rows, disabled, ...rest }) => {
          if (type === "select") {
            return (
              <TextField
                key={name}
                select
                label={label}
                value={formValues[name] || ""}
                onChange={(e) => handleChange(name, e.target.value)}
                required={required}
                error={!!formErrors[name]}
                helperText={formErrors[name]}
                disabled={disabled || false}
                {...rest}
              >
                {options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            );
          }

          if (type === "file") {
            const allowedTypes = rest.allowedTypes || ["application/pdf", "image/jpeg", "image/png"];
            const sizeRangeKB = rest.sizeRangeKB || [50, 100];
            const file = formValues[name];

            return (
              <Box key={name}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{
                    bgcolor: "#7A9FBC",
                    color: "#fff",
                    textTransform: "none",
                    '&:hover': {
                      bgcolor: "#a1b6d1",
                    },
                  }}
                >
                  {file?.name || `Choose ${label}`}
                  <input
                    type="file"
                    hidden
                    accept={allowedTypes.join(",")}
                    onChange={(e) =>
                      handleFileChange(
                        name,
                        e,
                        allowedTypes,
                        sizeRangeKB
                      )
                    }
                  />
                </Button>
                {fileErrors[name] && (
                  <Typography variant="body2" color="error" mt={1}>
                    {fileErrors[name]}
                  </Typography>
                )}
              </Box>
            );
          }

          return (
            <TextField
              key={name}
              label={label}
              type={type}
              value={rest.value !== undefined ? rest.value : (formValues[name] ?? "")}
              onChange={disabled? undefined: (e) => handleChange(name, e.target.value)}
              required={required}
              error={!!formErrors[name]}
              helperText={formErrors[name]}
              disabled={disabled || false}
              multiline={multiline}
              rows={rows}
              fullWidth
              {...rest}
            />
          );
        })}

        <Button
          variant="contained"
          type="submit"
          disabled={!isFormValid || loadingModalOpen}
          sx={{
            bgcolor: "#253255",
            color: "#fff",
            textTransform: "none",
            '&:hover': {
              bgcolor: "#41568a",
            },
          }}
        >
          {loadingModalOpen ? "Loading..." : submitLabel}
        </Button>
      </Box>

      {/* Loading Modal */}
      <Dialog
        open={loadingModalOpen}
        PaperProps={{
          sx: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
            flexDirection: "column",
            gap: 2,
            minWidth: 200,
          }
        }}
      >
        <CircularProgress />
        <Typography variant="subtitle1">Loading...</Typography>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onClose={closeSuccessModal}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>
            File has been successfully uploaded.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSuccessModal} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={errorModalOpen} onClose={closeErrorModal}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {generalError || "An error occurred during submission."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeErrorModal} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FormComponent;
