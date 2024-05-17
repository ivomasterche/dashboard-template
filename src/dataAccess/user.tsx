"use server";
import { connectToMongoDB } from "@/lib/mongoosedb";
import Account from "@/models/account";
import User from "@/models/user";
import { INewUser, IUser } from "@/types";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

/**
 * Registers a new user with the provided data.
 * @param newUser - The data of the new user.
 * @throws {Error} - If the user cannot be created.
 * @throws {Error} - If Cannot connect to DB.
 * @returns {Promise<IUser | null>} Returns an user object with the created user or null.
 */

export async function addUser(
  newUser: INewUser,
  role: string | undefined = "User"
): Promise<IUser | null> {
  connectToMongoDB().catch((error) => {
    throw new Error("Cannot connect to DB" + error.message);
  });
  let user: IUser | null = null;
  try {
    const {
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpires,
    } = newUser;
    user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      verificationToken,
      verificationTokenExpires,
    }).then((result: IUser) => {
      return result;
    });
    return user;
  } catch (error: any) {
    throw new Error("Cannot create User, Error" + error.message);
  }
}

/**
 * Checks if the user with the provided email already exists.
 * @param email - The email of the user.
 * @throws {Error} - If Cannot connect to DB.
 * @returns {Promise<boolean>} Returns true if the user exists, false otherwise.
 */

export async function isExistingUser(email: string): Promise<boolean> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  const existingUser: IUser | null = await User.findOne(
    {
      email: email.toLowerCase(),
    },
    { email: 1 }
  );
  return !!existingUser;
}

/**
 * Gets the user with the password by email .
 * @param email - The email of the user.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot get user.
 * @returns {Promise<IUser | null>} Returns the user object with the user or null.
 */

export async function getUserWithPasswordByEmail(
  email: string
): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user: IUser | null = await User.findOne({
      email: email.toLowerCase(),
    })
      .select("+password")
      .then((result: IUser) => {
        return result;
      });
    return user;
  } catch (err: any) {
    throw new Error("Cannot get user", err.message);
  }
}

/**
 * Gets the user by email.
 * @param email - The email of the user.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot get user.
 * @returns {Promise<IUser | null>} Returns the user object with the user or null.
 */
export async function getUserByEmail(email: string): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user: IUser | null = await User.findOne({
      email: email.toLowerCase(),
    });
    return user;
  } catch (err: any) {
    throw new Error("Cannot get user", err.message);
  }
}

/**
 * Gets the user by id.
 * @param id - The id of the user.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot get user.
 * @returns {Promise<IUser | null>} Returns the user object with the user or null.
 */
export async function getUserById(id: string): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user: IUser | null = await User.findOne({ _id: id }).then(
      (result: IUser) => {
        return result;
      }
    );
    return user;
  } catch (err: any) {
    throw new Error("Cannot get user", err.message);
  }
}

/**
 * Gets the user by verification token.
 * @param token - The verification token of the user.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot get user verification token.
 * @returns {Promise<IUser | null>} Returns the user object with the user or null.
 */
export async function getUserByVerificationToken(
  token: string
): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user: IUser | null = await User.findOne({
      verificationToken: token,
    })
      .select("+verificationTokenExpires")
      .then((result: IUser) => {
        return result;
      });

    return user;
  } catch (err: any) {
    throw new Error("Cannot get user verification token", err.message);
  }
}

/**
 * Gets the user by password reset token.
 * @param token - The password reset token of the user.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot get user password reset token.
 * @returns {Promise<IUser | null>} Returns the user object with the user or null.
 */
export async function getUserByPasswordResetToken(
  token: string
): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user: IUser | null = await User.findOne({ passwordResetToken: token })
      .select("+passwordResetTokenExpires")
      .then((result: IUser) => {
        return result;
      });

    return user;
  } catch (err: any) {
    throw new Error("Cannot get user password reset token", err.message);
  }
}

/**
 * Updates the user verification token by email.
 * @param email - The email of the user.
 * @param token - The verification token of the user.
 * @param expires - The expiration date of the token.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot update user verification token.
 * @returns {Promise<IUser | null>} Returns the user object with the updated user or null.
 */
export async function updateUserVerificationTokenByEmail(
  email: string,
  token: string,
  expires: Date
): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user: IUser | null = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        verificationToken: token,
        verificationTokenExpires: expires,
        verified: null,
      }
    );
    return user;
  } catch (err: any) {
    throw new Error("Cannot update user verification token", err.message);
  }
}

/**
 * Updates the user password reset token by email.
 * @param email - The email of the user.
 * @param token - The password reset token of the user.
 * @param expires - The expiration date of the token.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot update user password reset token.
 * @returns {Promise<IUser | null>} Returns the user object with the updated user or null.
 */
export async function updateUserPasswordResetTokenByEmail(
  email: string,
  token: string,
  expires: Date
): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user: IUser | null = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        passwordResetToken: token,
        passwordResetTokenExpires: expires,
      }
    );
    return user;
  } catch (err: any) {
    throw new Error("Cannot update user password reset token", err.message);
  }
}

/**
 * Verifies the user by email.
 * @param email - The email of the user.
 * @param role - The role of the user.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot verify user.
 * @returns {Promise<IUser | null>} Returns the user object with the verified user or null.
 */
export async function verifyUserByEmail(
  email: string,
  role: string | undefined = "User"
): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user: IUser | null = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        verified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
        role,
      }
    );
    return user;
  } catch (err: any) {
    throw new Error("Cannotverify user", err.message);
  }
}

/**
 * Marks the user logged with OAuth as verified.
 * @param email - The email of the user.
 * @param role - The role of the user.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot verify user.
 * @returns {Promise<IUser | null>} Returns the user object with the verified user or null.
 */
export async function verifyOAuthUser(
  email: string,
  role: string | undefined = "User"
): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user: IUser | null = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        verified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
        isOAuthUser: true,
        role,
      }
    );
    return user;
  } catch (err: any) {
    throw new Error("Cannotverify user", err.message);
  }
}

/**
 * Updates the forgotten user password with resettoken by email.
 * @param email - The email of the user.
 * @param password - The password of the user.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot update user password.
 * @returns {Promise<IUser | null>} Returns the user object with the updated user or null.
 */
export async function newUserPasswordByEmail(
  email: string,
  password: string
): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user: IUser | null = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        passwordResetToken: null,
        passwordResetTokenExpires: null,
        password: password,
      }
    );
    return user;
  } catch (err: any) {
    throw new Error("Cannot update user password", err.message);
  }
}

/**
 * Updates the user by id.
 * @param id - The id of the user.
 * @param updatedUser - The updated user data.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot update user.
 * @returns {Promise<IUser | null>} Returns the user object with the updated user or null.
 */
export async function updateUser(
  id: string,
  updatedUser: IUser
): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user = await User.findByIdAndUpdate(id, updatedUser, {
      new: true,
    });
    return user;
  } catch (err: any) {
    throw new Error("Cannot update user", err.message);
  }
}

/**
 * Changes the user password by id.
 * @param id - The id of the user.
 * @param hashedPassword - The hashed password of the user.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If Cannot change password.
 * @returns {Promise<IUser | null>} Returns the user object with the changed password or null.
 *
 */

export async function changePassword(
  id: string,
  hashedPassword: string
): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });
  try {
    const user: IUser | null = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      {
        new: true,
      }
    );
    return user;
  } catch (err: any) {
    throw new Error("Cannot change password", err.message);
  }
}

/**
 * Changes the isOauth user field id.
 * @param id - The id of the user.
 * @param isOAuthUser - The isOAuthUser field new value.
 * @throws {Error} - If Cannot connect to DB.
 * @throws {Error} - If cannot unlink OAuth connection.
 * @returns {Promise<IUser | null>} Returns the user object with the changed email or null.
 */
export async function changeIsOauthUser(
  _id: string,
  isOAuthUser: boolean
): Promise<IUser | null> {
  connectToMongoDB().catch((err) => {
    throw new Error("Cannot connect to DB", err.message);
  });

  const mongooseSession = await mongoose.startSession();
  try {
    mongooseSession.startTransaction();
    const user: IUser | null = await User.findByIdAndUpdate(
      _id,
      { isOAuthUser },
      {
        new: true,
        session: mongooseSession,
      }
    );

    if (!isOAuthUser) {
      await Account.deleteMany(
        { userId: new ObjectId(_id) },
        { session: mongooseSession }
      );
    }
    await mongooseSession.commitTransaction();
    return user;
  } catch (err: any) {
    await mongooseSession.abortTransaction();
    throw new Error("Cannot unlink OAuth connection", err.message);
  } finally {
    mongooseSession.endSession();
  }
}
