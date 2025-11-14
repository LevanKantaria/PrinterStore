import admin from "../firebaseAdmin.js";

const configuredAdminUids = (process.env.FACTORYL_ADMIN_UIDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

const adminUidSet = new Set(configuredAdminUids);

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or invalid." });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!admin || !admin.apps.length) {
      throw new Error("Firebase admin is not initialized.");
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const isAdmin =
      decoded.admin === true ||
      decoded.role === "admin" ||
      adminUidSet.has(decoded.uid);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name,
      isAdmin,
      firebaseClaims: decoded,
    };

    next();
  } catch (error) {
    console.error("[auth] Token validation failed:", error);
    return res.status(401).json({ message: "Authentication failed." });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Administrator access required." });
  }
  return next();
};

