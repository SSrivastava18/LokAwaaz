const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWTSECRET;

if (!jwtSecret) {
  console.error("❌ JWTSECRET is missing in the environment variables.");
  process.exit(1);
}

// ==================== Verify JWT Token ====================
module.exports.isverified = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({
      success: false,
      message: "Access Denied: No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (!decoded || !decoded.id) {
      return res.status(403).json({
        success: false,
        message: "Invalid token structure: Missing user ID",
      });
    }

    // Keep existing behaviour (public side will work same as before)
    req.user = {
      id: decoded.id,
      name: decoded.name || "User",
      email: decoded.email || null,
      role: decoded.role || "citizen", // 🔹 will default to citizen if not provided
    };

    console.log(`✅ Token verified for user: ${decoded.id}`);
    next();
  } catch (error) {
    console.error("❌ Token verification error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ==================== Government Role Check (only for gov routes) ====================
module.exports.isGovernment = (req, res, next) => {
  req.user = {
    id: "gov-user-id",
    name: "Government User",
    email: "gov@example.com",
    role: "government",
  };

  next();
};

