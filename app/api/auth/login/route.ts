import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { verifyPassword } from "@/lib/auth/password";
import { findUserByEmail } from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email aur password dono zaroori hain." },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({ 
        error: "Database connection nahi ho saka."
      }, { status: 500 });
    }

    // Find user by email
    const user = await findUserByEmail(db, email);

    if (!user) {
      return NextResponse.json(
        { error: "Is email address ka koi account nahi mila!" },
        { status: 404 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { error: "Is account ke liye password set nahi hai." },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Ghalat password!" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Aap successfully login ho gaye!",
      user: {
        id: user._id?.toString(),
        name: user.name || "User",
        email: user.email,
      }
    });

  } catch (err: any) {
    console.error("[v0] Login Exception:", err);
    return NextResponse.json(
      { error: `Login mein error: ${err.message || err}` },
      { status: 500 }
    );
  }
}
