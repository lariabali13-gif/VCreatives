import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { handleGoogleLogin } from "@/lib/auth/oauth-handler";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const redirectUri = searchParams.get("redirect_uri");

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!googleClientId || !googleClientSecret) {
    return NextResponse.json(
      { error: "Google OAuth credentials nahi configured hain." },
      { status: 400 }
    );
  }

  if (!code) {
    // Return auth URL for login
    const queryParams = new URLSearchParams({
      client_id: googleClientId,
      redirect_uri: redirectUri || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google`,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
      access_type: "offline",
      prompt: "consent",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${queryParams.toString()}`;
    return NextResponse.json({ url: authUrl });
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google`,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.json({ error: "Token exchange fail ho gaya." }, { status: 400 });
    }

    // Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userResponse.json();

    if (!profile.email) {
      return NextResponse.json({ error: "Email info nahi mila." }, { status: 400 });
    }

    // Handle login with database
    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({ error: "Database connection fail." }, { status: 500 });
    }

    const user = await handleGoogleLogin(db, {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    });

    if (!user) {
      return NextResponse.json({ error: "User creation fail ho gaya." }, { status: 500 });
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user._id?.toString() || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      success: true,
      message: "Google se successfully login ho gaye!",
      user: {
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
      }
    });

  } catch (err: any) {
    console.error("[v0] Google OAuth Error:", err);
    return NextResponse.json(
      { error: `OAuth error: ${err.message}` },
      { status: 500 }
    );
  }
}
