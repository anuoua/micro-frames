export const resolveUrl = (
  targetUrl: string | URL | undefined | null,
  baseUrl: string
) => {
  const baseChunks = baseUrl.split("/").filter((i) => !!i);

  if (!targetUrl) return `/${baseChunks.join("/")}`;

  const resolvedUrl = new URL(targetUrl, location.href);

  const prefix = "/" + baseChunks.join("/");

  return `${prefix === "/" ? "" : prefix}${resolvedUrl.pathname}${
    resolvedUrl.search
  }${resolvedUrl.hash}`;
};
