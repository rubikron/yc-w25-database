'use client'

import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBookmarks } from '@/hooks/useBookmarks'

interface BookmarkButtonProps {
  companyId: string
  size?: 'sm' | 'default'
}

export function BookmarkButton({ companyId, size = 'default' }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const bookmarked = isBookmarked(companyId)

  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'icon' : 'default'}
      onClick={() => toggleBookmark(companyId)}
      className={bookmarked ? 'text-yellow-500' : ''}
    >
      <Star className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
    </Button>
  )
}
