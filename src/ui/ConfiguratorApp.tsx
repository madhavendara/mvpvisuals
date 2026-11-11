import { useEffect, useRef, useState } from 'react'
import type { RootState } from '@react-three/fiber'
import { models } from '../product/models'
import { captureSnapshot } from '../scene/snapshot'
import { configuratorApi } from '../api/client'
import { useCatalogQuote } from '../api/useCatalogQuote'
import { useConfigurator } from '../store'
import type { CatalogOption } from '../product/commerce'
import DesignDialog from './DesignDialog'
import ScenePanel from './ScenePanel'

const lightUpFrameImage = new URL('./assets/light-up-frame.webp', import.meta.url).href

const styles = {
  shell: { base: "mx-auto flex h-svh max-w-[1600px] flex-col overflow-hidden bg-white font-['Overpass',sans-serif] text-[14px] leading-[1.4] text-[#1d1d1d]" },
  product: { base: 'flex min-h-0 flex-1 bg-[#ede8e7] max-[768px]:flex-col' },
  gallery: { base: 'relative h-full w-[65%] min-w-0 max-[1199px]:w-[60%] max-[768px]:h-[45svh] max-[768px]:w-full max-[768px]:shrink-0' },
  galleryFrame: { base: 'h-full w-full' },
  details: { base: 'h-full w-[35%] min-w-0 overflow-y-auto bg-white shadow-[-12px_0_30px_-20px_rgba(0,0,0,.35)] max-[1199px]:w-[40%] max-[768px]:h-auto max-[768px]:min-h-0 max-[768px]:w-full max-[768px]:flex-1 max-[768px]:shadow-none' },
  card: { base: 'w-full px-[60px] pb-10 pt-8 max-[1599px]:px-10 max-[1599px]:pb-6 max-[1199px]:px-8 max-[768px]:px-[17px] max-[768px]:pt-4' },
  breadcrumb: { base: 'my-[10px] text-[14px]' },
  title: { base: "mb-[10px] font-['Encode_Sans_Expanded',sans-serif] text-[32px] font-bold uppercase leading-[1.1]" },
  price: { base: "mb-[15px] font-['Encode_Sans_Expanded',sans-serif] text-[19.2px] font-semibold leading-[1.4]" },
  benefits: { base: 'mb-[15px] flex flex-col gap-[6px]' },
  benefit: { base: 'bg-[linear-gradient(#f1b34a,#f1b34a)] bg-[length:3px_14px] bg-[position:0_50%] bg-no-repeat py-[2px] pl-3 text-[14px] text-[#444]' },
  group: { base: 'mt-[10px] border-0 p-0' },
  groupTitle: { base: 'mb-[3px] text-[14px] uppercase' },
  pills: { base: 'flex flex-wrap pt-[6px]' },
  pill: {
    base: "mb-3 ml-[2px] mr-[6px] bg-white px-[15px] py-[7px] text-left font-['Arimo',sans-serif] text-[14px]",
    variants: { active: 'shadow-[0_0_0_2px_#1d1d1d]', idle: 'shadow-[0_0_0_1px_#ede8e7] hover:shadow-[0_0_0_1px_#1d1d1d]', disabled: 'cursor-not-allowed text-[#b9b4b2] shadow-[0_0_0_1px_#ede8e7]' },
  },
  optionDetail: { base: 'mb-2 text-[14px] leading-[1.4] text-[#242424]' },
  previewCard: { base: 'mb-3 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_#ede8e7]' },
  previewImage: { base: 'block aspect-[4/3] w-full object-cover' },
  previewCaption: { base: 'px-3 py-2 text-[12px] leading-[1.5] text-[#8a8584]' },
  fieldLabel: { base: 'mb-[3px] mt-[10px] block text-[14px] uppercase' },
  field: { base: 'w-full rounded-[3px] border border-[#ede8e7] bg-white px-[10px] py-[8px] text-[14px] outline-none focus:border-[#1d1d1d]' },
  textarea: { base: 'h-[117px] w-full resize-y rounded-[3px] border border-[#ede8e7] bg-white px-[10px] py-[8px] text-[14px] outline-none focus:border-[#1d1d1d]' },
  priceLines: { base: 'mt-5 flex flex-col gap-1 border-t border-[#ede8e7] pt-4' },
  priceLine: { base: 'flex justify-between gap-4 text-[13px] text-[#444]' },
  primaryButton: { base: 'mt-5 w-full rounded-[3px] bg-[#f1b242] p-5 text-[22.4px] font-bold uppercase text-[#1d1d1d] hover:bg-[#e6a52f] disabled:cursor-not-allowed disabled:opacity-60 max-[1599px]:p-4 max-[1599px]:text-[18px]' },
  secondaryLink: { base: 'mt-3 block w-full text-center text-[14px] font-semibold underline underline-offset-4' },
  notice: { base: 'mt-3 text-[12px] leading-[1.5] text-[#8a8584]' },
  success: { base: 'mt-3 rounded-[3px] bg-[#f2f9ef] p-3 text-[13px] leading-[1.5] text-[#3f6a40] shadow-[0_0_0_1px_#d7e5d5]' },
  successLink: { base: 'mt-2 inline-block font-semibold underline underline-offset-2' },
  toast: { base: 'fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-4 rounded-[3px] bg-[#1d1d1d] py-3 pl-5 pr-3 text-[14px] text-white shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)] max-[768px]:bottom-4 max-[768px]:w-[calc(100%-34px)]' },
  toastClose: { base: 'px-2 text-[20px] leading-none text-white/70 hover:text-white' },
  payload: { base: 'mt-3 max-h-[130px] overflow-auto rounded-[3px] bg-white p-2 font-mono text-[10px] text-[#444]' },
}

function money(minor: number, currency: string) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(minor / 100)
}

function PillGroup<T extends string>({ title, options, value, disabled, onChange }: {
  title: string; options: CatalogOption<T>[]; value: T; disabled: boolean; onChange: (value: T) => void
}) {
  const detail = options.find((option) => option.id === value)!.detail
  return <fieldset className={styles.group.base}>
    <legend className={styles.groupTitle.base}>{title}</legend>
    <div className={styles.pills.base}>{options.map((option) => {
      const state = disabled ? 'disabled' : option.id === value ? 'active' : 'idle'
      return <button key={option.id} type="button" disabled={disabled}
        className={`${styles.pill.base} ${styles.pill.variants[state]}`}
        onClick={() => onChange(option.id)} aria-pressed={option.id === value}>{option.label}</button>
    })}</div>
    {detail && <p className={styles.optionDetail.base}>{detail}</p>}
  </fieldset>
}

export default function ConfiguratorApp() {
  const { catalog, quote, quoteFailed } = useCatalogQuote()
  const config = useConfigurator((state) => state.config)
  const selectModel = useConfigurator((state) => state.selectModel)
  const setFrame = useConfigurator((state) => state.setFrame)
  const setSideWalls = useConfigurator((state) => state.setSideWalls)
  const setHalfWalls = useConfigurator((state) => state.setHalfWalls)
  const setArtworkService = useConfigurator((state) => state.setArtworkService)
  const setQuantity = useConfigurator((state) => state.setQuantity)
  const setNotes = useConfigurator((state) => state.setNotes)
  const beginDesign = useConfigurator((state) => state.beginDesign)
  const saveDesign = useConfigurator((state) => state.saveDesign)
  const cancelDesign = useConfigurator((state) => state.cancelDesign)
  const designSaved = useConfigurator((state) => state.designSaved)
  const errorToastVisible = useConfigurator((state) => state.errorToastVisible)
  const showErrorToast = useConfigurator((state) => state.showErrorToast)
  const hideErrorToast = useConfigurator((state) => state.hideErrorToast)
  const [designOpen, setDesignOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const sceneState = useRef<RootState>(null)
  const [result, setResult] = useState<{ id: string; pdfUrl: string; payload: unknown } | null>(null)

  useEffect(() => { setResult(null) }, [config])

  useEffect(() => {
    if (!errorToastVisible) return
    const timer = window.setTimeout(hideErrorToast, 5000)
    return () => window.clearTimeout(timer)
  }, [errorToastVisible, hideErrorToast])

  const openDesign = () => {
    beginDesign()
    setDesignOpen(true)
  }

  const saveAndClose = () => {
    saveDesign()
    setDesignOpen(false)
  }

  const cancelAndClose = () => {
    cancelDesign()
    setDesignOpen(false)
  }

  const addToCart = async () => {
    setBusy(true)
    try {
      const preview = captureSnapshot(sceneState.current!)
      const cart = await configuratorApi.cart(config, preview)
      setResult({ id: cart.configurationId, pdfUrl: cart.pdfUrl, payload: cart.cart })
      if (window.parent !== window && document.referrer) {
        const origin = new URL(document.referrer).origin
        window.parent.postMessage({ type: 'tent-configurator:add-to-cart', configurationId: cart.configurationId, quote: cart.quote, cart: cart.cart }, origin)
      }
    } catch {
      showErrorToast()
    }
    setBusy(false)
  }

  return <main className={styles.shell.base}>
    <section className={styles.product.base}>
      <div className={styles.gallery.base}>
        <div className={styles.galleryFrame.base}>{!designOpen && <ScenePanel onCreated={(state) => { sceneState.current = state }} />}</div>
      </div>
      <div className={styles.details.base}>
        <div className={styles.card.base}>
          <nav className={styles.breadcrumb.base}>Home → Logo Canopy Tents</nav>
          {!catalog && <p className={styles.notice.base}>Connecting to catalog API…</p>}
          {catalog && <>
            <h1 className={styles.title.base}>{config.modelId} {catalog.productName}</h1>
            <div className={styles.price.base}>{quote ? money(quote.totalMinor, quote.currency) : quoteFailed ? 'Price unavailable' : 'Calculating…'}</div>
            <ul className={styles.benefits.base}>
              <li className={styles.benefit.base}>Production Time: 2 Business Days</li>
              <li className={styles.benefit.base}>Delivery Date: 5–7 Business Days</li>
              <li className={styles.benefit.base}>No Minimum Orders</li>
              <li className={styles.benefit.base}>Free Layouts & No Setup Fees</li>
            </ul>
            <fieldset className={styles.group.base}>
              <legend className={styles.groupTitle.base}>Tent size</legend>
              <div className={styles.pills.base}>{models.map((model) => <button key={model.id} type="button"
                className={`${styles.pill.base} ${styles.pill.variants[config.modelId === model.id ? 'active' : 'idle']}`}
                onClick={() => selectModel(model.id)} aria-pressed={config.modelId === model.id}>{model.size}</button>)}</div>
            </fieldset>
            <PillGroup title="Frame" options={catalog.frames} value={config.frame} disabled={false} onChange={setFrame} />
            {config.frame === 'lightUp' && <figure className={styles.previewCard.base}>
              <img className={styles.previewImage.base} src={lightUpFrameImage} alt="Illuminated light-up canopy frame" />
              <figcaption className={styles.previewCaption.base}>Light-up frame reference photo. The supplied GLBs have no lighting, so the 3D view shows the standard frame.</figcaption>
            </figure>}
            <PillGroup title="Side walls" options={catalog.sideWalls} value={config.sideWalls} disabled={false} onChange={setSideWalls} />
            <PillGroup title="Half walls (set of 2)" options={catalog.halfWalls} value={config.halfWalls}
              disabled={catalog.sideWallsWithoutHalfWalls.includes(config.sideWalls)} onChange={setHalfWalls} />
            {catalog.sideWallsWithoutHalfWalls.includes(config.sideWalls) && <p className={styles.optionDetail.base}>Half walls are not available with three full side walls.</p>}
            <PillGroup title="Artwork service" options={catalog.artworkServices} value={config.artworkService} disabled={false} onChange={setArtworkService} />
            <label className={styles.fieldLabel.base} htmlFor="quantity">Quantity</label>
            <input className={styles.field.base} id="quantity" type="number" min="1" max="100" value={config.quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
            <label className={styles.fieldLabel.base} htmlFor="notes">Design notes (optional)</label>
            <textarea className={styles.textarea.base} id="notes" value={config.notes} onChange={(event) => setNotes(event.target.value)} placeholder="Production instructions or requests" />
            {quote && <div className={styles.priceLines.base}>
              {quote.lines.map((line) => <div className={styles.priceLine.base} key={line.variantId}><span>{line.label} × {line.quantity}</span><span>{money(line.amountMinor, quote.currency)}</span></div>)}
            </div>}
            {!designSaved && <button className={styles.primaryButton.base} type="button" onClick={openDesign}>Continue to design</button>}
            {designSaved && <>
              <button className={styles.primaryButton.base} type="button" disabled={busy || !quote} onClick={addToCart}>{busy ? 'Saving…' : 'Add to cart'}</button>
              <button className={styles.secondaryLink.base} type="button" onClick={openDesign}>Edit design</button>
            </>}
            <p className={styles.notice.base}>Custom {config.modelId} canopy tent with company logo, dye sublimation printing, and a lifetime frame warranty. 2-day production. No minimums, no setup fees.</p>
            {result && <div className={styles.success.base}>
              Configuration saved: {result.id.slice(0, 8)}
              <br /><a className={styles.successLink.base} href={result.pdfUrl} target="_blank" rel="noreferrer">Download production PDF ↗</a>
              <pre className={styles.payload.base}>{JSON.stringify(result.payload, null, 2)}</pre>
            </div>}
          </>}
        </div>
      </div>
    </section>
    {designOpen && catalog && <DesignDialog catalog={catalog} onSave={saveAndClose} onCancel={cancelAndClose} />}
    {errorToastVisible && <div className={styles.toast.base} role="alert">
      <span>Something went wrong. Please try again later.</span>
      <button className={styles.toastClose.base} type="button" aria-label="Close" onClick={hideErrorToast}>×</button>
    </div>}
  </main>
}
