import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Grid, Button, Typography } from "@mui/material";

export default function Room(props) {
  let params = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
  });
  const leaveButtonPressed = () => {
    axios.post("/api/leave-room").then((_response) => navigate("/"));
  };

  useEffect(() => {
    getRoom();
  }, []);

  const getRoom = () => {
    axios
      .get("/api/get-room/?code=" + params.roomCode)
      .then((response) => {
        setState({
          roomCode: response.data.code,
          votesToSkip: response.data.votes_to_skip,
          guestCanPause: response.data.guest_can_pause,
          isHost: response.data.is_host,
        });
        console.log(state);
      })
      .catch(function (error) {
        if (error.response.status === 404) {
          navigate("/");
        }
      });
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Code: {state.roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">
          Votes To Skip: {state.votesToSkip}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">
          Guest Can Pause: {state.guestCanPause.toString()}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">
          Host: {state.isHost.toString()}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={leaveButtonPressed}
        >
          Leave Room
        </Button>
      </Grid>
    </Grid>
  );
}
