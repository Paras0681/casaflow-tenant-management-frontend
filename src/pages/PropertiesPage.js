import React, { useState, useEffect } from "react";
import PageWrapper from "../components/PageWrapper";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getApi } from "../api";
import FormComponent from "../components/FormComponent";
import DisplayCard from "../components/DisplayCard";
import property_logo from "../images/property_logo.jpg";
import room_logo from "../images/room_logo.jpg";

const PropertyRoomPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const theme = useTheme();

  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [searchProperties, setSearchProperties] = useState("");
  const [searchRooms, setSearchRooms] = useState("");

  const [propertyFormValues, setPropertyFormValues] = useState({
    name: "",
    total_floors: "",
    total_rooms: "",
  });

  const [roomFormValues, setRoomFormValues] = useState({
    property: "",
    room_number: "",
    active_tenants: "",
    max_occupants: "",
  });

  useEffect(() => {
    fetchProperties();
    fetchRooms();
  }, []);

  const fetchProperties = async () => {
    try {
      const api = await getApi();
      const res = await api.get("/tenants/properties/");
      setProperties(res.data);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setProperties([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const api = await getApi();
      const res = await api.get("/tenants/rooms/");
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setRooms([]);
    }
  };

  const propertyFormConfig = [
    { name: "name", label: "Property", type: "text", required: true },
    { name: "total_floors", label: "Total Floors", type: "number", required: true },
    { name: "total_rooms", label: "Total Rooms", type: "number", required: true },
  ];

  const roomFormConfig = [
    {
      name: "property",
      label: "Select Property",
      type: "select",
      required: true,
      options: properties.map((p) => ({ value: p.id, label: `${p.name}` })),
    },
    { name: "room_number", label: "Room Number", type: "text", required: true },
    { name: "active_tenants", label: "Active Tenants", type: "number", required: true },
    { name: "max_occupants", label: "Max Occupants", type: "number", required: true },
  ];

  const handlePropertySuccess = (data) => {
    if (data && typeof data === "object" && !Array.isArray(data)) {
      setProperties((prev) => [data, ...prev]);
    }
    setPropertyFormValues({ name: "", total_floors: "", total_rooms: "" });
  };

  const handleRoomSuccess = (data) => {
    if (data && typeof data === "object" && !Array.isArray(data)) {
      setRooms((prev) => [data, ...prev]);
    }
    setRoomFormValues({ property: "", room_number: "", active_tenants: "", max_occupants: "" });
  };

  const filteredProperties = properties.filter((p) =>
    p.name.toLowerCase().includes(searchProperties.toLowerCase())
  );

  const filteredRooms = rooms.filter((r) =>
    String(r.room_number).includes(searchRooms) ||
    String(r.property).includes(searchRooms)
  );

  // Fields to show in DisplayCard
  const propertyFields = [
    { key: "name", label: "Property" },
    { key: "total_rooms", label: "Rooms" },
    { key: "total_floors", label: "Floors" },
  ];

  const roomFields = [
    { key: "room_number", label: "Room Number" },
    { key: "active_tenants", label: "Active Tenants" },
    { key: "max_occupants", label: "Max Occupants" },
  ];

  return (
    <PageWrapper pageTitle="Rooms">
      <Box sx={{ width: "100%", boxSizing: "border-box" }}>
        <Tabs value={tabIndex} onChange={(e, val) => setTabIndex(val)} sx={{ mb: 3 }}>
          <Tab label="Rooms" />
          <Tab label="Properties" />
        </Tabs>

        {/* Rooms Tab */}
        {tabIndex === 0 && (
          <>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                maxWidth: 500,
                mx: "auto",
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Create Room
              </Typography>
              <FormComponent
                formConfig={roomFormConfig}
                apiUrl="/tenants/rooms/"
                formValues={roomFormValues}
                setFormValues={setRoomFormValues}
                onSuccess={handleRoomSuccess}
                submitLabel="Create Room"
              />
            </Paper>

            <Box sx={{ maxWidth: 700, mx: "auto", mb: 2 }}>
              <TextField
                placeholder="Search Rooms..."
                value={searchRooms}
                onChange={(e) => setSearchRooms(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box
              sx={{
                maxWidth: 700,
                mx: "auto",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 3,
                px: 2,
              }}
            >
              {filteredRooms.map((room) => (
                <DisplayCard
                  key={room.id}
                  file={{ ...room, file_url: room_logo }}
                  fields={roomFields}
                  showActions={false} // Disable hover view/download buttons here
                />
              ))}
            </Box>
          </>
        )}

        {/* Properties Tab */}
        {tabIndex === 1 && (
          <>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                maxWidth: 500,
                mx: "auto",
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Create Property
              </Typography>
              <FormComponent
                formConfig={propertyFormConfig}
                apiUrl="/tenants/properties/"
                formValues={propertyFormValues}
                setFormValues={setPropertyFormValues}
                onSuccess={handlePropertySuccess}
                submitLabel="Create Property"
              />
            </Paper>

            <Box sx={{ maxWidth: 700, mx: "auto", mb: 2 }}>
              <TextField
                placeholder="Search Properties..."
                value={searchProperties}
                onChange={(e) => setSearchProperties(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box
              sx={{
                maxWidth: 700,
                mx: "auto",
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 3,
                px: 2,
              }}
            >
              {filteredProperties.map((property) => (
                <DisplayCard
                  key={property.id}
                  file={{ ...property, file_url: property_logo }}
                  fields={propertyFields}
                  showActions={false} // Disable hover view/download buttons here
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </PageWrapper>
  );
};

export default PropertyRoomPage;
