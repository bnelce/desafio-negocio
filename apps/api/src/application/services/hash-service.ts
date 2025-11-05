import * as argon2 from 'argon2'

export class HashService {
  static async hash(value: string): Promise<string> {
    return argon2.hash(value)
  }

  static async verify(hash: string, value: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, value)
    } catch {
      return false
    }
  }
}
