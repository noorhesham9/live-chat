const CustomError = require("../utils/CustomError");

const prodErrors = (res, error) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
  });
};

const castErrorHandler = (err) => {
  const msg = `Invalid value for ${err.path} : ${err.value}`;
  return new CustomError(msg, 400);
};
const dublicateKeyHandler = (err) => {
  console.log(err.keyValue.username);
  const name = err.keyValue.username;
  const msg = `there is already a user with name ${name}. please use another name!`;
  return new CustomError(msg, 400);
};
const validationErrorHandler = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const errorMessage = errors.join(". ");
  const msg = `Invalid input data : ${errorMessage}`;
  return new CustomError(msg, 400);
};

const devErrors = (res, error) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

const handleExpireJWT = () => {
  return new CustomError("JWT has expired. please login again!", 401);
};
const handleJWTError = () => {
  return new CustomError("invalid token. please login again", 401);
};
module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 502;
  error.status = error.status || "error";
  // console.log(process.env.NODE_ENV);

  if (error.name === "CastError") {
    error = castErrorHandler(error);
  }
  if (error.code === 11000) {
    error = dublicateKeyHandler(error);
  }
  if (error.name === "ValidationError") {
    error = validationErrorHandler(error);
  }
  if (error.name === "TokenExpiredEror") {
    error = handleExpireJWT(error);
  }
  if (error.name === "JsonWebTokenError") {
    error = handleJWTError(error);
  }

  prodErrors(res, error);
};
