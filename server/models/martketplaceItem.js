import mongoose from "mongoose";

const marketplaceItemSchema = mongoose.Schema({
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
  
});

const marketplaceItem = mongoose.model("marketplaceItem", marketplaceItemSchema);

export default marketplaceItem;
