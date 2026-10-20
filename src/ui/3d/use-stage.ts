import { useEffect, useRef, useState } from 'react';
import { createStage, hasWebGL2, type Stage, type StageView } from './stage';

/**
 * Mounts a stage in the returned host element for the component's lifetime. `stage` is null until
 * the canvas exists; `supported` turns false when WebGL 2 is missing, so the caller can render
 * its fallback instead. `view` is read once, at mount.
 */
export function useStage(view: StageView) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  const [stage, setStage] = useState<Stage | null>(null);
  const [supported, setSupported] = useState(hasWebGL2);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !supported) return;
    const s = createStage(host, viewRef.current);
    if (!s) {
      setSupported(false);
      return;
    }
    setStage(s);
    return () => {
      s.dispose();
      setStage(null);
    };
  }, [supported]);

  return { hostRef, stage, supported };
}
