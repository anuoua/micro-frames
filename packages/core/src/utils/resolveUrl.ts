export const resolveUrl = (
  targetUrl: string | URL | undefined | null,
  baseUrl: string
) => {
  const baseChunks = baseUrl.split("/").filter((i) => !!i);
  baseUrl = `/${baseChunks.join("/")}`;

  if (!targetUrl) return baseUrl;

  if (targetUrl instanceof URL) {
    const newTargetUrl = new URL(targetUrl);
    newTargetUrl.pathname = `${baseUrl}/${targetUrl.pathname}`;
    return `${newTargetUrl.pathname}${newTargetUrl.search}${newTargetUrl.hash}}`;
  }

  if (targetUrl.startsWith("/")) {
    return `${baseUrl}${targetUrl}`;
  }

  return `${baseUrl}/${targetUrl
    .split("/")
    .filter((i) => !!i && i !== ".")
    .join("/")}`;
};
