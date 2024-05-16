import jwt from "jsonwebtoken";

function generateTokenAndSetCookie(_id, response) {
  const token = jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  response.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
}

export default generateTokenAndSetCookie;
