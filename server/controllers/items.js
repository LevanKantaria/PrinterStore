import marketplaceItem from "../models/martketplaceItem.js";

export const getItems = async (req, res) => {
  const { category, subCategory, id } = req.query;

  try {
    // For customers, only show live products
    // For admins/makers, show all statuses
    const isAdmin = req.user?.isAdmin;
    
    // For non-admins: show products with status='live' OR products without status field (backward compatibility for old admin products)
    let statusFilter = {};
    if (!isAdmin) {
      statusFilter = {
        $or: [
          { status: 'live' },
          { status: { $exists: false } }, // Products without status field (old admin products)
          { status: null }, // Products with null status
        ]
      };
    }

    if (id) {
      const query = { _id: id, ...statusFilter };
      const marketplaceItems = await marketplaceItem.find(query);
      if (!marketplaceItems.length) {
        return res.status(404).json({ message: "Item not found." });
      }
      return res.status(200).json(marketplaceItems);
    }

    if (subCategory) {
      const query = { subCategory, ...statusFilter };
      const marketplaceItems = await marketplaceItem.find(query);
      return res.status(200).json(marketplaceItems);
    }

    if (category) {
      const query = { category, ...statusFilter };
      const marketplaceItems = await marketplaceItem.find(query);
      return res.status(200).json(marketplaceItems);
    }

    const marketplaceItems = await marketplaceItem.find(statusFilter);
    return res.status(200).json(marketplaceItems);
  } catch (error) {
    console.error("[items] getItems failed:", error);
    return res.status(500).json({ message: "Unable to load products." });
  }
};

export const listAllItems = async (_req, res) => {
  try {
    const items = await marketplaceItem.find({}).sort({ updatedAt: -1 });
    return res.json(items);
  } catch (error) {
    console.error("[items] listAllItems failed:", error);
    return res.status(500).json({ message: "Unable to load products." });
  }
};

// Maximum image size: 5MB (base64 encoded will be ~6.67MB)
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_BASE64_SIZE_BYTES = Math.floor(MAX_IMAGE_SIZE_BYTES * 1.34); // ~6.7MB for base64

const validateImageSizes = (images) => {
  if (!Array.isArray(images)) {
    return { valid: false, message: "Images must be an array." };
  }

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    if (typeof image !== 'string') {
      return { valid: false, message: `Image ${i + 1} must be a string (base64).` };
    }

    // Base64 strings start with data:image/...;base64,...
    // Calculate approximate original size from base64
    // Base64 encoding increases size by ~33%, so we check the base64 string size
    const base64Size = Buffer.byteLength(image, 'utf8');
    
    if (base64Size > MAX_BASE64_SIZE_BYTES) {
      const sizeMB = (base64Size / (1024 * 1024)).toFixed(2);
      return { 
        valid: false, 
        message: `Image ${i + 1} is too large (${sizeMB}MB). Maximum size is 5MB per image.` 
      };
    }
  }

  return { valid: true };
};

export const uploadItem = async (req, res) => {
  try {
    // Validate image sizes
    if (req.body.images) {
      const validation = validateImageSizes(req.body.images);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }
    }

    // Admin-created products should be live by default
    const itemData = {
      ...req.body,
      status: req.body.status || 'live', // Default to 'live' for admin products
    };
    const newItem = await marketplaceItem.create(itemData);
    return res.status(201).json(newItem);
  } catch (error) {
    console.error("[items] uploadItem failed:", error);
    return res.status(409).json({ message: error.message || "Unable to create product." });
  }
};

export const updateItem = async (req, res) => {
  const { id } = req.params;
  const updates = { ...req.body };
  delete updates._id;
  delete updates.createdAt;
  delete updates.updatedAt;

  try {
    // Validate image sizes if images are being updated
    if (updates.images) {
      const validation = validateImageSizes(updates.images);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.message });
      }
    }

    const updatedItem = await marketplaceItem.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.json(updatedItem);
  } catch (error) {
    console.error("[items] updateItem failed:", error);
    return res.status(500).json({ message: error.message || "Unable to update product." });
  }
};

export const deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await marketplaceItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Product not found." });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error("[items] deleteItem failed:", error);
    return res.status(500).json({ message: "Unable to delete product." });
  }
};
