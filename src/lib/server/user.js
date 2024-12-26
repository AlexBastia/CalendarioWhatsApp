import { User } from "$lib/models/User";
import { decrypt, decryptToString, encrypt, encryptString } from "./encryption";
import { hashPassword } from "./password";

export function verifyUsernameInput(username) {
  return username.length > 3 && username.length < 32 && username.trim() === username;
}

export async function createUser(email, username, password) {
  const passwordHash = await hashPassword(password);
  const newUserDoc = new User({ email, passwordHash, username, appunti: [] })
  const user = await newUserDoc.save()
  return user;
}

export async function getUserPasswordHash(userId) {
  const user = await User.findOne({ _id: userId }, { passwordHash: 1 })
  if (user === null) {
    throw new Error("Invalid user ID");
  }
  return user.passwordHash;
}

export async function getUserFromEmail(email) {
  const user = await User.findOne({ email: email });
  if (user === null) {
    return null;
  }
  return user;
}

