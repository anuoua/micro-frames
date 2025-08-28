export const resolveUrl = (
  targetUrl: string | URL | undefined | null,
  baseUrl: string
) => {
  if (!targetUrl)
    return `${location.pathname}${location.search}${location.hash}`;

  const baseChunks = baseUrl.split("/").filter((i) => !!i);

  const resolvedUrl = new URL(targetUrl, location.href);

  const prefix = "/" + baseChunks.join("/");

  return `${prefix === "/" ? "" : prefix}${resolvedUrl.pathname}${
    resolvedUrl.search
  }${resolvedUrl.hash}`;
};
