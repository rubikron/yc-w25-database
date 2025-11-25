import Fuse, { IFuseOptions } from 'fuse.js'
import { Company } from '@/types/company'

const fuseOptions: IFuseOptions<Company> = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'tagline', weight: 0.3 },
    { name: 'description', weight: 0.2 },
    { name: 'category', weight: 0.1 },
    { name: 'tags', weight: 0.1 },
    { name: 'founders.name', weight: 0.2 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
  minMatchCharLength: 2,
}

export function createSearchIndex(companies: Company[]): Fuse<Company> {
  return new Fuse(companies, fuseOptions)
}

export function searchCompanies(
  fuse: Fuse<Company>,
  query: string
): Company[] {
  if (!query.trim()) return []
  return fuse.search(query).map(result => result.item)
}
