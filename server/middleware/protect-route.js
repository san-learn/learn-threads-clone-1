import jwt from "jsonwebtoken";

import User from "../models/user.js";

export async function protectRoute(request, response, next) {
  try {
    const token = request.cookies.jwt;

    if (!token) {
      return response.status(401).json({ message: "Unauthorized" });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(verified._id).select("-password");

    request.user = user;

    next();
  } catch (error) {
    response.status(500).json({ message: error.message });

    console.log(`Failed to protect route: ${error.message}`);
  }
}
