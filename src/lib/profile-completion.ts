export interface ProfileCompletionInput {
  avatar_url?: string | null
  bio?: string | null
  interests?: string[] | null
  skills?: string[] | null
  favorite_subjects?: string[] | null
  github_url?: string | null
  linkedin_url?: string | null
  portfolio_url?: string | null
  website_url?: string | null
}

export interface ProfileCompletionResult {
  percentage: number
  recommendations: string[]
}

export function calculateProfileCompletion(
  profile: ProfileCompletionInput | null | undefined,
  hasProjects: boolean
): ProfileCompletionResult {
  if (!profile) {
    return {
      percentage: 0,
      recommendations: [
        'Upload a profile picture',
        'Add a biography to describe yourself',
        'Add at least one interest',
        'Add at least one skill',
        'Add your favorite subjects',
        'Add at least one external link',
        'Add at least one project'
      ]
    }
  }

  let score = 0
  const recommendations: string[] = []

  // 1. Profile Picture: 15%
  if (profile.avatar_url && profile.avatar_url.trim() !== '') {
    score += 15
  } else {
    recommendations.push('Upload a profile picture')
  }

  // 2. Biography: 15%
  if (profile.bio && profile.bio.trim() !== '') {
    score += 15
  } else {
    recommendations.push('Add a biography to describe yourself')
  }

  // 3. Interests: 15%
  if (profile.interests && profile.interests.length > 0) {
    score += 15
  } else {
    recommendations.push('Add at least one interest')
  }

  // 4. Skills: 15%
  if (profile.skills && profile.skills.length > 0) {
    score += 15
  } else {
    recommendations.push('Add at least one skill')
  }

  // 5. Favorite Subjects: 15%
  if (profile.favorite_subjects && profile.favorite_subjects.length > 0) {
    score += 15
  } else {
    recommendations.push('Add your favorite subjects')
  }

  // 6. External Links: 15%
  const hasLink =
    (profile.github_url && profile.github_url.trim() !== '') ||
    (profile.linkedin_url && profile.linkedin_url.trim() !== '') ||
    (profile.portfolio_url && profile.portfolio_url.trim() !== '') ||
    (profile.website_url && profile.website_url.trim() !== '')

  if (hasLink) {
    score += 15
  } else {
    recommendations.push('Add at least one external link (GitHub, LinkedIn, Portfolio, or Website)')
  }

  // 7. Projects: 10%
  if (hasProjects) {
    score += 10
  } else {
    recommendations.push('Add at least one project to showcase your work')
  }

  return {
    percentage: score,
    recommendations
  }
}
