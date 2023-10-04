import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Room(props) {
  let params = useParams();
  const [state, setState] = useState({
    votesToSkip: 2,
    guestCanPause: false,
    isHost: false,
  });

  useEffect(() => {
    getRoom();
  }, []);

  const getRoom = () => {
    axios
      .get("/api/get-room/" + "?code=" + params.roomCode)
      .then((response) => {
        setState({
          votesToSkip: response.data.votes_to_skip,
          guestCanPause: response.data.guest_can_pause,
          isHost: response.data.is_host,
        });
        console.log(state);
      });
  };

  return (
    <div>
      <h3>{params.roomCode}</h3>
      <p>Votes: {state.votesToSkip}</p>
      <p>Guest Can Pause : {state.guestCanPause.toString()}</p>
      <p>Host: {state.isHost.toString()}</p>
    </div>
  );
}
