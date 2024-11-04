import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token;
  

  if (token === undefined) {
    return res.status(401).send("No token provided");
  }
  
  try {
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifiedUser;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(403).json({ error: "Invalid token"});
  }
};
