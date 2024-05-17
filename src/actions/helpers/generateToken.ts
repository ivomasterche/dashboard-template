import exp from "constants";
import { v4 as uuidv4 } from "uuid";

/**
 * Generates a token and sets an expiration period
 * @param expirationPeriod - The expiration period of the token in milliseconds
 * @returns - The generated token and the expiration period
 */

export async function generateToken(expirationPeriod: number | null = null) {
  if (!expirationPeriod) {
    expirationPeriod = 60 * 60 * 1000;
  }
  const token = uuidv4();
  const tokenExpires = new Date(new Date().getTime() + expirationPeriod);

  return { token, tokenExpires };
}
