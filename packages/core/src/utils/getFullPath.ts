export const getFullPath = () => {
  const newURL = new URL(location.href);
  return `${newURL.pathname}${newURL.search}${newURL.hash}`;
};
