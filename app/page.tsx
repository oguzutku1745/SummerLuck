import { fetchMetadata } from "frames.js/next";
 
export async function generateMetadata() {
  const frameMetadata = await fetchMetadata(
    new URL(
      "/frames",
      process.env.APP_URL
        ? `https://${process.env.APP_URL}`
        : "http://localhost:3000"
    )
  );

    return {
      title: "My Page",
      meta: [
        { property: "fc:frame", content: "vNext" },
        { property: "fc:frame:image", content: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1ME7TQAAAAASUVORK5CYII=" },
        { property: "og:image", content: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1ME7TQAAAAASUVORK5CYII=" },
      ],
      ...frameMetadata,
    };
  };

 
export default function Page() {
  return <span>My existing page</span>;
}