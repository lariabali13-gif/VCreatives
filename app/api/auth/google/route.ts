import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const clientRedirect = searchParams.get("redirect_uri");

  const googleClientId = process.env.GOOGLE_CLIENT_ID || (req.headers.get("x-google-client-id") || "");
  
  if (!googleClientId) {
    return NextResponse.json(
      { error: "Google OAuth credentials not configured in environment variables." },
      { status: 400 }
    );
  }

  const queryParams = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: clientRedirect || "",
    response_type: "code",
    scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
    access_type: "offline",
    prompt: "consent",
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryParams.toString()}`;
  return NextResponse.json({ url: authUrl });
}
