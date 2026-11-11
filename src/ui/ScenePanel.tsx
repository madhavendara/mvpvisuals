import { useProgress } from '@react-three/drei'
import type { RootState } from '@react-three/fiber'
import Scene from '../scene/Scene'
import { useConfigurator } from '../store'

const styles = {
  frame: { base: 'relative h-full w-full [&_canvas]:block' },
  help: { base: 'pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-[3px] bg-white/85 px-4 py-2 text-[12px] text-[#666]' },
  loading: { base: 'absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-white/90 px-4 py-2 text-[13px] font-semibold text-[#444]' },
}

export default function ScenePanel({ onCreated }: { onCreated?: (state: RootState) => void }) {
  const config = useConfigurator((state) => state.config)
  const { active, progress } = useProgress()

  return <div className={styles.frame.base}>
    <Scene config={config} onCreated={onCreated} />
    <div className={styles.help.base}>Drag to orbit · Scroll to zoom</div>
    {active && <div className={styles.loading.base}>Loading model {Math.round(progress)}%</div>}
  </div>
}
