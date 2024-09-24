import { Button, TextField } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Avatar from "./Avatar";
import { uniqBy } from "lodash";
import { UserContext } from "../state/UserContext";
import { useRef } from "react";
import axios from "axios";
import Contact from "./Contact";
function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setnewMessageText] = useState("");
  const { userName, userID, setUserID, setUserName } = useContext(UserContext);

  const divUnderMessages = useRef();

  const [messages, setmessages] = useState([]);

  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  useEffect(() => {
    console.log("change in userID  => " + selectedUserId);
  }, [selectedUserId]);

  const onlinePeobleExcludeMe = { ...onlinePeople };
  delete onlinePeobleExcludeMe[userID];
  const messagesWithoutDupes = uniqBy(messages, "_id");

  function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();

    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );
    if (file) {
      console.log("get messgaes");
      setTimeout(() => {
        axios.get("/messages/" + selectedUserId).then((res) => {
          const { data } = res;
          console.log(data);
          setmessages(data);
        });
      }, 400);
    } else {
      setnewMessageText("");
      setmessages((pre) => [
        ...pre,
        {
          text: newMessageText,
          sender: userID,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    axios.get("/messages/" + selectedUserId).then((res) => {
      const { data } = res;
      setmessages(data);
    });
  }, [selectedUserId]);

  function handleMessage(e) {
    console.log(selectedUserId);
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      // if (selectedUserId == messageData.sender) {
      //   setmessages((prev) => [...prev, { ...messageData }]);
      // } else {
      //   console.log(selectedUserId, messageData.sender);
      // }
      if (messageData.sender === selectedUserId) {
        console.log(messageData.sender, "=>", selectedUserId);
        setmessages((prev) => [...prev, { ...messageData }]);
      }
    }
  }
  function connectToWs() {
    console.log(selectedUserId);
    const ws = new WebSocket("ws://127.0.0.1:5050");
    setWs(ws);
    ws.addEventListener("message", (e) => {
      handleMessage(e);
      console.log(selectedUserId);
    });
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("disconnected . Trying tom reconnect");
        connectToWs();
      }, 1000);
    });
  }
  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== userID)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  function logout() {
    axios.post("/logout").then(() => {
      setWs(null);
      setUserID(null);
      setUserName(null);
    });
  }
  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  }

  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 flex flex-col">
        <div className="flex-grow">
          <div className="text-blue-600 font-bold flex gap-2 p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6">
              <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
              <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
            </svg>
            MernChat
          </div>
          {Object.keys(onlinePeobleExcludeMe).map((userid, indx) => {
            return (
              <Contact
                key={indx}
                id={userid}
                online={true}
                username={onlinePeobleExcludeMe[userid]}
                onClick={() => {
                  setSelectedUserId(userid);
                  console.log({ userid });
                }}
                selected={userid === selectedUserId}
              />
            );
          })}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
        </div>

        <div className="p-2 text-center flex items-center justify-center">
          <span className="mr-2 text-sm text-gray-600 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
            {userName}
          </span>
          <button
            onClick={logout}
            className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm">
            logout
          </button>
        </div>
      </div>

      <div className=" flex flex-col bg-blue-100 w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="text-gray-400">
                {" "}
                &larr; Select a Person from the sidebar
              </div>
            </div>
          )}
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {messagesWithoutDupes.map((message, indx) => {
                  return (
                    <div
                      key={indx}
                      className={
                        message.sender === userID ? "text-right" : "text-left"
                      }>
                      <div
                        key={message._id}
                        className={
                          "text-left inline-block p-2 my-2 rounded-md text-sm " +
                          (message.sender === userID
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-500")
                        }>
                        {message.text}
                        {message.file && (
                          <div className="">
                            <a
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 border-b"
                              href={
                                "http://127.0.0.1:5050" +
                                "/uploads/" +
                                message.file
                              }>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4">
                                <path
                                  fillRule="evenodd"
                                  d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {message.file}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={divUnderMessages}></div>
              </div>
            </div>
          )}
        </div>

        {!!selectedUserId && (
          <form className="flex gap-2 p-2" onSubmit={sendMessage}>
            <input
              value={newMessageText}
              onChange={(ev) => setnewMessageText(ev.target.value)}
              type="text"
              placeholder="type your message here"
              className="bg-white flex-grow border p-2"
            />
            <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer flex justify-center rounded-sm border border-blue-200">
              <input type="file" className="hidden" onChange={sendFile} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6">
                <path
                  fillRule="evenodd"
                  d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.94 10.94a3.75 3.75 0 105.304 5.303l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a5.25 5.25 0 11-7.424-7.424l10.939-10.94a3.75 3.75 0 115.303 5.304L9.097 18.835l-.008.008-.007.007-.002.002-.003.002A2.25 2.25 0 015.91 15.66l7.81-7.81a.75.75 0 011.061 1.06l-7.81 7.81a.75.75 0 001.054 1.068L18.97 6.84a2.25 2.25 0 000-3.182z"
                  clipRule="evenodd"
                />
              </svg>
            </label>
            <Button
              type="submit"
              className="bg-blue-500 p-2 text-white"
              sx={{
                backgroundColor: "rgb(59 130 246 / var(--tw-bg-opacity))",
                color: "white",
                padding: "0.5rem",
                "&:hover": {
                  backgroundColor: "white",
                  color: "red",
                  fontWeight: "600",
                },
              }}>
              Send
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
export default Chat;
