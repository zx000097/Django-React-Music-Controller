import React, { Component } from "react";
import {
  Grid,
  Typography,
  Card,
  Iconbutton,
  LinearProgress,
  IconButton,
} from "@mui/material";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import axios from "axios";

const pauseSong = () => {
  axios.put("/spotify/pause");
};

const playSong = () => {
  axios.put("/spotify/play");
};

const skipSong = () => {
  axios.post("/spotify/skip");
};

export default function MusicPlayer(props) {
  const songProgress = (props.time / props.duration) * 100;

  return (
    <Card>
      <Grid container alignItems="center">
        <Grid item align="center" xs={4}>
          <img src={props.image_url} height="100%" width="100%" />
        </Grid>
        <Grid item align="center" xs={8}>
          <Typography component="h5" variant="h5">
            {props.title}
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            {props.artist}
          </Typography>
          <div>
            <IconButton
              disabled={!props.can_play_pause}
              onClick={props.is_playing ? pauseSong : playSong}
            >
              {props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <IconButton onClick={skipSong}>
              <SkipNextIcon />
            </IconButton>
          </div>
          {props.votes} / {props.votes_required}
        </Grid>
      </Grid>
      <LinearProgress variant="determinate" value={songProgress} />
    </Card>
  );
}
