const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  const token = req.headers["auth-token"];
  // console.log(token2)
  // const token = req.headers.authorization.split(" ")[1];
  // console.log("authorization: ", token);
  if (!token) return res.status(401).send("Access denied");

  try {
    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!verified) return res.sendStatus(403);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).send(err);
  }
}
module.exports = {
  authenticate,
};
