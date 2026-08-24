export const ENV = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/v1",

  getMediaUrl: (path: string | null | undefined): string => {
    if (!path) return "./default-playlist.jpg";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    
    // remove the /v1 ending from API_URL to query static files on the server
    const baseUrl = ENV.API_URL.replace(/\/v1$/, "");
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  }
};