import { randomBytes } from 'crypto'

export class TokenService {
  static generate(): string {
    return randomBytes(32).toString('hex')
  }
}
