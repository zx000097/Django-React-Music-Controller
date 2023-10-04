import { Grid, Button, ButtonGroup, Typography } from "@mui/material";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Room from "./Room";
import axios from "axios";
import React, { useState, useEffect } from "react";

const renderHomePage = () => {
  return (
    <Grid container spacing={3} align="center">
      <Grid item xs={12}>
        <Typography variant="h3" compact="h3">
          House Party
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <ButtonGroup disableElevation variant="contained" color="primary">
          <Button color="primary" to="/join" component={Link}>
            Join a Room
          </Button>
          <Button color="secondary" to="/create" component={Link}>
            Create a Room
          </Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

const HomePageOrRoom = () => {
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    axios.get("/api/user-in-room/").then((response) => {
      setRoomCode(response.data.code);
      console.log(roomCode);
    });
  }, []);

  return roomCode ? <Navigate to={`/room/${roomCode}`} /> : renderHomePage();
};

function HomePage() {
  const [roomCode, setRoomCode] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePageOrRoom />} />
        <Route path="/join" Component={RoomJoinPage} />
        <Route path="/create" Component={CreateRoomPage} />
        <Route path="/room/:roomCode" Component={Room} />
      </Routes>
    </BrowserRouter>
  );
}

export default HomePage;
