import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(req);
  
  const token = authHeader && authHeader.split(" ")[1];

  if (token === undefined) {
    return res.status(401).send("No token provided");
  }
  
  try {
    verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifiedUser;
    next();
  } catch (error) {
    res.status(403).json({ error: "Something broke" + error.message });
  }
};
