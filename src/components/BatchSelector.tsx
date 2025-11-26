'use client'

import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'

export function BatchSelector() {
  const { selectedBatch, setSelectedBatch } = useStore()

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-background p-1">
      <Button
        variant={selectedBatch === 'F25' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setSelectedBatch('F25')}
        className="h-8"
      >
        Fall 2025
      </Button>
      <Button
        variant={selectedBatch === 'W25' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setSelectedBatch('W25')}
        className="h-8"
      >
        Winter 2025
      </Button>
    </div>
  )
}
