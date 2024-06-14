import { translate as translations } from '../translates'; // Adjust the path to your translations
import store from './../store/index';

const translate = (key) => {
  const state = store.getState();
  const lang = state.lang.lang;
  return translations[lang][key] || key;
};

export default translate;
