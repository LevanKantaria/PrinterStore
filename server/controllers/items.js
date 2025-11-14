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

export const uploadItem = async (req, res) => {
  try {
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
