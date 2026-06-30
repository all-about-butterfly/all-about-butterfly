'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { SiteHeader } from './SiteHeader';
import { PAPERS, BFLY, FRAME_GALLERY } from '@/data/frameBuilder';
import { INK, INK_FG, BORDER } from '@/lib/theme';

type Item = {
  uid: string;
  key: string;
  vn: string;
  src: string;
  x: number;
  y: number;
  wcm: number;
  rot: number;
  flip: 1 | -1;
  ar: number;
};

type Size = '13x15' | '15x21';
type Orient = 'portrait' | 'landscape';

const WOOD = {
  top: '#74502d', l: '#5c3d22', r: '#432d18', b: '#30200f',
  grain: '#1f1305', edge: '#160d04', hi: 'rgba(255,236,205,.42)',
};

function capFor(size: Size): number {
  return size === '13x15' ? 1 : 2;
}
function dispDimsFor(orient: Orient): [number, number] {
  return orient === 'landscape' ? [21, 15] : [15, 21];
}
// Max width (display-cm) a butterfly can have without spilling out of its
// slot. Constrains BOTH width and height (via the image's own aspect ratio)
// — a width-only cap lets large or tall-winged species (Morpho, Luna) bleed
// into the other slot in either orientation, which is what made them
// effectively "only fit one" before.
function slotMaxWidth(cap: number, orient: Orient, dispW: number, dispH: number, ar: number): number {
  const [wFrac, hFrac] = cap === 1 ? [0.88, 0.88] : orient === 'portrait' ? [0.84, 0.3] : [0.34, 0.84];
  return Math.min(dispW * wFrac, (dispH * hFrac) / ar);
}
function clampItems(items: Item[], cap: number, orient: Orient, dispW: number, dispH: number): Item[] {
  return items.map((it) => ({ ...it, wcm: Math.min(it.wcm, slotMaxWidth(cap, orient, dispW, dispH, it.ar || 0.62)) }));
}
function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
}

function PaperImg({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete) {
      if (el.naturalWidth === 0) setBroken(true);
      else setLoaded(true);
    }
  }, []);
  if (broken) return null;
  return (
    <img
      ref={imgRef}
      src={src}
      alt=""
      onLoad={() => setLoaded(true)}
      onError={() => setBroken(true)}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: loaded ? 1 : 0, transition: 'opacity .2s ease' }}
    />
  );
}

function PaperLayer({ src, gradient, style }: { src: string; gradient: string; style?: CSSProperties }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: gradient, overflow: 'hidden', ...style }}>
      {/* key={src} forces a fresh mount per paper so a 404'd image (e.g. the
          default) can't leave a stale "broken" state stuck for every paper
          picked afterwards. */}
      <PaperImg key={src} src={src} />
    </div>
  );
}

export default function XuongGhepKhungPage() {
  const [size, setSize] = useState<Size>('13x15');
  const [orient, setOrient] = useState<Orient>('portrait');
  const [paper, setPaper] = useState(PAPERS[0].key);
  const [items, setItems] = useState<Item[]>([]);
  const [sel, setSel] = useState<string | null>(null);

  const innerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ uid: string; dx: number; dy: number } | null>(null);
  const arCache = useRef<Record<string, number>>({});

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      const inner = innerRef.current;
      if (!drag || !inner) return;
      const r = inner.getBoundingClientRect();
      let x = ((e.clientX - r.left) / r.width) * 100 + drag.dx;
      let y = ((e.clientY - r.top) / r.height) * 100 + drag.dy;
      x = Math.max(2, Math.min(98, x));
      y = Math.max(2, Math.min(98, y));
      setItems((cur) => cur.map((it) => (it.uid === drag.uid ? { ...it, x, y } : it)));
    };
    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        document.body.style.cursor = '';
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Backspace' && e.key !== 'Delete') return;
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable)) return;
      setSel((curSel) => {
        if (!curSel) return curSel;
        setItems((cur) => cur.filter((it) => it.uid !== curSel));
        return null;
      });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey);
    try {
      const q = new URLSearchParams(window.location.search).get('b');
      if (q && BFLY.some((b) => b.key === q)) addBfly(q);
    } catch {}
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addBfly(key: string) {
    const b = BFLY.find((x) => x.key === key);
    if (!b) return;
    const cap = capFor(size);
    if (cap !== 1 && items.length >= cap) return;
    const [dW, dH] = dispDimsFor(orient);
    const ar0 = arCache.current[key] || 0.62;
    // Generate the uid once, outside the state updater — React (Strict Mode,
    // in particular) can invoke updater functions more than once, and a
    // random id regenerated on each invocation desyncs items/sel.
    const uid = Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const base = cap === 1 ? [] : items;
    const n = base.length;
    let x = 50, y = 50;
    if (cap === 2) {
      if (orient === 'portrait') { x = 50; y = n === 0 ? 32 : 68; }
      else { x = n === 0 ? 29 : 71; y = 50; }
    }
    const wcm = Math.min(b.wsp, slotMaxWidth(cap, orient, dW, dH, ar0));
    setItems([...base, { uid, key: b.key, vn: b.vn, src: b.src, x, y, wcm, rot: 0, flip: 1, ar: ar0 }]);
    setSel(uid);
    if (!arCache.current[key]) {
      loadImg(b.src).then((img) => {
        const ar = img.naturalHeight / img.naturalWidth;
        arCache.current[key] = ar;
        // The real aspect ratio can differ from the 0.62 fallback used above
        // (e.g. Luna's elongated wings) — re-clamp now that it's known, so
        // the slot constraint actually holds once the photo is in.
        const max = slotMaxWidth(cap, orient, dW, dH, ar);
        setItems((cur) => cur.map((it) => (it.key === key ? { ...it, ar, wcm: Math.min(it.wcm, max) } : it)));
      }).catch(() => {});
    }
  }

  function patchSel(patch: Partial<Item>) {
    setItems((cur) => cur.map((it) => (it.uid === sel ? { ...it, ...patch } : it)));
  }

  function setSizeAndClamp(next: Size) {
    setSize(next);
    const cap = capFor(next);
    const [dW, dH] = dispDimsFor(orient);
    const kept = cap === 1 ? items.slice(0, 1) : items;
    const clamped = clampItems(kept, cap, orient, dW, dH);
    setItems(clamped);
    if (cap === 1) setSel(clamped[0] ? clamped[0].uid : null);
  }
  function setOrientAndClamp(next: Orient) {
    setOrient(next);
    const cap = capFor(size);
    const [dW, dH] = dispDimsFor(next);
    setItems(clampItems(items, cap, next, dW, dH));
  }

  async function download() {
    const [dw0, dh0] = orient === 'landscape' ? [21, 15] : [15, 21];
    const K = 132, b = Math.round(1.05 * K);
    const iW = Math.round(dw0 * K), iH = Math.round(dh0 * K);
    const W = iW + 2 * b, H = iH + 2 * b;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const quad = (pts: [number, number][], fill: string | CanvasGradient) => {
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    };
    const bevW = Math.round(b * 0.22);
    const fo = b - bevW;
    quad([[0, 0], [W, 0], [W - fo, fo], [fo, fo]], WOOD.top);
    quad([[W, 0], [W, H], [W - fo, H - fo], [W - fo, fo]], WOOD.r);
    quad([[0, H], [W, H], [W - fo, H - fo], [fo, H - fo]], WOOD.b);
    quad([[0, 0], [0, H], [fo, H - fo], [fo, fo]], WOOD.l);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H); ctx.rect(fo, fo, W - 2 * fo, H - 2 * fo); ctx.clip('evenodd');
    for (let i = 0; i < 150; i++) {
      ctx.globalAlpha = 0.018 + Math.random() * 0.05;
      ctx.strokeStyle = Math.random() > 0.5 ? WOOD.grain : WOOD.edge;
      ctx.lineWidth = 0.6 + Math.random() * 1.6;
      const horiz = Math.random() > 0.5;
      if (horiz) {
        const yy = Math.random() * H;
        ctx.beginPath(); ctx.moveTo(0, yy);
        ctx.bezierCurveTo(W * 0.33, yy + (Math.random() * 8 - 4), W * 0.66, yy + (Math.random() * 8 - 4), W, yy + (Math.random() * 6 - 3));
        ctx.stroke();
      } else {
        const xx = Math.random() * W;
        ctx.beginPath(); ctx.moveTo(xx, 0);
        ctx.bezierCurveTo(xx + (Math.random() * 8 - 4), H * 0.33, xx + (Math.random() * 8 - 4), H * 0.66, xx + (Math.random() * 6 - 3), H);
        ctx.stroke();
      }
    }
    ctx.restore();
    quad([[fo, fo], [W - fo, fo], [W - b, b], [b, b]], 'rgba(8,5,1,.5)');
    quad([[W - fo, fo], [W - fo, H - fo], [W - b, H - b], [W - b, b]], 'rgba(8,5,1,.42)');
    quad([[fo, H - fo], [W - fo, H - fo], [W - b, H - b], [b, H - b]], WOOD.hi);
    quad([[fo, fo], [fo, H - fo], [b, H - b], [b, b]], 'rgba(255,238,208,.16)');
    ctx.strokeStyle = 'rgba(12,7,2,.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(b, b); ctx.moveTo(W, 0); ctx.lineTo(W - b, b);
    ctx.moveTo(W, H); ctx.lineTo(W - b, H - b); ctx.moveTo(0, H); ctx.lineTo(b, H - b);
    ctx.stroke();
    ctx.strokeStyle = WOOD.edge; ctx.lineWidth = 1.4; ctx.strokeRect(0.7, 0.7, W - 1.4, H - 1.4);
    ctx.strokeStyle = 'rgba(255,240,215,.18)'; ctx.lineWidth = 1; ctx.strokeRect(fo + 0.5, fo + 0.5, W - 2 * fo - 1, H - 2 * fo - 1);
    ctx.strokeStyle = 'rgba(20,12,4,.7)'; ctx.lineWidth = 2; ctx.strokeRect(b - 1, b - 1, iW + 2, iH + 2);
    const hl = ctx.createLinearGradient(0, 0, 0, fo);
    hl.addColorStop(0, WOOD.hi); hl.addColorStop(1, 'rgba(255,244,222,0)');
    quad([[0, 0], [W, 0], [W - fo, fo], [fo, fo]], hl);
    try {
      const p = PAPERS.find((x) => x.key === paper)!;
      const img = await loadImg(p.src);
      const sc = Math.max(iW / img.naturalWidth, iH / img.naturalHeight);
      const pw = img.naturalWidth * sc, ph = img.naturalHeight * sc;
      ctx.save(); ctx.beginPath(); ctx.rect(b, b, iW, iH); ctx.clip();
      ctx.drawImage(img, b + (iW - pw) / 2, b + (iH - ph) / 2, pw, ph);
      ctx.restore();
    } catch {}
    for (const it of items) {
      try {
        const img = await loadImg(it.src);
        const w = (it.wcm / dw0) * iW;
        const h = w * (img.naturalHeight / img.naturalWidth);
        const cx = b + (it.x / 100) * iW, cy = b + (it.y / 100) * iH;
        ctx.save();
        ctx.translate(cx, cy); ctx.rotate((it.rot * Math.PI) / 180); ctx.scale(it.flip, 1);
        ctx.shadowColor = 'rgba(40,30,12,.3)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 14;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        ctx.restore();
      } catch {}
    }
    ctx.save(); ctx.beginPath(); ctx.rect(b, b, iW, iH); ctx.clip();
    const sh = Math.round(K * 0.55);
    const grad = (x0: number, y0: number, x1: number, y1: number, a: number) => {
      const gg = ctx.createLinearGradient(x0, y0, x1, y1);
      gg.addColorStop(0, `rgba(40,28,10,${a})`); gg.addColorStop(1, 'rgba(40,28,10,0)');
      return gg;
    };
    ctx.fillStyle = grad(0, b, 0, b + sh, 0.4); ctx.fillRect(b, b, iW, sh);
    ctx.fillStyle = grad(b, 0, b + sh, 0, 0.3); ctx.fillRect(b, b, sh, iH);
    ctx.fillStyle = grad(0, b + iH, 0, b + iH - sh, 0.22); ctx.fillRect(b, b + iH - sh, iW, sh);
    ctx.fillStyle = grad(b + iW, 0, b + iW - sh, 0, 0.22); ctx.fillRect(b + iW - sh, b, sh, iH);
    const gl = ctx.createLinearGradient(b, b, b + iW * 0.65, b + iH);
    gl.addColorStop(0, 'rgba(255,255,255,.13)'); gl.addColorStop(0.2, 'rgba(255,255,255,.03)'); gl.addColorStop(0.42, 'rgba(255,255,255,0)');
    ctx.fillStyle = gl; ctx.fillRect(b, b, iW, iH);
    ctx.restore();
    c.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'AAB-khung-' + size + '-' + orient + '.png';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }, 'image/png');
  }

  function reset() {
    setItems([]);
    setSel(null);
  }

  const cap = capFor(size);
  const [dispW, dispH] = orient === 'landscape' ? [21, 15] : [15, 21];
  const selected = items.find((it) => it.uid === sel) || null;
  const selMaxW = selected ? slotMaxWidth(cap, orient, dispW, dispH, selected.ar || 0.62) : dispW;
  const capLabel = items.length >= cap ? `Đã đủ ${cap} bướm` : items.length === 0 ? `Còn ${cap} chỗ` : `${items.length}/${cap} bướm`;
  const innerH = orient === 'landscape' ? 'clamp(240px, 36vh, 340px)' : 'clamp(320px, 50vh, 470px)';
  const activePaper = PAPERS.find((p) => p.key === paper)!;

  const frameStyle: CSSProperties = {
    background: `repeating-linear-gradient(90deg, rgba(255,248,232,.05) 0 1px, rgba(0,0,0,0) 1px 3px, rgba(18,11,3,.06) 3px 4px, rgba(0,0,0,0) 4px 8px), repeating-linear-gradient(90deg, rgba(18,11,3,.05) 0 7px, rgba(255,245,228,.03) 7px 9px, rgba(0,0,0,0) 9px 22px), conic-gradient(from -45deg, ${WOOD.top} 0deg 90deg, ${WOOD.r} 90deg 180deg, ${WOOD.b} 180deg 270deg, ${WOOD.l} 270deg 360deg)`,
    padding: 'clamp(24px,4.4vh,40px)', borderRadius: 4, width: 'max-content', margin: '0 auto',
    boxShadow: `0 0 0 1px ${WOOD.edge}, inset 0 2px 1px ${WOOD.hi}, inset 0 -2px 2px rgba(12,7,2,.5), 0 34px 50px -24px rgba(24,15,5,.62), 0 10px 20px -12px rgba(24,15,5,.45)`,
  };
  const bevelStyle: CSSProperties = {
    padding: 'clamp(7px,1.1vh,12px)',
    background: `conic-gradient(from -45deg, rgba(8,5,1,.5) 0deg 90deg, rgba(8,5,1,.42) 90deg 180deg, ${WOOD.hi} 180deg 270deg, rgba(255,238,208,.14) 270deg 360deg), ${WOOD.b}`,
    borderRadius: 2,
    boxShadow: `inset 0 2px 2px rgba(8,5,1,.55), inset 0 -1px 1px ${WOOD.hi}`,
  };
  const innerStyle: CSSProperties = {
    position: 'relative', overflow: 'hidden', background: '#efe7d2',
    height: innerH, width: 'auto', aspectRatio: `${dispW} / ${dispH}`,
    transition: 'height .35s ease, aspect-ratio .35s ease',
    touchAction: 'none', cursor: items.length ? 'default' : 'auto',
    boxShadow: 'inset 0 0 0 1px rgba(40,28,12,.55), inset 0 18px 30px -12px rgba(30,20,8,.5), inset 0 -8px 18px -8px rgba(30,20,8,.28), inset 12px 0 22px -14px rgba(30,20,8,.3), inset -12px 0 22px -14px rgba(30,20,8,.3)',
  };

  return (
    <div style={{ overflowX: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: INK, color: '#cdbb73', textAlign: 'center', padding: '9px 16px', fontSize: 11.5, letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 500 }}>
        Xưởng ghép khung &nbsp;·&nbsp; Thử bố cục bướm &amp; nền giấy &nbsp;·&nbsp; Tải bản xem trước miễn phí
      </div>

      <SiteHeader current="xuong-ghep-khung" />

      {/* INTRO */}
      <section style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: 'clamp(28px,4vw,52px) clamp(20px,5vw,64px) 8px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: '#8a7630', marginBottom: 14 }}>Playground</div>
        <h1 className="font-display" style={{ fontWeight: 600, fontSize: 'clamp(30px,4.4vw,52px)', lineHeight: 1.04, letterSpacing: '-.01em', color: '#2c2a16', margin: '0 0 14px' }}>
          Tự tay ghép khung bướm <span style={{ fontStyle: 'italic', fontWeight: 500 }}>của riêng bạn</span>
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 680, margin: 0, color: '#544f30' }}>
          Chọn kích thước khung, xoay dọc hay ngang, thử các nền giấy cổ điển và sắp đặt những chú bướm yêu thích. Kéo để di chuyển, chỉnh kích thước &amp; góc nghiêng — rồi tải bản xem trước để gửi cho chúng tôi đặt làm.
        </p>
      </section>

      {/* WORKSPACE */}
      <section style={{ maxWidth: 1280, margin: '0 auto', width: '100%', flex: 1, padding: 'clamp(20px,3vw,36px) clamp(20px,5vw,64px) clamp(48px,6vw,80px)', display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px,3vw,44px)', alignItems: 'flex-start' }}>

        {/* STAGE */}
        <div style={{ flex: '1 1 460px', minWidth: 300, position: 'sticky', top: 96 }}>
          <div style={{ background: 'linear-gradient(165deg,#efe7cf,#ddd0ac)', border: '1px solid #cdbf98', borderRadius: 6, padding: 'clamp(26px,4vw,56px) clamp(16px,3vw,40px)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 440, boxShadow: 'inset 0 1px 0 rgba(255,255,255,.5)' }}>
            <div style={{ filter: 'drop-shadow(0 26px 40px rgba(54,40,16,.34))' }}>
              <div style={frameStyle}>
                <div style={bevelStyle}>
                  <div ref={innerRef} onPointerDown={() => setSel(null)} style={innerStyle}>
                    <PaperLayer src={activePaper.src} gradient={activePaper.gradient} />
                    <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none', background: 'linear-gradient(128deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,.045) 17%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 73%, rgba(255,255,255,.05) 100%)' }} />
                    {items.map((it, i) => {
                      const isSel = it.uid === sel;
                      return (
                        <div
                          key={it.uid}
                          style={{
                            position: 'absolute', left: it.x + '%', top: it.y + '%', width: (it.wcm / dispW) * 100 + '%',
                            aspectRatio: `1 / ${it.ar || 0.62}`,
                            transform: 'translate(-50%,-50%)',
                            zIndex: isSel ? 40 : 10 + i,
                          }}
                        >
                          <div
                            onPointerDown={(e) => {
                              e.stopPropagation(); e.preventDefault();
                              const r = innerRef.current!.getBoundingClientRect();
                              const px = ((e.clientX - r.left) / r.width) * 100;
                              const py = ((e.clientY - r.top) / r.height) * 100;
                              dragRef.current = { uid: it.uid, dx: it.x - px, dy: it.y - py };
                              document.body.style.cursor = 'grabbing';
                              setSel(it.uid);
                            }}
                            style={{
                              position: 'absolute', inset: 0,
                              backgroundImage: `url("${it.src}")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
                              transform: `rotate(${it.rot}deg) scaleX(${it.flip})`,
                              cursor: 'grab', touchAction: 'none', userSelect: 'none',
                              filter: 'drop-shadow(0 14px 18px rgba(40,30,12,.34))',
                              outline: isSel ? '2px dashed rgba(90,74,28,.8)' : 'none',
                              outlineOffset: 4,
                            }}
                          />
                          {isSel && (
                            <button
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                e.stopPropagation();
                                setItems((cur) => cur.filter((x) => x.uid !== it.uid));
                                setSel(null);
                              }}
                              aria-label={`Xoá ${it.vn}`}
                              style={{
                                appearance: 'none', position: 'absolute', top: -12, right: -12, zIndex: 50,
                                width: 30, height: 30, borderRadius: '50%',
                                background: '#a85a40', color: '#fff', border: '2px solid #f7f1de',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: '0 4px 12px -2px rgba(0,0,0,.45)',
                                touchAction: 'none',
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M5 5l14 14M19 5L5 19" /></svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {items.length === 0 && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, pointerEvents: 'none', color: '#9a8f63' }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#b3a571" strokeWidth={1.3} style={{ marginBottom: 12 }}>
                          <path d="M12 7c0-2 2-4 4.5-4S21 5 20 8c-.7 2-4 4-8 4M12 7c0-2-2-4-4.5-4S3 5 4 8c.7 2 4 4 8 4M12 7v13M9 20h6" />
                        </svg>
                        <div className="font-display" style={{ fontStyle: 'italic', fontSize: 19, color: '#7d6f3f' }}>Chọn một chú bướm để bắt đầu</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <button onClick={download} className="btn-fill" style={{ appearance: 'none', cursor: 'pointer', border: 'none', background: INK, color: INK_FG, padding: '14px 30px', borderRadius: 3, fontSize: 12, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK_FG} strokeWidth={1.8}><path d="M12 3v12M7 11l5 5 5-5M5 21h14" /></svg>
              Tải ảnh xem trước
            </button>
            <button onClick={reset} style={{ appearance: 'none', cursor: 'pointer', background: 'transparent', border: `1px solid ${BORDER}`, color: '#5b5224', padding: '14px 24px', borderRadius: 3, fontSize: 12, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase' }}>
              Làm lại từ đầu
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11.5, color: '#9a8f63', margin: '14px 0 0', letterSpacing: '.02em' }}>Bản xem trước chỉ mang tính minh hoạ bố cục · Khung &amp; tiêu bản thật được làm thủ công</p>
        </div>

        {/* CONTROLS */}
        <aside style={{ flex: '1 1 360px', minWidth: 300, display: 'flex', flexDirection: 'column', gap: 26 }}>

          {/* SIZE */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#8a7630', marginBottom: 13 }}>1 · Kích thước khung</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setSizeAndClamp('13x15')} style={{ appearance: 'none', cursor: 'pointer', textAlign: 'left', padding: '16px 18px', borderRadius: 5, transition: '.2s', background: size === '13x15' ? INK : '#f7f1de', color: size === '13x15' ? INK_FG : '#2c2a16', border: `1px solid ${size === '13x15' ? INK : BORDER}` }}>
                <div className="font-display" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1 }}>13 × 15<span style={{ fontSize: 14 }}> cm</span></div>
                <div style={{ fontSize: 12, marginTop: 5, opacity: 0.85 }}>1 chú bướm</div>
              </button>
              <button onClick={() => setSizeAndClamp('15x21')} style={{ appearance: 'none', cursor: 'pointer', textAlign: 'left', padding: '16px 18px', borderRadius: 5, transition: '.2s', background: size === '15x21' ? INK : '#f7f1de', color: size === '15x21' ? INK_FG : '#2c2a16', border: `1px solid ${size === '15x21' ? INK : BORDER}` }}>
                <div className="font-display" style={{ fontSize: 24, fontWeight: 600, lineHeight: 1 }}>15 × 21<span style={{ fontSize: 14 }}> cm</span></div>
                <div style={{ fontSize: 12, marginTop: 5, opacity: 0.85 }}>Tối đa 2 bướm</div>
              </button>
            </div>
          </div>

          {/* ORIENT */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#8a7630', marginBottom: 13 }}>2 · Hướng khung</div>
            <div style={{ display: 'inline-flex', border: `1px solid ${BORDER}`, borderRadius: 5, overflow: 'hidden' }}>
              <button onClick={() => setOrientAndClamp('portrait')} style={{ appearance: 'none', cursor: 'pointer', border: 'none', padding: '11px 22px', fontSize: 12.5, fontWeight: 500, letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 9, transition: '.2s', background: orient === 'portrait' ? INK : 'transparent', color: orient === 'portrait' ? INK_FG : '#4a4628' }}>
                <svg width="13" height="16" viewBox="0 0 13 16" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="1" y="1" width="11" height="14" rx="1" /></svg>Dọc
              </button>
              <button onClick={() => setOrientAndClamp('landscape')} style={{ appearance: 'none', cursor: 'pointer', border: 'none', borderLeft: `1px solid ${BORDER}`, padding: '11px 22px', fontSize: 12.5, fontWeight: 500, letterSpacing: '.04em', display: 'flex', alignItems: 'center', gap: 9, transition: '.2s', background: orient === 'landscape' ? INK : 'transparent', color: orient === 'landscape' ? INK_FG : '#4a4628' }}>
                <svg width="16" height="13" viewBox="0 0 16 13" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="1" y="1" width="14" height="11" rx="1" /></svg>Ngang
              </button>
            </div>
          </div>

          {/* PAPER */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#8a7630', marginBottom: 13 }}>3 · Nền giấy</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: 12 }}>
              {PAPERS.map((p) => {
                const active = paper === p.key;
                return (
                  <button key={p.key} onClick={() => setPaper(p.key)} style={{ appearance: 'none', cursor: 'pointer', padding: 0, borderRadius: 4, overflow: 'hidden', background: '#fff', transition: '.2s', border: `2px solid ${active ? '#5a4a1c' : 'transparent'}`, boxShadow: '0 3px 8px -4px rgba(40,36,16,.4)' }}>
                    <div style={{ position: 'relative', width: '100%', height: 74 }}>
                      <PaperLayer src={p.src} gradient={p.gradient} />
                    </div>
                    <div style={{ fontSize: 10.5, padding: '6px 4px', color: active ? INK_FG : '#6c6440', background: active ? '#5a4a1c' : '#f3ecd7', letterSpacing: '.02em', lineHeight: 1.25 }}>{p.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELECTED CONTROLS */}
          {selected && (
            <div style={{ background: '#f7f1de', border: `1px solid ${BORDER}`, borderRadius: 6, padding: 20, animation: 'popIn .25s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="font-display" style={{ fontStyle: 'italic', fontSize: 19, color: '#2c2a16' }}>{selected.vn}</div>
                <button
                  onClick={() => { setItems((cur) => cur.filter((it) => it.uid !== sel)); setSel(null); }}
                  aria-label="Xoá"
                  style={{ appearance: 'none', cursor: 'pointer', border: '1px solid #d8b3a3', background: 'transparent', color: '#a85a40', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
                </button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#7d7448', marginBottom: 7 }}>
                  <span style={{ letterSpacing: '.1em', textTransform: 'uppercase' }}>Sải cánh thật</span>
                  <span>{selected.wcm.toFixed(1).replace('.', ',')} cm</span>
                </div>
                <input type="range" min={2} max={Math.max(2, selMaxW)} step={0.5} value={selected.wcm} onChange={(e) => patchSel({ wcm: +e.target.value })} style={{ width: '100%' }} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#7d7448', marginBottom: 7 }}>
                  <span style={{ letterSpacing: '.1em', textTransform: 'uppercase' }}>Xoay nghiêng</span>
                  <span>{selected.rot}°</span>
                </div>
                <input type="range" min={-45} max={45} step={1} value={selected.rot} onChange={(e) => patchSel({ rot: +e.target.value })} style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => patchSel({ flip: (selected.flip * -1) as 1 | -1 })} style={{ appearance: 'none', cursor: 'pointer', flex: 1, background: 'transparent', border: `1px solid ${BORDER}`, color: '#5b5224', padding: 10, borderRadius: 4, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M12 3v18M7 8l-4 4 4 4M17 8l4 4-4 4" /></svg>Lật ngang
                </button>
                <button onClick={() => patchSel({ rot: 0 })} style={{ appearance: 'none', cursor: 'pointer', flex: 1, background: 'transparent', border: `1px solid ${BORDER}`, color: '#5b5224', padding: 10, borderRadius: 4, fontSize: 12, fontWeight: 500 }}>
                  Đặt thẳng
                </button>
              </div>
            </div>
          )}

          {/* BUTTERFLY PALETTE */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 13 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: '#8a7630' }}>4 · Chọn bướm</div>
              <div style={{ fontSize: 11.5, color: '#9a8f63' }}>{capLabel}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(80px,1fr))', gap: 10 }}>
              {BFLY.map((b) => (
                <button key={b.key} onClick={() => addBfly(b.key)} title={b.vn} style={{ appearance: 'none', cursor: 'pointer', background: '#f7f1de', border: '1px solid #e0d5b3', borderRadius: 5, padding: '8px 6px 7px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: '.2s' }}>
                  <div style={{ width: '100%', height: 50, backgroundImage: `url("${b.src}")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
                  <span style={{ fontSize: 10, lineHeight: 1.2, textAlign: 'center', color: '#6c6440' }}>{b.vn}</span>
                </button>
              ))}
            </div>
          </div>

        </aside>
      </section>

      {/* CUSTOMER GALLERY / CAROUSEL */}
      <section style={{ marginTop: 'clamp(40px,5vw,72px)', padding: 'clamp(52px,6vw,84px) 0', background: INK, overflow: 'hidden' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px,5vw,64px)', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: '#cdbb73', marginBottom: 16 }}>Tác phẩm đã giao</div>
          <h2 className="font-display" style={{ fontWeight: 500, fontSize: 'clamp(28px,4vw,46px)', color: '#f4ecc9', margin: '0 0 14px', lineHeight: 1.06 }}>Những khung bướm <span style={{ fontStyle: 'italic' }}>đã đến tay khách</span></h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 560, margin: '0 auto', color: '#d8cda0' }}>Mỗi chiếc hộp gỗ shadow box là một tiêu bản thật, được đóng khung thủ công trên nền giấy cổ điển — đây là một vài mẫu thực tế chúng tôi đã thực hiện.</p>
        </div>
        <div className="aab-marquee-viewport" style={{ marginTop: 'clamp(34px,4vw,54px)', width: '100%', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)', maskImage: 'linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)' }}>
          <div className="aab-marquee-track" style={{ display: 'flex', gap: 'clamp(18px,2vw,30px)', width: 'max-content', willChange: 'transform' }}>
            {[...FRAME_GALLERY, ...FRAME_GALLERY].map((g, i) => (
              <img key={i} src={g.src} alt={i < FRAME_GALLERY.length ? g.alt : ''} aria-hidden={i >= FRAME_GALLERY.length} loading="lazy" style={{ height: 'clamp(290px,36vw,400px)', width: 'auto', flex: 'none', borderRadius: 3, boxShadow: '0 24px 44px -22px rgba(0,0,0,.7)' }} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: INK, color: '#cdbb73' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(34px,4vw,54px) clamp(20px,5vw,64px)', display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/images/mark-gold.png" alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            <span className="font-display" style={{ fontWeight: 600, fontSize: 18, color: '#f4ecc9' }}>All About <span style={{ fontStyle: 'italic' }}>Butterfly</span></span>
          </div>
          <a href="/#bo-suu-tap" className="footer-link" style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', borderBottom: '1px solid #6f6936', paddingBottom: 3 }}>← Quay lại bộ sưu tập</a>
        </div>
      </footer>
    </div>
  );
}
