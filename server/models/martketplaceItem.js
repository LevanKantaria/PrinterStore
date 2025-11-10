import mongoose from "mongoose";

const marketplaceItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    maxlength: 55,
  },
  category: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    maxlength: 15,
  },
  subCategory: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    maxlength: 15,
  },
  images: {
    type: Array,
    required: true,
    minlength: 3,
    trim: true,
  },
  colors: {
    type: [String],
    default: [],
  },

  price: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    maxlength: 15,
  },

  creator: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    maxlength: 15,
  },
  description: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
    maxlength: 550,
  },
}, { timestamps: true });

const marketplaceItem = mongoose.model("marketplaceItem", marketplaceItemSchema);

export default marketplaceItem;
