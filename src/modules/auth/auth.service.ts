import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";
import { query } from "../../utils/sql";
import { ConflictError, UnauthorizedError } from "../../utils/errors";

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
  created_at: string;
  updated_at: string;
}

interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const saltRounds = 10;

const stripPassword = (row: UserRow): UserPublic => {
  const { password, ...user } = row;
  return user;
};

export const signup = async (
  name: string,
  email: string,
  password: string,
  role: "contributor" | "maintainer"
) => {
  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    throw new ConflictError("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const result = await query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, hashedPassword, role]
  );

  return stripPassword(result.rows[0] as UserRow);
};

export const login = async (email: string, password: string) => {
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  if (result.rows.length === 0) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const user = result.rows[0] as UserRow;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    config.jwt_secret,
    { expiresIn: config.jwt_expires_in }
  );

  return {
    token,
    user: stripPassword(user),
  };
};
