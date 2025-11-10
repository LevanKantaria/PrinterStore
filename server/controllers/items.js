import marketplaceItem from "../models/martketplaceItem.js";

export const getItems = async (req, res) => {
  const { category, subCategory, id } = req.query;

  try {
    if (id) {
      const marketplaceItems = await marketplaceItem.find({ _id: id });
      if (!marketplaceItems.length) {
        return res.status(404).json({ message: "Item not found." });
      }
      return res.status(200).json(marketplaceItems);
    }

    if (subCategory) {
      const marketplaceItems = await marketplaceItem.find({ subCategory });
      return res.status(200).json(marketplaceItems);
    }

    if (category) {
      const marketplaceItems = await marketplaceItem.find({ category });
      return res.status(200).json(marketplaceItems);
    }

    const marketplaceItems = await marketplaceItem.find({});
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
    const newItem = await marketplaceItem.create(req.body);
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
