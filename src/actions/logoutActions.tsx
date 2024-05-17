"use server";

import { auth, signOut } from "@/auth";

/**
 * Logs out the user.
 * @returns {Promise<void>} A promise that resolves when the user is successfully logged out.
 */
export default async function Logout() {
  //await signOut();
  await signOut({ redirect: true, redirectTo: "/" });
}
