export const renderDate = (dateInUnix: number): string => {
  return new Date(dateInUnix * 1000).toLocaleDateString("fi-FI");
};
