import { v4 as uuidv4 } from 'uuid'

export function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Alternative using uuid
export function generatePasswordUUID() {
  return uuidv4().split('-')[0] + Math.floor(Math.random() * 1000)
}
