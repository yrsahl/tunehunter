const getOrdinalSuffix = (day: number) => {
  if (day > 3 && day < 21) return "th"; // covers 4th-20th
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const formatDate = (date: Date, dayOnly = true, shortForm = false) => {
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ordinalSuffix = getOrdinalSuffix(day);

  const formattedDate = shortForm
    ? `${month} ${day}${ordinalSuffix}, ${year}`
    : `${day}${ordinalSuffix} of ${month}, ${year}`;
  const formattedTime = `${hours}:${minutes}`;
  const formattedDateTime = `${formattedDate} at ${formattedTime}`;

  return dayOnly ? formattedDate : formattedDateTime;
};
