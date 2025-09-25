// Date utilities
const abrMonth = [
  'Gen',
  'Feb',
  'Mar',
  'Apr',
  'Mag',
  'Giu',
  'Lug',
  'Ago',
  'Set',
  'Ott',
  'Nov',
  'Dic'
];

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const currentDate = new Date();

  const time = `${date.getHours()}:${date.getMinutes()}`;
  if (currentDate.getFullYear() !== date.getFullYear())
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  return `${abrMonth[date.getMonth()]} ${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
};