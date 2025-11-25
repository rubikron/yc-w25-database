import { unparse } from 'papaparse'
import { Company } from '@/types/company'

export function exportToCSV(companies: Company[], filename: string = 'yc-w25-companies.csv'): void {
  const data = companies.map(company => ({
    Name: company.name,
    Tagline: company.tagline,
    Description: company.description,
    Category: company.category,
    Website: company.website || '',
    'Founding Year': company.foundingYear || '',
    Founders: company.founders.map(f => f.name).join(', '),
    'Funding Round': company.funding?.round || '',
    'Funding Amount': company.funding?.amount || '',
    Employees: company.metrics?.employees || '',
    Tags: company.tags.join(', '),
    LinkedIn: company.links?.linkedin || '',
    Twitter: company.links?.twitter || '',
    GitHub: company.links?.github || '',
  }))

  const csv = unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
