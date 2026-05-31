import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth/password";
import { findUserByEmail, createUser } from "@/lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Tamaam fields maandatory hain." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password kam se kam 6 characters hona chahiye." },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    if (!db) {
      console.error("[v0] MongoDB connection failed in signup");
      return NextResponse.json({ 
        error: "Database connection nahi ho saka." 
      }, { status: 500 });
    }
    
    // Check if user already exists
    const existingUser = await findUserByEmail(db, email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Is email address par already account registered hai!" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const userId = await createUser(db, {
      name: fullName,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({
      success: true,
      message: "Account successfully banaya gaya!",
      user: {
        id: userId,
        name: fullName,
        email: email.toLowerCase(),
      }
    });

  } catch (err: any) {
    console.error("[v0] Signup Exception:", err);
    return NextResponse.json(
      { error: `Registration mein error: ${err.message || err}` },
      { status: 500 }
    );
  }
}
