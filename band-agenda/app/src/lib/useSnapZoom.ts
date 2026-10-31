// Inzoomen mag, maar zit je er net naast (bijv. 95% of 105%), dan springt de pagina terug naar 100%.
// Browsers laten JS het zoomniveau niet direct zetten; tijdelijk maximum-scale=1 op de viewport-meta
// zetten reset de zoom (iOS Safari + Android Chrome), daarna halen we die beperking weer weg.
import { useEffect } from "react";

const SNAP_RANGE = 0.12; // ±12% rond 100%

export function useSnapZoom() {
  useEffect(() => {
    const vv = window.visualViewport;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    if (!vv || !meta || !("ontouchstart" in window)) return;

    const original = meta.content;
    let timer: number | undefined;

    const snap = () => {
      const off = Math.abs(vv.scale - 1);
      if (off < 0.01 || off > SNAP_RANGE) return; // al 100%, of bewust ver ingezoomd
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1";
      window.setTimeout(() => { meta.content = original; }, 300);
    };

    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(snap, 400); // wacht tot het knijpgebaar klaar is
    };

    vv.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      vv.removeEventListener("resize", onResize);
      meta.content = original;
    };
  }, []);
}
