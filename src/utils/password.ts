import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Error verifying password");
  }
};
