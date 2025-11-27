"use client"

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"

export function PostProcessingEffects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.15} luminanceThreshold={0.95} luminanceSmoothing={0.9} />

      <Vignette offset={0.5} darkness={0.3} eskil={false} />
    </EffectComposer>
  )
}
