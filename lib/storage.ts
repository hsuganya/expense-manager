'use client'

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getFirebaseStorage } from '@/lib/firebase'

const AVATAR_PATH = 'expense_manager'

/**
 * Upload a profile image for a family member and return its public URL.
 * Path: expense_manager/{userId}/family_members/{memberId}/avatar
 */
export async function uploadFamilyMemberAvatar(
  userId: string,
  memberId: string,
  file: File
): Promise<string> {
  const storage = getFirebaseStorage()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
  const path = `${AVATAR_PATH}/${userId}/family_members/${memberId}/avatar.${safeExt}`
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}
