import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { handleGithubLogin } from "@/lib/auth/oauth-handler";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const redirectUri = searchParams.get("redirect_uri");

  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!githubClientId || !githubClientSecret) {
    return NextResponse.json(
      { error: "GitHub OAuth credentials nahi configured hain." },
      { status: 400 }
    );
  }

  if (!code) {
    // Return auth URL for login
    const queryParams = new URLSearchParams({
      client_id: githubClientId,
      redirect_uri: redirectUri || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/github`,
      scope: "read:user user:email",
    });

    const authUrl = `https://github.com/login/oauth/authorize?${queryParams.toString()}`;
    return NextResponse.json({ url: authUrl });
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: githubClientId,
        client_secret: githubClientSecret,
        code,
        redirect_uri: redirectUri || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/github`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.json({ error: "Token exchange fail ho gaya." }, { status: 400 });
    }

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await userResponse.json();

    if (!profile.email && profile.id) {
      // Get email from GitHub API
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary)?.email || emails[0]?.email;

      if (primaryEmail) {
        profile.email = primaryEmail;
      }
    }

    if (!profile.email) {
      return NextResponse.json({ error: "Email info nahi mila." }, { status: 400 });
    }

    // Handle login with database
    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({ error: "Database connection fail." }, { status: 500 });
    }

    const user = await handleGithubLogin(db, {
      id: profile.id,
      login: profile.login,
      email: profile.email,
      avatar_url: profile.avatar_url,
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
      message: "GitHub se successfully login ho gaye!",
      user: {
        id: user._id?.toString(),
        name: user.name,
        email: user.email,
      }
    });

  } catch (err: any) {
    console.error("[v0] GitHub OAuth Error:", err);
    return NextResponse.json(
      { error: `OAuth error: ${err.message}` },
      { status: 500 }
    );
  }
}
