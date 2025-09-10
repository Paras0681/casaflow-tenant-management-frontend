// src/pages/PropertyRoomPage.js
import React, { useState, useEffect } from "react";
import PageWrapper from "./PageWrapper";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import api from "../api";

const PropertyRoomPage = () => {
  const [tab, setTab] = useState(1); // default to "Create Property"
  const [properties, setProperties] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [property, setProperty] = useState({
    name: "",
    address: "",
    total_floors: 0,
    total_rooms: 0
  });

  const [room, setRoom] = useState({
    property: "",
    room_number: "",
    active_tenants: 0,
    max_occupants: 1,
  });

  // Fetch existing data
  useEffect(() => {
    fetchProperties();
    fetchRooms();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await api.get("/tenants/properties/");
      setProperties(res.data);
    } catch (err) {
        console.error("Error fetching properties", err);
        setProperties([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get("/tenants/rooms/");
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms", err);
      setRooms([]);
    }
  };

  const handlePropertyChange = (e) => {
    setProperty({ ...property, [e.target.name]: e.target.value });
  };

  const handleRoomChange = (e) => {
    setRoom({ ...room, [e.target.name]: e.target.value });
  };

    const handleCreateProperty = async () => {
  try {
    const res = await api.post("/tenants/properties/", property);

    if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
      setProperties((prev) => [...prev, res.data]); // append
    }

    alert("Property created successfully!");
    setProperty({ name: "", address: "", total_floors: 0, total_rooms: 0 });
  } catch (err) {
    console.error(err);
    alert("Error creating property");
  }
};

const handleCreateRoom = async () => {
  try {
    if (!room.property) {
      alert("Please select a property first.");
      return;
    }
    const res = await api.post("/tenants/rooms/", room);

    if (res.data && typeof res.data === "object" && !Array.isArray(res.data)) {
      setRooms((prev) => [...prev, res.data]); // append
    }

    alert("Room created successfully!");
    setRoom({ property: "", room_number: "", active_tenants: 0, max_occupants: 1 });
  } catch (err) {
    console.error(err);
    alert("Error creating room");
  }
};

  return (
    <PageWrapper>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Paper sx={{ p: 4, maxWidth: 800, width: "100%" }}>
          <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} centered>
            <Tab label="Create Room" value={0} />
            <Tab label="Create Property" value={1} />
          </Tabs>

          {/* Create Room Tab */}
          {tab === 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h5" gutterBottom>
                Create Room
              </Typography>
              <TextField
                select
                label="Select Property"
                name="property"
                fullWidth
                margin="normal"
                value={room.property}
                onChange={handleRoomChange}
              >
                {properties.length === 0 ? (
                  <MenuItem disabled>No properties available</MenuItem>
                ) : (
                  properties.map((prop) => (
                    <MenuItem key={prop.id} value={prop.id}>
                      {prop.name} — {prop.address}
                    </MenuItem>
                  ))
                )}
              </TextField>

              <TextField
                label="Room Number"
                name="room_number"
                fullWidth
                margin="normal"
                value={room.room_number}
                onChange={handleRoomChange}
              />
              <TextField
                label="Active Tenants"
                name="active_tenants"
                type="number"
                fullWidth
                margin="normal"
                value={room.active_tenants}
                onChange={handleRoomChange}
              />
              <TextField
                label="Max Occupants"
                name="max_occupants"
                type="number"
                fullWidth
                margin="normal"
                value={room.max_occupants}
                onChange={handleRoomChange}
              />
              <Button variant="contained" sx={{ mt: 3 }} onClick={handleCreateRoom}>
                Create Room
              </Button>

              {/* Existing Rooms */}
              <Typography variant="h6" sx={{ mt: 4 }}>
                Existing Rooms
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                {rooms.map((r) => (
                  <Card key={r.id} sx={{ width: 250 }}>
                    <CardContent>
                      <Typography variant="h7">Room no: {r.room_number}</Typography>
                      <Typography variant="body2">
                        Property ID: {r.property}<br/>
                        Active Tenants: {r.active_tenants}<br/>
                        Max Tenants: {r.max_occupants}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Create Property Tab */}
          {tab === 1 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h5" gutterBottom>
                Create Property
              </Typography>
              <TextField
                label="Property Name"
                name="name"
                fullWidth
                margin="normal"
                value={property.name}
                onChange={handlePropertyChange}
              />
              <TextField
                label="Address"
                name="address"
                fullWidth
                margin="normal"
                value={property.address}
                onChange={handlePropertyChange}
              />
              <TextField
                label="Total Floors"
                name="total_floors"
                type="number"
                fullWidth
                margin="normal"
                value={property.total_floors}
                onChange={handlePropertyChange}
              />
              <TextField
                label="Total Rooms"
                name="total_rooms"
                type="number"
                fullWidth
                margin="normal"
                value={property.total_rooms}
                onChange={handlePropertyChange}
              />
              <Button variant="contained" sx={{ mt: 3 }} onClick={handleCreateProperty}>
                Create Property
              </Button>

              {/* Existing Properties */}
              <Typography variant="h6" sx={{ mt: 4 }}>
                Existing Properties
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                {properties.map((p) => (
                  <Card key={p.id} sx={{ width: 250 }}>
                    <CardContent>
                      <Typography variant="h7">Name: {p.name}</Typography>
                      <Typography variant="body2">Address: {p.address}</Typography>
                      <Typography variant="body2">Floors: {p.total_floors}</Typography>
                      <Typography variant="body2">Rooms: {p.total_rooms}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </PageWrapper>
  );
};

export default PropertyRoomPage;
