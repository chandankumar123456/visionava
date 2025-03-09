import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed: Invalid token format' });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: decoded.id };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: 'Server error' });
  }
};