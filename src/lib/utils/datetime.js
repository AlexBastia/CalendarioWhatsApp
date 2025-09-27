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

export const formatDate = (dateString, detailed = true) => {
	const date = new Date(dateString);
	const currentDate = new Date();
	let dateStr = '';

	const time = `${date.getHours()}:${date.getMinutes()}`;
	if (currentDate.getFullYear() !== date.getFullYear())
		dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	dateStr = `${abrMonth[date.getMonth()]} ${date.getDate()}`;

	if (detailed) dateStr += ` ${date.getHours()}:${date.getMinutes()}`;

  return dateStr;
};
