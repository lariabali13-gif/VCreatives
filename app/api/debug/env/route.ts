import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    mongodb: process.env.MONGODB_URI ? "SET" : "NOT SET",
    google_id: process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
    google_secret: process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
    github_id: process.env.GITHUB_CLIENT_ID ? "SET" : "NOT SET",
    github_secret: process.env.GITHUB_CLIENT_SECRET ? "SET" : "NOT SET",
  });
}
