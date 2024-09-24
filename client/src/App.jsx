import "./App.css";
import Register from "./components/Register";
import { UserContext, UsercontextProvider } from "./state/UserContext";
import { useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";
import Profile from "./components/Profile";
function App() {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = "http://127.0.0.1:5050/n";

  return (
    <>
      <UsercontextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Register />}></Route>
            <Route path="/profile" element={<Profile />}></Route>
          </Routes>
        </BrowserRouter>
      </UsercontextProvider>
    </>
  );
}

export default App;
