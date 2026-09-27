import { PrismaClient } from '@prisma/client';
import { PrismaBetterSQLite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '..', '..', 'prisma', 'dev.db');
const database = new Database(dbPath);
const adapter = new PrismaBetterSQLite3(database);
const prisma = new PrismaClient({ adapter });

export default prisma;
