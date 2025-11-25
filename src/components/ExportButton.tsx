'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportToCSV } from '@/lib/export'
import { useCompanies } from '@/hooks/useCompanies'

export function ExportButton() {
  const { companies } = useCompanies()

  const handleExport = () => {
    if (companies.length === 0) return
    exportToCSV(companies)
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={companies.length === 0}>
      <Download className="h-4 w-4 mr-2" />
      Export CSV
    </Button>
  )
}
