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

// Optional auth: populate req.user if a valid token is present, never rejects.
// Lets public read endpoints auto-scope to the logged-in institution.
const softAuth = (req, res, next) => {
  const token = req.cookies?.token || req.header("Authorization")?.split(" ")[1];
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET); } catch (e) { /* ignore */ }
  }
  next();
};

// Resolve the institution scope for a request:
// logged-in user's institution, else an explicit ?institution= for public reads.
const scopeInstitution = (req) => req.user?.institution || req.query.institution || null;

// Role gate: use after authMiddleware, e.g. requireRole("admin", "institution").
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Немає доступу" });
  }
  next();
};

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
module.exports.softAuth = softAuth;
module.exports.scopeInstitution = scopeInstitution;
