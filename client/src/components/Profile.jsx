import React from "react";
import { useContext, useEffect } from "react";
import { UserContext } from "../state/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Chat from "./Chat";

function Profile() {
  const navigate = useNavigate();
  const { userID, setUserID, userName, setUserName } = useContext(UserContext);

  useEffect(() => {
    if (!userName) {
      navigate("/");
    }
  }, [userName]);

  useEffect(() => {
    axios
      .get("/profile")
      .then((response) => {
        // console.log(response);

        setUserName(response.data.username);
        setUserID(response.data._id);
      })
      .catch((err) => {
        console.log(err);
        navigate("/");
      });
  }, []);
  return (
    <div>
      <>
        <Chat />
      </>
    </div>
  );
}

export default Profile;
