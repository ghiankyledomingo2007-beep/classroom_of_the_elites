import crypto from 'crypto'

export function hashInvitationCode(code: string): string {
  const salt = process.env.INVITATION_CODE_SALT
  if (!salt) throw new Error('INVITATION_CODE_SALT environment variable is required')
  return crypto.pbkdf2Sync(code.trim(), salt, 100000, 32, 'sha512').toString('hex')
}

export function verifyInvitationCode(code: string, hashedCode: string): boolean {
  const inputHash = hashInvitationCode(code)
  
  try {
    const buffer1 = Buffer.from(inputHash, 'hex')
    const buffer2 = Buffer.from(hashedCode, 'hex')
    
    if (buffer1.length !== buffer2.length) {
      return false
    }
    
    return crypto.timingSafeEqual(buffer1, buffer2)
  } catch {
    return false
  }
}
