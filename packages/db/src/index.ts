import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

export default db

// todo: split model types
export type { Token, Exchange } from '@prisma/client'