import { Db } from 'mongodb';
import { findUserByGoogleId, findUserByGithubId, createUser } from './models/User';

export interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GithubProfile {
  id: string;
  login: string;
  email: string;
  avatar_url?: string;
}

export async function handleGoogleLogin(db: Db, profile: GoogleProfile) {
  let user = await findUserByGoogleId(db, profile.id);

  if (!user) {
    // Check if email exists
    const existingUser = await db.collection('users').findOne({ email: profile.email });
    
    if (existingUser) {
      // Link Google account to existing user
      await db.collection('users').updateOne(
        { email: profile.email },
        {
          $set: {
            googleId: profile.id,
            profileImage: profile.picture,
            updatedAt: new Date(),
          },
        }
      );
      user = await db.collection('users').findOne({ email: profile.email });
    } else {
      // Create new user with Google profile
      const userId = await createUser(db, {
        email: profile.email,
        name: profile.name,
        googleId: profile.id,
        profileImage: profile.picture,
      });
      
      user = await db.collection('users').findOne({ _id: userId });
    }
  }

  return user;
}

export async function handleGithubLogin(db: Db, profile: GithubProfile) {
  let user = await findUserByGithubId(db, profile.id.toString());

  if (!user) {
    // Check if email exists
    const existingUser = await db.collection('users').findOne({ email: profile.email });
    
    if (existingUser) {
      // Link GitHub account to existing user
      await db.collection('users').updateOne(
        { email: profile.email },
        {
          $set: {
            githubId: profile.id.toString(),
            profileImage: profile.avatar_url,
            updatedAt: new Date(),
          },
        }
      );
      user = await db.collection('users').findOne({ email: profile.email });
    } else {
      // Create new user with GitHub profile
      const userId = await createUser(db, {
        email: profile.email,
        name: profile.login,
        githubId: profile.id.toString(),
        profileImage: profile.avatar_url,
      });
      
      user = await db.collection('users').findOne({ _id: userId });
    }
  }

  return user;
}
