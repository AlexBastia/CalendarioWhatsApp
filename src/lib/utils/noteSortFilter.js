export const filterPreviews = (activeTagID, userTags, searchFilter, orderedPreviews) => {
  if (activeTagID) {
    const tag = userTags.find((tag) => tag._id === activeTagID);
    const tagFilteredPreviews = orderedPreviews.filter(({ _id }) => tag.noteIDs.includes(_id));

    if (searchFilter)
      return tagFilteredPreviews.filter(
        (preview) =>
          preview.title.toLowerCase().includes(searchFilter) || (preview.textStart &&
            preview.textStart.toLowerCase().includes(searchFilter))
      );
    return tagFilteredPreviews;
  } else
    return orderedPreviews.filter(
      (preview) =>
        preview.title.toLowerCase().includes(searchFilter) || (preview.textStart &&
          preview.textStart.toLowerCase().includes(searchFilter))
    );
};

export const sortPreviews = (sort, orderIsGrowing, notePreviews) => {
  const dateComp = (a, b) => {
    return a.timeCreation < b.timeCreation;
  };
  const alphaComp = (a, b) => {
    return a.title > b.title;
  };
  const lenComp = (a, b) => {
    return a.charNum > b.charNum;
  };

  let orderedPreviews;

  switch (sort) {
    case 'date':
      orderedPreviews = notePreviews.sort(dateComp);
      break;
    case 'alpha':
      orderedPreviews = notePreviews.sort(alphaComp);
      break;
    case 'len':
      orderedPreviews = notePreviews.sort(lenComp);
      break;
  }
  if (!orderIsGrowing) orderedPreviews = orderedPreviews.reverse();
  return orderedPreviews;
}