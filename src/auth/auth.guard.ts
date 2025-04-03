import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest()
    const token = request.headers['authorization']?.split(' ')[1]

    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    try {
      const payload = this.jwtService.verify(token, { algorithms: ['HS256'] })

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      })

      if (!user) {
        throw new UnauthorizedException('User not found')
      }
      // Optionally, you can attach the user to the request object
      request.user = user
      return true
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired')
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token')
      }
      throw new UnauthorizedException('Unauthorized')
    }
  }
}
