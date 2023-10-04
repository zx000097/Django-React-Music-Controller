import { TextField, Button, Grid, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";

export default function RoomJoinPage() {
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const roomButtonPressed = () => {
    const requestData = {
      code: roomCode,
    };

    axios
      .post("/api/join-room/", requestData)
      .then((response) => {
        navigate("/room/" + requestData.code);
      })
      .catch((error) => {
        console.log(error);
        setError("Room not found.");
      });
  };
  return (
    <Grid container spacing={1} align="center">
      <Grid item xs={12}>
        <Typography variant="h4" component="h4">
          Join a Room
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          error={error}
          label="Code"
          placeholder="Enter a Room Code"
          value={roomCode}
          helperText={error}
          variant="outlined"
          onChange={(e) => setRoomCode(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={roomButtonPressed}>
          Enter Room
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="secondary" to="/" component={Link}>
          Back
        </Button>
      </Grid>
    </Grid>
  );
}
