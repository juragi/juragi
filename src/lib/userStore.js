import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const usersFile = path.join(process.cwd(), 'src', 'lib', 'users.json');

async function readUsers() {
  try {
    const file = await fs.readFile(usersFile, 'utf8');
    return JSON.parse(file);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeUsers(users) {
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

export async function getUserByEmail(email) {
  const users = await readUsers();
  return users.find((user) => user.email === email.toLowerCase()) ?? null;
}

export async function addUser({ email, passwordHash }) {
  const normalizedEmail = email.toLowerCase();
  const users = await readUsers();
  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('이미 존재하는 이메일입니다.');
  }

  const newUser = {
    id: randomUUID(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await writeUsers(users);
  return newUser;
}
