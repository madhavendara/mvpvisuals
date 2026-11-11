import type { ProductConfiguration } from '../product/types'
import type { PriceQuote, PricingCatalog, ShopifyCartAdd } from '../product/commerce'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, options)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error)
  return data as T
}

function json(method: string, body: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
}

export const configuratorApi = {
  catalog: () => request<PricingCatalog>('/catalog'),
  quote: (config: ProductConfiguration) => request<PriceQuote>('/quote', json('POST', config)),
  cart: (config: ProductConfiguration, preview: string) => request<{ mock: true; configurationId: string; quote: PriceQuote; pdfUrl: string; cart: ShopifyCartAdd }>('/cart', json('POST', { configuration: config, preview })),
  upload: async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<{ assetId: string; url: string; name: string }>('/uploads', { method: 'POST', body: form })
  },
}
