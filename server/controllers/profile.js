import Profile from "../models/profile.js";

const pickProfileFields = (payload = {}) => {
  const {
    displayName,
    phone,
    company,
    shippingAddress,
    billingAddress,
    preferences,
  } = payload;

  const normalizeAddress = (address) =>
    address
      ? {
          fullName: address.fullName,
          company: address.company,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          phone: address.phone,
        }
      : undefined;

  return {
    ...(displayName !== undefined ? { displayName } : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(company !== undefined ? { company } : {}),
    ...(shippingAddress !== undefined ? { shippingAddress: normalizeAddress(shippingAddress) } : {}),
    ...(billingAddress !== undefined ? { billingAddress: normalizeAddress(billingAddress) } : {}),
    ...(preferences !== undefined ? { preferences } : {}),
  };
};

export const getProfile = async (req, res) => {
  const userId = req.user.uid;

  try {
    let profile = await Profile.findOne({ userId });

    if (!profile) {
      profile = await Profile.create({
        userId,
        email: req.user.email || "",
        displayName: req.user.displayName || "",
      });
    }

    return res.json(profile);
  } catch (error) {
    console.error("[profile] getProfile failed:", error);
    return res.status(500).json({ message: "Unable to load profile." });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user.uid;

  try {
    const updates = pickProfileFields(req.body);
    if (req.user.email && !updates.email) {
      updates.email = req.user.email;
    }

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updates, $setOnInsert: { email: req.user.email || "" } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json(profile);
  } catch (error) {
    console.error("[profile] updateProfile failed:", error);
    return res.status(500).json({ message: "Unable to update profile." });
  }
};

