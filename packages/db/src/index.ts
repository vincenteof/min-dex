import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default prisma

// todo: split model types
export type { Token, Exchange } from '@prisma/client'