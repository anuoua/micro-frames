export const resolveUrl = (
  targetUrl: string | URL | undefined | null,
  baseUrl: string
) => {
  const baseChunks = baseUrl.split("/").filter((i) => !!i);

  const prefix = "/" + baseChunks.join("/");

  if (!targetUrl)
    return `${prefix === "/" ? "" : prefix}${location.pathname}${
      location.search
    }${location.hash}`;

  const resolvedUrl = new URL(targetUrl, location.href);

  return `${prefix === "/" ? "" : prefix}${resolvedUrl.pathname}${
    resolvedUrl.search
  }${resolvedUrl.hash}`;
};
