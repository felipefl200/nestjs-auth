import type { Request, Express } from 'express'
import type { User } from '@prisma/client'

declare global {
  namespace Express {
    export interface Request {
      user?: User
    }
  }
}
