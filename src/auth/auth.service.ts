import { Injectable } from '@nestjs/common'
import { LoginDto } from './login.dto'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from 'src/prisma/prisma.service'
import { compareSync } from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto

    // Validate user credentials
    const user = await this.prismaService.user.findUnique({
      where: { email },
    })

    // Check if user exists and password is correct
    const isPasswordValid = user && compareSync(password, user.password)

    if (!user || !isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // Generate JWT token
    const payload = { name: user.name, email: user.email, role: user.role, sub: user.id }
    const token = this.jwtService.sign(payload)

    return {
      access_token: token,
    }
  }
}
