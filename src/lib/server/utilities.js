import { PREVIEW_MAX_LEN } from "./constants";
// https://stackoverflow.com/a/53637828
export const truncateNoteText = (str) => {
  const num = PREVIEW_MAX_LEN;
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

// Time and Date

export const getCurrTime = () => {
  return new Date();
};


