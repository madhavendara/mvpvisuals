import { useEffect, useState } from 'react'
import { configuratorApi } from './client'
import { useConfigurator } from '../store'
import type { PriceQuote, PricingCatalog } from '../product/commerce'

export function useCatalogQuote() {
  const [catalog, setCatalog] = useState<PricingCatalog | null>(null)
  const [quote, setQuote] = useState<PriceQuote | null>(null)
  const [quoteFailed, setQuoteFailed] = useState(false)
  const config = useConfigurator((state) => state.config)

  useEffect(() => {
    configuratorApi.catalog().then(setCatalog).catch(useConfigurator.getState().showErrorToast)
  }, [])

  useEffect(() => {
    let active = true
    setQuote(null)
    setQuoteFailed(false)
    const timer = window.setTimeout(() => {
      configuratorApi.quote(useConfigurator.getState().config)
        .then((value) => { if (active) setQuote(value) })
        .catch(() => {
          if (!active) return
          setQuoteFailed(true)
          useConfigurator.getState().showErrorToast()
        })
    }, 180)
    return () => { active = false; window.clearTimeout(timer) }
  }, [config.modelId, config.frame, config.sideWalls, config.halfWalls, config.artworkService, config.quantity])

  return { catalog, quote, quoteFailed }
}
