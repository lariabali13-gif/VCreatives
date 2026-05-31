import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const clientRedirect = searchParams.get("redirect_uri");

  const githubClientId = process.env.GITHUB_CLIENT_ID || (req.headers.get("x-github-client-id") || "");

  if (!githubClientId) {
    return NextResponse.json(
      { error: "GitHub OAuth credentials not configured in environment variables." },
      { status: 400 }
    );
  }

  const queryParams = new URLSearchParams({
    client_id: githubClientId,
    redirect_uri: clientRedirect || "",
    scope: "read:user user:email",
  });

  const authUrl = `https://github.com/login/oauth/authorize?${queryParams.toString()}`;
  return NextResponse.json({ url: authUrl });
}
