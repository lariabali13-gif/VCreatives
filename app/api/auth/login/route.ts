import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required fields" },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    if (!db) {
      // Fallback response indicating database is not yet hooked up on server
      return NextResponse.json({ 
        useFallback: true, 
        message: "No server-side MongoDB connection detected. Running in client mode." 
      });
    }

    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: "Is email address ka koi user database mein nahi mila!" },
        { status: 404 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { error: "Ghalat password! Meherbani karke apna password sahi se enter karein." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        fullName: user.fullName || "User",
        username: user.username || "user",
        email: user.email,
        authMethod: user.authMethod || "Email Verification (Atlas Core Connected)"
      }
    });

  } catch (err: any) {
    console.error("Server Login Exception:", err);
    return NextResponse.json(
      { error: `Database Authentication Error: ${err.message || err}` },
      { status: 500 }
    );
  }
}
