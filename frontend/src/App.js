import logo from "./logo.svg";
import "./App.css";
import HomePage from "./HomePage";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import { BrowserRouter, Routes, Route, Link, Redirect } from "react-router-dom";
import Room from "./Room";
import axios from "axios";
import React, { useState, useEffect } from "react";

function App() {
  const [roomCode, setRoomCode] = useState(null);
  useEffect(() => {
    async function getRoom() {
      const response = await axios.get("/api/user-in-room");
      const data = response.data;
      setRoomCode(data.code);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/join" Component={RoomJoinPage} />
        <Route path="/create" Component={CreateRoomPage} />
        <Route path="/room/:roomCode" Component={Room} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
