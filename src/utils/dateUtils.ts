export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getWeekDates = (fromDate: Date, toDate: Date): Date[] => {
  const dates = [];
  let currentDate = new Date(fromDate);
  
  while (currentDate <= toDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};