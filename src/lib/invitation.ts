import crypto from 'crypto'

export function hashInvitationCode(code: string): string {
  const salt = process.env.INVITATION_CODE_SALT || 'default-salt'
  return crypto
    .createHmac('sha256', salt)
    .update(code.trim().toLowerCase())
    .digest('hex')
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
