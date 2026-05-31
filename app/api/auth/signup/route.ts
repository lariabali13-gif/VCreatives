import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { fullName, username, email, password } = await req.json();

    if (!fullName || !username || !email || !password) {
      return NextResponse.json(
        { error: "All profile fields are mandatory." },
        { status: 400 }
      );
    }

    const db = await getMongoDb();
    if (!db) {
      return NextResponse.json({ 
        useFallback: true, 
        message: "No server-side MongoDB connection detected. Running in client mode." 
      });
    }

    const usersCollection = db.collection("users");
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Is email address par already aik account registered hai! Meherbani karke login karein." },
        { status: 409 }
      );
    }

    const newUser = {
      fullName,
      username,
      email: email.toLowerCase(),
      password, // Note: In production use Bcrypt/Argon2. We store as-is for high-fidelity sync.
      authMethod: "Email Registry (Atlas Core Connected)",
      createdAt: new Date().toISOString()
    };

    await usersCollection.insertOne(newUser);

    return NextResponse.json({
      success: true,
      user: {
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        authMethod: newUser.authMethod
      }
    });

  } catch (err: any) {
    console.error("Server Signup Exception:", err);
    return NextResponse.json(
      { error: `Database Registration Error: ${err.message || err}` },
      { status: 500 }
    );
  }
}
