import type { ProductConfiguration } from '../src/product/types'
import type { PriceQuote, ShopifyCartAdd } from '../src/product/commerce'

export function buildCartAdd(config: ProductConfiguration, quote: PriceQuote, configurationId: string, publicOrigin: string): ShopifyCartAdd {
  const [tent, ...addOns] = quote.lines
  const tentProperties: Record<string, string> = {
    'Tent size': config.modelId,
    'Production summary': `${publicOrigin}/api/configurations/${configurationId}/pdf`,
    _configuration_id: configurationId,
    _configuration_url: `${publicOrigin}/api/configurations/${configurationId}`,
    _quoted_unit_price: String(tent.unitPriceMinor),
    _quote_currency: quote.currency,
  }
  if (config.notes !== '') tentProperties['Design notes'] = config.notes
  return {
    items: [
      { id: tent.variantId, quantity: tent.quantity, properties: tentProperties },
      ...addOns.map((line) => ({
        id: line.variantId,
        quantity: line.quantity,
        properties: { 'For tent design': configurationId.slice(0, 8), _configuration_id: configurationId, _quoted_unit_price: String(line.unitPriceMinor), _quote_currency: quote.currency },
      })),
    ],
  }
}
