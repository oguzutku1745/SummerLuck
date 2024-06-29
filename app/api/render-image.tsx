import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

export default async function handler(req:any) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "initial";
    const transactionId = searchParams.get("transactionId");
    const isFollowing = searchParams.get("isFollowing") === "true";

    let content;

    if (page === "initial") {
      content = (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", backgroundColor: "#800080", color: "#fff", fontSize: 40 }}>
          Welcome to Lucky Summer!
          You can join the raffle if you follow the caster.
        </div>
      );
    } else if (page === "result") {
      content = (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", backgroundColor: "#800080", color: "#fff", fontSize: 40 }}>
          Transaction submitted! {transactionId}
        </div>
      );
    } else {
      content = (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", backgroundColor: "#800080", color: "#fff", fontSize: 40 }}>
          {isFollowing ? "You are following the caster." : "You are not following the caster"}
        </div>
      );
    }

    return new ImageResponse(
      content,
      {
        width: 1200,
        height: 628,
      }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
