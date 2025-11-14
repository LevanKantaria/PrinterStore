import { translate as translations } from '../translates'; // Adjust the path to your translations
import store from './../store/index';

// Normalize category/subcategory IDs for translation (e.g., "good-to-haves" -> "goodtohaves")
const normalizeCategoryKey = (key) => {
  if (key && key.includes('categories.')) {
    const categoryId = key.replace('categories.', '');
    // Map known variations
    if (categoryId === 'good-to-haves') {
      return 'categories.goodtohaves';
    }
  }
  return key;
};

const translate = (key) => {
  const state = store.getState();
  const lang = state.lang.lang;
  const normalizedKey = normalizeCategoryKey(key);
  return translations[lang][normalizedKey] || key;
};

export default translate;
