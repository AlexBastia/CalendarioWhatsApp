import { User } from "$lib/models/User";

export function verifyEmailInput(email) {
  return email.length < 256 && /^.+@.+\..+$/.test(email);
}

export async function checkEmailAvailability(email) {
  const count = await User.countDocuments({ email: email });
  return count === 0;
}
