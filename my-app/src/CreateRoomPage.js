import React, { useState } from "react";
import {
  Typography,
  Button,
  Grid,
  TextField,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Collapse } from "@mui/material";

export default function CreateRoomPage(props) {
  const [guestCanPause, setGuestCanPause] = useState(props.guestCanPause);
  const [votesToSkip, setVotesToSkip] = useState(props.votesToSkip);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const handleRoomButtonPressed = () => {
    const requestData = {
      votes_to_skip: votesToSkip,
      guest_can_pause: guestCanPause,
    };
    axios
      .post("/api/create-room/", requestData)
      .then((response) => navigate("/room/" + response.data.code));
  };
  const handleUpdateButtonPressed = () => {
    const requestData = {
      votes_to_skip: votesToSkip,
      guest_can_pause: guestCanPause,
      code: props.roomCode,
    };
    axios
      .patch("/api/update-room/", requestData)
      .then((response) => {
        setMsg("Room updated successfully!");
      })
      .catch((error) => {
        setMsg("Error updating room...");
      });
  };
  const renderCreateButtons = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={handleRoomButtonPressed}
          >
            Create A Room
          </Button>
        </Grid>
        <Grid item xs={12} align="center">
          <Button color="secondary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  };
  const renderUpdateButtons = () => {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Button
            color="primary"
            variant="contained"
            onClick={handleUpdateButtonPressed}
          >
            Update Room
          </Button>
        </Grid>
      </Grid>
    );
  };

  const title = props.update ? "Update Room" : "Create a Room";
  const alertSeverity = msg.includes("error") ? "error" : "success";

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Collapse in={msg != ""}>
          <Alert severity={alertSeverity} onClose={() => setMsg("")}>
            {msg}
          </Alert>
        </Collapse>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          {title}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl component="fieldset">
          <FormHelperText>
            <div align="center">Guest Control of Playback State</div>
          </FormHelperText>
          <RadioGroup
            row
            defaultValue={props.guestCanPause.toString()}
            onChange={(e) => setGuestCanPause(e.target.value === true)}
          >
            <FormControlLabel
              value={true}
              control={<Radio color="primary" />}
              label="Play/Pause"
              labelPlacement="bottom"
            />
            <FormControlLabel
              value={false}
              control={<Radio color="secondary" />}
              label="No Control"
              labelPlacement="bottom"
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl>
          <TextField
            required={true}
            type="number"
            defaultValue={votesToSkip}
            inputProps={{
              min: 1,
              style: { textAlign: "center" },
            }}
            onChange={(e) => setVotesToSkip(e.target.value)}
          />
          <FormHelperText>
            <div align="center">Votes Required To Skip Song</div>
          </FormHelperText>
        </FormControl>
      </Grid>
      {props.update ? renderUpdateButtons() : renderCreateButtons()}
    </Grid>
  );
}

CreateRoomPage.defaultProps = {
  votesToSkip: 2,
  guestCanPause: true,
  update: false,
  roomCode: null,
};
