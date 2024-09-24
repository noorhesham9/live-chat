import { Formik } from "formik";
import * as yup from "yup";
import { useContext, useEffect } from "react";
import { UserContext } from "../state/UserContext";
import { Button, TextField, Typography } from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const LoginSchema = yup.object().shape({
  username: yup.string().required("required"),
  password: yup.string().required("required"),
});

const initialValuesLogin = {
  username: "",
  password: "",
};

function Register() {
  const [error, setError] = useState(null);
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");
  const navigate = useNavigate();
  const { userName, setUserID, setUserName } = useContext(UserContext);

  useEffect(() => {
    if (userName) {
      navigate("/profile");
    }
  }, [userName]);

  const handleFormSubmitRegister = async (values, onSubmitProps) => {
    axios
      .post("/register", values, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        setUserID(response.data.user._id);
        setUserName(response.data.user.username);
        setError(null);
        onSubmitProps.resetForm();
        navigate("/profile");
      })
      .catch((errorr) => {
        setError(errorr.response.data.message);
      });
  };

  //looooogin
  const handleFormSubmitLogin = async (values, onSubmitProps) => {
    await axios
      .post("/login", values, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        setUserID(response.data.user._id);
        setUserName(response.data.user.username);
        setError(null);
        onSubmitProps.resetForm();
        navigate("/profile");
      })
      .catch((errorr) => {
        setError(errorr.response.data.message);
      });
  };

  return (
    <Formik
      onSubmit={
        isLoginOrRegister === "register"
          ? handleFormSubmitRegister
          : handleFormSubmitLogin
      }
      initialValues={initialValuesLogin}
      validationSchema={LoginSchema}>
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
      }) => {
        return (
          <div className="bg-blue-50 h-screen justify-center flex items-center">
            <form onSubmit={handleSubmit} className="w-64 max-auto mb-12">
              <Typography
                sx={{
                  fontSize: "20px",
                  textAlign: "center",
                  paddingBottom: "10px",
                  fontWeight: "700",
                }}>
                Welcome To live Chat
              </Typography>
              <Typography
                sx={{
                  fontSize: "20px",
                  textAlign: "center",
                  paddingBottom: "10px",
                  fontWeight: "700",
                }}>
                {isLoginOrRegister === "login" ? "Login" : "Register"} Now
              </Typography>
              <TextField
                value={values.username}
                type="text"
                name="username"
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="username"
                sx={{
                  paddingBottom: "10px",
                }}
                className="block w-full rounded-sm p-2 mb-2 border  "
                error={Boolean(error)}
                helperText={error}
              />
              <TextField
                value={values.password}
                type="password"
                name="password"
                sx={{
                  paddingBottom: "10px",
                }}
                onChange={handleChange}
                placeholder="password"
                className="block w-full rounded-sm p-2 mb-2 border "
                error={Boolean(touched.firstName) && Boolean(errors.firstName)}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white block w-full rounded-sm p-2">
                {isLoginOrRegister === "register" ? "Register" : "Login"}
              </button>
              {isLoginOrRegister === "register" && (
                <div>
                  Already a member?
                  <button
                    className="ml-1"
                    onClick={() => setIsLoginOrRegister("login")}>
                    Login here
                  </button>
                </div>
              )}
              {isLoginOrRegister === "login" && (
                <div>
                  Dont have an account?
                  <Button
                    className="ml-1"
                    onClick={() => setIsLoginOrRegister("register")}>
                    Register
                  </Button>
                </div>
              )}
            </form>
          </div>
        );
      }}
    </Formik>
  );
}

export default Register;
