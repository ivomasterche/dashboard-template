"use server";

import {
  changeIsOauthUser,
  changePassword,
  getUserByEmail,
  getUserWithPasswordByEmail,
  getUserByPasswordResetToken,
  getUserByVerificationToken,
  newUserPasswordByEmail,
  updateUser,
  updateUserPasswordResetTokenByEmail,
  updateUserVerificationTokenByEmail,
  verifyOAuthUser,
  verifyUserByEmail,
} from "@/dataAccess/user";
import { LoginSchema } from "@/schemas/LoginSchema";
import { addUser, isExistingUser } from "@/dataAccess/user";
import { RegisterSchema } from "@/schemas/RegisterSchema";
import { IActionResponce, INewUser, IUser, IUserInfo } from "@/types";
import { hash } from "bcryptjs";
import * as yup from "yup";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import bcrypt from "bcryptjs";
import {
  sendPaswordResetEmailAction,
  sendVerificationEmailAction,
} from "./emailActions";
import { EmailSchema } from "@/schemas/EmailSchema";
import { generateToken } from "./helpers/generateToken";
import { VerificationTokenSchema } from "@/schemas/VerificationTokenSchema";
import { NewPasswordSchema } from "@/schemas/NewPasswordSchema";
import { ProfileUpdateSchema } from "@/schemas/ProfileUpdateSchema";
import { PasswordChangeSchema } from "@/schemas/PasswordChangeSchema";
import { getCurrentUserFromSession } from "@/lib/currentUser";

/**
 * Authorizes a user with the provided credentials.
 * @param credentials - The user credentials.
 * @throws {Error} If the data is invalid or if there is an error during the authorization process.
 * @returns {Promise<IActionResponce>} Returns a promise that resolves to an object with
 *                         - a success property indicating the result of the authorization
 *                         - and Plain User Object on success or message on fail.
 */

export async function authorizeUserAction(
  credentials: Partial<Record<string, unknown>>
): Promise<IActionResponce> {
  let validatedData: yup.InferType<typeof LoginSchema>;
  try {
    validatedData = await LoginSchema.validate(credentials, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
  } catch (error: any) {
    throw new Error("Invalid data.");
  }

  const { email, password } = validatedData;

  const user: IUser | null = await getUserWithPasswordByEmail(email).catch(
    (error: any) => {
      throw new Error("Something went wrong " + error.message);
    }
  );
  if (!user) {
    return { success: false, message: "User not found" };
  }

  if (user && !user.password) {
    return {
      success: false,
      message:
        "User cannot login with credentials. Use other authorization method.",
    };
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password!);
  if (!isPasswordMatch) {
    return { success: false, message: "Username and password do not match." };
  }
  const plainObjectUser: { id: string } = {
    id: user._id.toString(),
  };

  return { success: true, data: plainObjectUser };
}

/**
 * Registers a new user with the provided data.
 * @param data - The user registration data.
 * @throws {Error} If the data is invalid or if there is an error during the registration process.
 * @throws {Error} If the user already exists.
 * @throws {Error} If there is an error generating the verification token.
 * @throws {Error} If there is an error adding the user to the database.
 * @throws {Error} If there is an error sending the verification email.
 * @returns {Promise<IActionResponce>} Returns an object with
 *                        - a success property indicating the result of the operation
 *                        - and message on fail.
 */

export async function registerAction(
  data: yup.InferType<typeof RegisterSchema>
): Promise<IActionResponce> {
  let validatedData: yup.InferType<typeof RegisterSchema>;
  try {
    validatedData = await RegisterSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
  } catch (error: any) {
    throw new Error("Invalid data.");
  }
  try {
    const userExists: boolean = await isExistingUser(validatedData.email);

    if (userExists) {
      return { success: false, message: "User already exists." };
    }
    const { token, tokenExpires } = await generateToken();

    const newUser: INewUser = {
      name: validatedData.name,
      email: validatedData.email,
      password: await hash(validatedData.password, 12),
      verificationToken: token,
      verificationTokenExpires: tokenExpires,
    };

    const user = await addUser(newUser);
    if (null === user) {
      return { success: false, message: "Cannot create User." };
    }
    await sendVerificationEmailAction(validatedData.email, token);
  } catch (error: any) {
    throw new Error("Something went wrong, Error: " + error.message);
  }
  return { success: true };
}

/**
 * Resets the password for a user with the provided email.
 * @param data - The user email data.
 * @throws {Error} If the data is invalid or if there is an error during the password reset process.
 * @throws {Error} If the user is not found.
 * @throws {Error} If there is an error generating the password reset token.
 * @throws {Error} If there is an error updating the user's password reset token in the database.
 * @throws {Error} If there is an error sending the password reset email.
 * @returns {Promise<IActionResponce>} Returns an object with
 *                  - a success property indicating the result of the operation
 *                  - and message on fail.
 */

export async function ResetPasswordAction(
  data: yup.InferType<typeof EmailSchema>
): Promise<IActionResponce> {
  let validatedData: yup.InferType<typeof EmailSchema>;

  try {
    validatedData = await EmailSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
  } catch (error: any) {
    throw new Error("Invalid data.");
  }
  try {
    const user = await getUserByEmail(validatedData.email);
    if (!user) {
      return {
        success: false,
        message: "User with this email does not exist.",
      };
    }

    const { token, tokenExpires } = await generateToken();
    await updateUserPasswordResetTokenByEmail(
      validatedData.email,
      token,
      tokenExpires
    );
    await sendPaswordResetEmailAction(validatedData.email, token);
  } catch (error: any) {
    throw new Error("Something went wrong, Error: " + error.message);
  }
  return { success: true };
}

/**
 * Logs in a user with the provided data.
 * @param data - The user login data.
 * @throws {Error} If the data is invalid or if there is an error during the login process.
 * @throws {Error} If the user is not found.
 * @throws {Error} If the user is not verified.
 * @throws {Error} If the user cannot login with password.
 * @throws {Error} If the credentials are invalid.
 * @returns {Promise<IActionResponce>} Returns an object with
 *                     - a success property indicating the result of the operation.
 *                    - and message on fail.
 */

export async function LoginAction(
  data: yup.InferType<typeof LoginSchema>
): Promise<IActionResponce> {
  let validatedData: yup.InferType<typeof LoginSchema>;

  try {
    validatedData = await LoginSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
  } catch (error: any) {
    console.log(error);
    throw new Error("Invalid data.");
  }

  const existingUser: IUser | null = await getUserWithPasswordByEmail(
    validatedData.email
  ).catch((error: any) => {
    console.log(error);
    throw new Error("Something went wrong " + error.message);
  });
  if (!existingUser) {
    return { success: false, message: "User not found" };
  }
  if (!existingUser.password) {
    return {
      success: false,
      message:
        "This user cannot login with password, maybe you used one of the other providers?",
    };
  }

  if (!existingUser.verified) {
    try {
      const { token, tokenExpires } = await generateToken();

      await updateUserVerificationTokenByEmail(
        validatedData.email,
        token,
        tokenExpires
      );
      await sendVerificationEmailAction(validatedData.email, token);
    } catch (error: any) {
      return {
        success: false,
        message:
          "There was a problem with your verification token. " + error.message,
      };
    }

    return {
      success: false,
      message:
        "This user is still not verified. We have sent you a new verification email. Please follow the instructions there.",
    };
  } else {
    try {
      await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: true,
        redirectTo: DEFAULT_LOGIN_REDIRECT,
      });
      return { success: true };
    } catch (error: any) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin": {
            return { success: false, message: "Invalid credentials." };
          }
          default: {
            throw new Error("An error occurred");
          }
        }
      }
      throw error;
    }
  }
}

/**
 * Verifies a user with the provided email.
 * @param data - The user email data.
 * @throws {Error} If the data is invalid or if there is an error during the verification process.
 * @throws {Error} If the user is not found.
 * @throws {Error} If the verification token is invalid.
 * @throws {Error} If the verification token has expired.
 * @returns {Promise<IActionResponce>} Returns an object with
 *                    - a success property indicating the result of the operation.
 *                    - and message on fail.
 */

export async function verifyLinkedUserAction(
  data: yup.InferType<typeof EmailSchema>
): Promise<IActionResponce> {
  let validatedData: yup.InferType<typeof EmailSchema>;

  try {
    validatedData = await EmailSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
  } catch (error: any) {
    throw new Error("Invalid data.");
  }
  try {
    await verifyOAuthUser(validatedData.email);
  } catch (error: any) {
    throw new Error("Something went wrong, Error: " + error.message);
  }
  return { success: true };
}

/**
 * Verifies a user with the provided token.
 * @param data - The user token data.
 * @throws {Error} If the data is invalid or if there is an error during the verification process.
 * @throws {Error} If the verification token is invalid.
 * @throws {Error} If the verification token has expired.
 * @returns {Promise<IActionResponce>} Returns an object with
 *                    - a success property indicating the result of the operation.
 *                    - and message on fail.
 */

export async function verifyUserAction(
  data: yup.InferType<typeof VerificationTokenSchema>
): Promise<IActionResponce> {
  let validatedData: yup.InferType<typeof VerificationTokenSchema>;

  try {
    validatedData = await VerificationTokenSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
  } catch (error: any) {
    throw new Error("Invalid data.");
  }
  try {
    const user = await getUserByVerificationToken(validatedData.token);
    if (!user) {
      return { success: false, message: "Invalid token." };
    }
    if (undefined === user.verificationTokenExpires) {
      throw new Error("Token missing.");
    }
    if (user.verificationTokenExpires < new Date()) {
      return { success: false, message: "Token expired." };
    }
    await verifyUserByEmail(user.email);
  } catch (error: any) {
    throw new Error("Something went wrong, Error: " + error.message);
  }
  return { success: true };
}

/**
 * Resets the password for a user with the provided token.
 * @param data - The user token data.
 * @throws {Error} If the data is invalid or if there is an error during the password reset process.
 * @throws {Error} If the user is not found.
 * @throws {Error} If the password reset token is invalid.
 * @throws {Error} If the password reset token has expired.
 * @returns {Promise<IActionResponce>} Returns an object with
 *                    - a success property indicating the result of the operation.
 *                    - and message on fail.
 */

export async function newUserPasswordAction(
  data: yup.InferType<typeof NewPasswordSchema>
): Promise<IActionResponce> {
  let validatedData: yup.InferType<typeof NewPasswordSchema>;

  try {
    validatedData = await NewPasswordSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
  } catch (error: any) {
    throw new Error("Invalid data.");
  }
  try {
    const user = await getUserByPasswordResetToken(validatedData.token);
    if (!user) {
      return { success: false, message: "Invalid token." };
    }
    if (undefined === user.passwordResetTokenExpires) {
      throw new Error("Token missing.");
    }
    if (user.passwordResetTokenExpires < new Date()) {
      return { success: false, message: "Token expired." };
    }
    const hashedPassword = await hash(validatedData.password, 12);
    await newUserPasswordByEmail(user.email, hashedPassword);
  } catch (error: any) {
    throw new Error("Something went wrong, Error: " + error.message);
  }
  return { success: true };
}

/**
 * Fetches the user information for the currently logged in user.
 * @param email - The email of the currently logged in user.
 * @throws {Error} If there is an error during the fetch process.
 * @throws {Error} If the user is not found.
 * @throws {Error} If the user is not the currently logged in user.
 * @returns {Promise<IActionResponce>} Returns an object with
 *                    - a success property indicating the result of the operation.
 *                    - and PlainUserObject as data on success or message on fail.
 */

export async function getSelfUserInfoByEmailAction(
  email: string
): Promise<IActionResponce> {
  const currentUser = await getCurrentUserFromSession().catch((error: any) => {
    throw new Error("Something went wrong, Error: " + error.message);
  });
  if (!currentUser) {
    return { success: false, unauthorized: true };
  }
  let validatedData: yup.InferType<typeof EmailSchema>;

  try {
    validatedData = await EmailSchema.validate(
      { email },
      {
        abortEarly: false,
        stripUnknown: true,
        strict: true,
      }
    );
  } catch (error: any) {
    throw new Error("Invalid data.");
  }
  const user: IUser | null = await getUserWithPasswordByEmail(
    validatedData.email
  ).catch((error: any) => {
    throw new Error("Something went wrong, Error: " + error.message);
  });
  if (!user) {
    return { success: false, message: "User not found" };
  }
  if (user.email !== currentUser.email) {
    return {
      success: false,
      message: "You cannot fetch another user's profile.",
    };
  }

  const plainObjectUser: IUserInfo = {
    name: user.name,
    email: user.email,
    role: user.role,
    image: user.image,
    isOAuthUser: user.isOAuthUser,
    hasPassword: !!user.password,
  };

  return { success: true, data: plainObjectUser };
}

/**
 * Fetches the user information for the currently logged in user.
 * @param email - The email of the currently logged in user.
 * @throws {Error} If there is an error during the fetch process.
 * @throws {Error} If the user is not found.
 * @throws {Error} If the user is not the currently logged in user.
 *
 * @returns {Promise<IActionResponce>} Returns an object with
 *                  - a success property indicating the result of the operation.
 *                  - and message on fail.
 */

export async function SelfProfileUpdateAction(
  data: yup.InferType<typeof ProfileUpdateSchema>,
  originalEmail: string,
  isOAuthUser: boolean
): Promise<IActionResponce> {
  const currentUser = await getCurrentUserFromSession().catch((error: any) => {
    throw new Error("Something went wrong, Error: " + error.message);
  });
  if (!currentUser) {
    return { success: false, unauthorized: true };
  }
  let validatedData: yup.InferType<typeof ProfileUpdateSchema>;
  try {
    validatedData = await ProfileUpdateSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
  } catch (error: any) {
    throw new Error("Invalid data.");
  }
  try {
    const originalUser = await getUserByEmail(originalEmail);
    if (!originalUser) {
      return { success: false, message: "User not found" };
    }
    if (originalUser.email !== currentUser.email) {
      return {
        success: false,
        unauthorized: true,
      };
    }
    if (validatedData.email && validatedData.email != originalUser.email) {
      const existingUserWithThisEmail = await getUserByEmail(
        validatedData.email
      );
      if (existingUserWithThisEmail) {
        return {
          success: false,
          message: "User with this email already exists.",
        };
      }
    }
    const updatedUser = {
      _id: originalUser._id,
      name: validatedData.name || originalUser.name,
      email:
        !isOAuthUser && validatedData.email
          ? validatedData.email
          : originalUser.email,
      role: originalUser.role,
      isOAuthUser: originalUser.isOAuthUser,
    };
    if (
      !isOAuthUser &&
      validatedData.email &&
      validatedData.email != originalUser.email
    ) {
      const { token, tokenExpires } = await generateToken();
      await updateUser(originalUser._id, updatedUser);
      await updateUserVerificationTokenByEmail(
        validatedData.email,
        token,
        tokenExpires
      );
      await sendVerificationEmailAction(validatedData.email, token);
    } else {
      await updateUser(originalUser._id, updatedUser);
    }
  } catch (error: any) {
    throw new Error("Something went wrong, Error: " + error.message);
  }
  return { success: true };
}

/**
 * Changes the password for a user with the provided data.
 * @param data - The user password change data.
 * @throws {Error} If the data is invalid or if there is an error during the password change process.
 * @throws {Error} If the user is not found.
 * @throws {Error} If the user is not the currently logged in user.
 * @returns {Promise<IActionResponce>} Returns an object with
 *                  - a success property indicating the result of the operation.
 *                  - and PlainUserObject as data on success or message on fail.
 */

export async function PasswordChangeAction(
  data: yup.InferType<typeof PasswordChangeSchema>,
  originalEmail: string
): Promise<IActionResponce> {
  const currentUser = await getCurrentUserFromSession().catch((error: any) => {
    throw new Error("Something went wrong, Error: " + error.message);
  });
  if (!currentUser) {
    return { success: false, unauthorized: true };
  }
  let validatedData: yup.InferType<typeof PasswordChangeSchema>;
  try {
    validatedData = await PasswordChangeSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      strict: true,
    });
  } catch (error: any) {
    throw new Error("Invalid data.");
  }
  try {
    const originalUser = await getUserWithPasswordByEmail(originalEmail);
    if (!originalUser) {
      return {
        success: false,
        message:
          "Original user not found. Please try again later, or contact support",
      };
    }

    if (originalUser.email !== currentUser.email) {
      return {
        success: false,
        unauthorized: true,
      };
    }
    if (!originalUser) {
      return { success: false, message: "User not found" };
    }
    const hasPassword = !!originalUser.password;
    if (
      !hasPassword &&
      validatedData.password &&
      validatedData.password === validatedData.confirmPassword
    ) {
      const hashedPassword = await hash(validatedData.password, 12);
      await changePassword(originalUser._id, hashedPassword);
    }

    if (
      hasPassword &&
      validatedData.currentPassword &&
      validatedData.password &&
      validatedData.confirmPassword &&
      validatedData.password === validatedData.confirmPassword
    ) {
      if (
        await bcrypt.compare(
          validatedData.currentPassword,
          originalUser.password!
        )
      ) {
        const hashedPassword = await hash(validatedData.password, 12);
        await changePassword(originalUser._id, hashedPassword);
      } else {
        return { success: false, message: "Current password is incorrect." };
      }
    }
    if (validatedData.isOAuthUser !== originalUser.isOAuthUser) {
      await changeIsOauthUser(originalUser._id, validatedData.isOAuthUser);
    }
    const plainObjectUser: IUserInfo = {
      isOAuthUser: validatedData.isOAuthUser,
      hasPassword: hasPassword,
      name: originalUser.name,
      email: originalUser.email,
      role: originalUser.role,
    };
    return { success: true, data: plainObjectUser };
  } catch (error: any) {
    throw new Error("Something went wrong, Error: " + error.message);
  }
}
