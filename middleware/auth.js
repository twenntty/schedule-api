const jwt = require("jsonwebtoken");

// Reads the JWT from an httpOnly cookie first, falling back to the
// Authorization header for backward compatibility.
const authMiddleware = (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Токена не існує, доступ заборонено" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Токен не дійсний" });
  }
};

// Role gate: use after authMiddleware, e.g. requireRole("admin", "institution").
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Немає доступу" });
  }
  next();
};

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
