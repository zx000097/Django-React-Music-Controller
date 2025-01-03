import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Grid, Button, Typography } from "@mui/material";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

export default function Room(props) {
  let params = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
    showSettings: false,
  });
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [song, setSong] = useState([]);

  const leaveButtonPressed = () => {
    axios.post("/api/leave-room").then((_response) => navigate("/"));
  };

  const updateShowSettings = (value) => {
    setState((prevState) => {
      return {
        ...prevState,
        showSettings: value,
      };
    });
  };

  const renderSettingsButton = () => {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  };

  const renderSettings = () => {
    return (
      <Grid container spacing={1} align="center">
        <Grid item xs={12}>
          <CreateRoomPage
            update={true}
            votesToSkip={state.votesToSkip}
            guestCanPause={state.guestCanPause}
            roomCode={state.roomCode}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              updateShowSettings(false);
              getRoom();
            }}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  };

  useEffect(() => {
    let interval = setInterval(getCurrentSong, 1000);
    return () => clearInterval(interval);
  });

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

        console.log(response);
        console.log(state.isHost);

        if (response.data.is_host) {
          authenticateSpotify();
        }
      })
      .catch(function (error) {
        if (error.response.status === 404) {
          navigate("/");
        }
      });
  };

  const authenticateSpotify = () => {
    axios.get("/spotify/is-authenticated").then((response) => {
      setSpotifyAuthenticated(response.data.status);
      if (!response.data.status) {
        console.log(response.data);
        axios.get("/spotify/get-auth-url").then((response) => {
          window.location.replace(response.data.url);
        });
      }
    });
  };

  const getCurrentSong = () => {
    axios.get("/spotify/current-song").then((response) => {
      setSong(response.data);
      console.log(response.data);
    });
  };

  if (state.showSettings) {
    return renderSettings();
  }
  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Code: {state.roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <MusicPlayer {...song} />
      </Grid>
      {state.isHost ? renderSettingsButton() : null}
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
