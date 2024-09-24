module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch((err) => {
      console.log("error async");
      next(err);
    });
  };
};
