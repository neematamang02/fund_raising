import jwt from "jsonwebtoken";

export default function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to the request
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token is not valid" });
  }
}
