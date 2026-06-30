'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Pic } from './Pic';
import { SiteHeader } from './SiteHeader';
import { SPECIES, TYPE_DEFS, COLOUR_DEFS, vibeFor, type Species } from '@/data/species';
import { INK, INK_FG, BORDER, IDLE_FG } from '@/lib/theme';

const TRAITS = [
  { n: '01', title: 'Rực rỡ', desc: 'Sắc màu sặc sỡ, hoa văn táo bạo — những loài sinh ra để toả sáng và được chiêm ngưỡng.' },
  { n: '02', title: 'Ánh kim', desc: 'Màu xanh, tím lấp lánh không đến từ sắc tố mà sinh ra từ cấu trúc siêu nhỏ trên vảy cánh.' },
  { n: '03', title: 'Quý hiếm', desc: 'Khó tìm, khó gặp ngoài tự nhiên — mỗi cá thể là một báu vật đúng nghĩa.' },
  { n: '04', title: 'Khổng lồ', desc: 'Sải cánh ấn tượng khiến người ta phải ngước nhìn và trầm trồ.' },
  { n: '05', title: 'Tinh tế', desc: 'Cánh mỏng như thuỷ tinh, đường nét thanh thoát và đầy mong manh.' },
  { n: '06', title: 'Bí ẩn', desc: 'Nguỵ trang tài tình, ẩn mình hoàn hảo giữa lá cây và bóng rừng.' },
  { n: '07', title: 'Nhiệt đới', desc: 'Đến từ những khu rừng ẩm nhiệt đới rực rỡ và đa dạng bậc nhất hành tinh.' },
  { n: '08', title: 'Biểu tượng', desc: 'Những cái tên đã đi vào văn hoá, tín ngưỡng và truyền thuyết của loài người.' },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => el.classList.add('in-view');

    // Already in (or near) the viewport on mount — don't wait on a scroll
    // event that may never come.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      reveal();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal();
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(el);

    // Safety net: never leave a section permanently invisible if the
    // observer doesn't fire for some reason.
    const fallback = window.setTimeout(reveal, 2000);

    return () => {
      io.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);
  return ref;
}

function Reveal({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal" style={style}>
      {children}
    </div>
  );
}

export default function ButterflyPage() {
  const [order, setOrder] = useState<'popular' | 'random'>('popular');
  const [types, setTypes] = useState<string[]>([]);
  const [colour, setColour] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sizeSort, setSizeSort] = useState<'asc' | 'desc' | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [shuffleOrder, setShuffleOrder] = useState<string[]>([]);
  const [selected, setSelected] = useState<Species | null>(null);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
  }, [selected]);

  const species = useMemo(() => {
    let list = SPECIES.slice();
    if (types.length) list = list.filter((s) => types.some((t) => s.types.includes(t)));
    if (colour) list = list.filter((s) => s.colour === colour);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((s) => (s.vn + ' ' + s.sci + ' ' + s.en + ' ' + s.tag).toLowerCase().includes(q));

    if (sizeSort === 'desc') list = [...list].sort((a, b) => b.wmax - a.wmax);
    else if (sizeSort === 'asc') list = [...list].sort((a, b) => a.wmax - b.wmax);
    else if (order === 'random' && shuffleOrder.length) {
      const idx: Record<string, number> = {};
      shuffleOrder.forEach((id, i) => { idx[id] = i; });
      list = [...list].sort((a, b) => (idx[a.id] ?? 0) - (idx[b.id] ?? 0));
    } else {
      list = [...list].sort((a, b) => a.pop - b.pop);
    }

    return list.map((s, i) => ({
      ...s,
      sizeLabel: `${s.wmax} mm`,
      flapDelay: `${((i * 0.41) % 1.8).toFixed(2)}s`,
    }));
  }, [types, colour, query, sizeSort, order, shuffleOrder]);

  const isEmpty = species.length === 0;
  const isPop = order === 'popular' && !sizeSort;
  const isRand = order === 'random' && !sizeSort;

  function toggleType(key: string) {
    setTypes((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  }
  function pickColour(key: string) {
    setColour((prev) => (prev === key ? null : key));
  }
  function setPopular() {
    setOrder('popular');
    setSizeSort(null);
  }
  function setRandom() {
    const ids = SPECIES.map((s) => s.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setOrder('random');
    setSizeSort(null);
    setShuffleOrder(ids);
  }
  function resetAll() {
    setOrder('popular');
    setTypes([]);
    setColour(null);
    setQuery('');
    setSizeSort(null);
  }

  const selectedVibes = selected ? selected.meaning.split('·').map((w) => w.trim()).filter(Boolean) : [];
  const selectedEmoji = selected ? vibeFor(selectedVibes[0] ?? '') : '🦋';

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* ANNOUNCEMENT */}
      <div style={{ background: INK, color: '#cdbb73', textAlign: 'center', padding: '9px 16px', fontSize: 11.5, letterSpacing: '.22em', textTransform: 'uppercase', fontWeight: 500 }}>
        Tiêu bản bướm thật &nbsp;·&nbsp; Bảo quản &amp; đóng khung thủ công &nbsp;·&nbsp; Giao hàng toàn quốc
      </div>

      {/* HEADER */}
      <SiteHeader current="home" />

      <a id="top" />

      {/* HERO */}
      <section style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,7vw,104px) clamp(20px,5vw,64px) clamp(40px,5vw,72px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(40px,5vw,72px)', alignItems: 'center' }}>
          <div style={{ flex: '1 1 440px', minWidth: 300, animation: 'heroUp .9s ease both' }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: '#8a7630', marginBottom: 22 }}>
              Bộ sưu tập tiêu bản nghệ thuật
            </div>
            <h1 className="font-display" style={{ fontWeight: 600, fontSize: 'clamp(40px,5.8vw,72px)', lineHeight: 1.02, letterSpacing: '-.015em', color: '#2c2a16', margin: '0 0 26px' }}>
              Vẻ đẹp của loài bướm,<br />
              <span style={{ fontStyle: 'italic', fontWeight: 500 }}>được lưu giữ vĩnh cửu.</span>
            </h1>
            <p style={{ fontSize: 15.5, lineHeight: 1.75, maxWidth: 480, margin: '0 0 16px', color: '#544f30' }}>
              Thành lập từ năm 2019, All About Butterfly là nơi những cánh bướm đẹp nhất từ thiên nhiên được vĩnh viễn lưu giữ như một tác phẩm nghệ thuật đầy tinh tế.
            </p>
            <p style={{ fontSize: 15.5, lineHeight: 1.75, maxWidth: 480, margin: '0 0 34px', color: '#544f30' }}>
              Mỗi tiêu bản không chỉ là một món quà, mà là cách nắm bắt vẻ đẹp của loài bướm ở đỉnh cao của sự biến chuyển.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
              <a href="#bo-suu-tap" className="btn-fill" style={{ background: INK, color: INK_FG, padding: '15px 30px', borderRadius: 2, fontSize: 12, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' }}>
                Khám phá bộ sưu tập
              </a>
              <a href="#ve-chung-toi" className="btn-text" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontSize: 13, letterSpacing: '.04em', color: '#2c2a16', paddingBottom: 4 }}>
                Câu chuyện thương hiệu →
              </a>
            </div>
          </div>
          <div style={{ flex: '1 1 380px', minWidth: 280, position: 'relative', animation: 'heroUp 1.1s ease both' }}>
            <figure style={{ margin: 0, border: `1px solid ${INK}`, background: '#f7f1de', padding: 12, boxShadow: '0 24px 50px -28px rgba(40,36,16,.55)', maxWidth: 380, marginLeft: 'auto' }}>
              <div style={{ background: '#ece3c8', overflow: 'hidden' }}>
                <Pic src="/images/cut-morpho.png" alt="Morpho amathonte" style={{ width: '100%', aspectRatio: '1/.92', objectFit: 'cover', mixBlendMode: 'multiply' }} />
              </div>
              <figcaption className="font-display" style={{ fontStyle: 'italic', fontSize: 15, color: '#3a3620', padding: '11px 4px 2px' }}>
                Morpho amathonte <span style={{ color: '#9a8a52' }}>— Nam Mỹ</span>
              </figcaption>
            </figure>
            <figure className="hero-figure-float" style={{ margin: 0, position: 'absolute', bottom: -46, left: -6, width: '48%', minWidth: 170, border: `1px solid ${INK}`, background: '#f7f1de', padding: 9, boxShadow: '0 22px 44px -22px rgba(40,36,16,.6)' }}>
              <div style={{ background: '#ece3c8', overflow: 'hidden' }}>
                <Pic src="/images/cut-paris.png" alt="Papilio paris" style={{ width: '100%', aspectRatio: '1/.82', objectFit: 'contain' }} />
              </div>
              <figcaption className="font-display" style={{ fontStyle: 'italic', fontSize: 13, color: '#3a3620', padding: '8px 3px 1px' }}>
                Papilio paris
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* STATS */}
      <Reveal style={{ maxWidth: 1180, margin: 'clamp(36px,5vw,68px) auto 0', padding: '0 clamp(20px,5vw,64px)' }}>
        <div style={{ border: `1px solid ${INK}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))' }}>
          {[
            ['56 triệu', 'Số năm loài bướm đã hiện diện và tiến hoá trên Trái Đất.'],
            ['20.000+', 'Số loài bướm được khoa học ghi nhận khắp thế giới.'],
            ['100%', 'Tiêu bản thật, bảo quản và đóng khung thủ công.'],
            ['2019', 'Năm All About Butterfly bắt đầu hành trình.'],
          ].map(([num, desc], i) => (
            <div key={num} className="stat-item" style={{ padding: 'clamp(30px,3vw,46px) 26px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(54,50,24,.16)' : undefined }}>
              <div className="font-display" style={{ fontWeight: 500, fontSize: 'clamp(40px,4.6vw,60px)', color: INK, lineHeight: 1 }}>{num}</div>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: '#5b5736', maxWidth: 220, margin: '14px auto 0' }}>{desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* GALLERY */}
      <Reveal style={{ maxWidth: 1180, margin: 'clamp(56px,7vw,110px) auto 0', padding: '0 clamp(20px,5vw,64px)' }}>
        <div id="bo-suu-tap" style={{ position: 'relative', top: -90 }} />
        <div style={{ maxWidth: 660, marginBottom: 34 }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: '#8a7630', marginBottom: 16 }}>Bộ sưu tập</div>
          <h2 className="font-display" style={{ fontWeight: 600, fontSize: 'clamp(32px,4.6vw,56px)', color: '#2c2a16', margin: '0 0 16px', letterSpacing: '-.01em', lineHeight: 1.04 }}>
            Mười tám loài bướm.<br /><span style={{ fontStyle: 'italic', fontWeight: 500 }}>Vô vàn câu chuyện.</span>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0, color: '#544f30' }}>
            Lọc theo loại, theo màu sắc hay tìm kiếm trực tiếp — rồi chạm vào mỗi tiêu bản để tìm hiểu về nguồn gốc, đặc điểm và ý nghĩa của nó.
          </p>
        </div>

        {/* FILTER BAR */}
        <div style={{ border: '1px solid #ddd0ab', borderRadius: 7, background: '#f7f1de', display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', boxShadow: '0 8px 22px -18px rgba(40,36,16,.5)' }}>
          <div className="filter-section" style={{ padding: '18px 22px', borderRight: '1px solid #e7dcbe', flex: '0 0 auto' }}>
            <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, color: '#8a7630', marginBottom: 12 }}>Sắp xếp theo</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={setPopular} className="sort-btn" style={{ appearance: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, letterSpacing: '.04em', padding: '8px 16px', borderRadius: 20, whiteSpace: 'nowrap', background: isPop ? INK : 'transparent', color: isPop ? INK_FG : IDLE_FG, border: `1px solid ${isPop ? INK : BORDER}` }}>
                Phổ biến nhất
              </button>
              <button onClick={setRandom} className="sort-btn" style={{ appearance: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, letterSpacing: '.04em', padding: '8px 16px', borderRadius: 20, whiteSpace: 'nowrap', background: isRand ? INK : 'transparent', color: isRand ? INK_FG : IDLE_FG, border: `1px solid ${isRand ? INK : BORDER}` }}>
                Ngẫu nhiên
              </button>
            </div>
          </div>
          <div className="filter-section" style={{ padding: '18px 22px', borderRight: '1px solid #e7dcbe', flex: '1 1 440px', minWidth: 280 }}>
            <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, color: '#8a7630', marginBottom: 12 }}>Lọc theo loại</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TYPE_DEFS.map(([key, label]) => {
                const active = types.includes(key);
                return (
                  <button key={key} onClick={() => toggleType(key)} className="filter-pill" style={{ appearance: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 500, letterSpacing: '.03em', padding: '8px 15px', borderRadius: 20, whiteSpace: 'nowrap', background: active ? INK : 'transparent', color: active ? INK_FG : IDLE_FG, border: `1px solid ${active ? INK : BORDER}` }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="filter-section" style={{ padding: '18px 22px', borderRight: '1px solid #e7dcbe', flex: '0 0 auto' }}>
            <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, color: '#8a7630', marginBottom: 12 }}>Lọc theo màu</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,30px)', gap: 9 }}>
              {COLOUR_DEFS.map(([key, hex]) => {
                const active = colour === key;
                return (
                  <button key={key} onClick={() => pickColour(key)} className="colour-dot" aria-label={key} style={{ width: 30, height: 30, borderRadius: '50%', background: hex, boxShadow: active ? '0 0 0 2px #f7f1de, 0 0 0 4px #8a7630' : 'inset 0 0 0 1px rgba(0,0,0,.14)' }} />
                );
              })}
            </div>
          </div>
          <div className="filter-section" style={{ padding: '18px 22px', borderRight: '1px solid #e7dcbe', flex: '1 1 230px', minWidth: 210 }}>
            <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, color: '#8a7630', marginBottom: 12 }}>Tìm một loài bướm</div>
            <form onSubmit={(e: FormEvent) => e.preventDefault()} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="vd: bướm xanh Morpho" style={{ width: '100%', border: `1px solid ${BORDER}`, background: '#fdfaef', borderRadius: 22, padding: '10px 42px 10px 16px', fontSize: 13, color: '#3a3620', outline: 'none' }} />
              <button type="submit" aria-label="Tìm" style={{ position: 'absolute', right: 5, width: 32, height: 32, borderRadius: '50%', border: 'none', background: INK, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={INK_FG} strokeWidth={2}><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
              </button>
            </form>
          </div>
          <div className="filter-section" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 9, flex: '0 0 auto' }}>
            <button onClick={resetAll} aria-label="Đặt lại" className="reset-btn" style={{ width: 42, height: 42, borderRadius: '50%', border: `1px solid ${BORDER}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b5224" strokeWidth={1.8}><path d="M3.5 12a8.5 8.5 0 1 1 2.4 5.9" /><polyline points="3 21 3 16 8 16" /></svg>
            </button>
            <span style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, color: '#8a7630' }}>Đặt lại</span>
          </div>
        </div>

        {/* VIEW + SORT ROW */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 14, margin: '22px 0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setView('grid')} style={{ appearance: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', padding: '8px 16px', borderRadius: 4, border: `1px solid ${BORDER}`, background: view === 'grid' ? INK : 'transparent', color: view === 'grid' ? INK_FG : IDLE_FG }}>▦ Lưới</button>
            <button onClick={() => setView('list')} style={{ appearance: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', padding: '8px 16px', borderRadius: 4, border: `1px solid ${BORDER}`, background: view === 'list' ? INK : 'transparent', color: view === 'list' ? INK_FG : IDLE_FG }}>☰ Danh sách</button>
            <span style={{ fontSize: 12.5, color: '#9a8d5c', marginLeft: 6 }}>{species.length} tiêu bản</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a8d5c' }}>Sải cánh</span>
            <button onClick={() => setSizeSort((p) => (p === 'desc' ? null : 'desc'))} style={{ appearance: 'none', cursor: 'pointer', fontSize: 12, color: '#4a4628', padding: '7px 14px', borderRadius: 4, border: '1px solid #d8ccaa', background: sizeSort === 'desc' ? '#ece0b4' : 'transparent' }}>↓ Lớn nhất</button>
            <button onClick={() => setSizeSort((p) => (p === 'asc' ? null : 'asc'))} style={{ appearance: 'none', cursor: 'pointer', fontSize: 12, color: '#4a4628', padding: '7px 14px', borderRadius: 4, border: '1px solid #d8ccaa', background: sizeSort === 'asc' ? '#ece0b4' : 'transparent' }}>↑ Nhỏ nhất</button>
          </div>
        </div>

        {/* EMPTY STATE */}
        {isEmpty && (
          <div style={{ padding: '70px 20px', textAlign: 'center', color: '#9a8d5c' }}>
            <div className="font-display" style={{ fontStyle: 'italic', fontSize: 24, color: '#7d6f3f', marginBottom: 8 }}>Chưa có tiêu bản phù hợp</div>
            <div style={{ fontSize: 14 }}>Hãy thử bỏ bớt bộ lọc hoặc đặt lại tìm kiếm.</div>
          </div>
        )}

        {/* GRID VIEW */}
        {!isEmpty && view === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(232px,1fr))', gap: 'clamp(20px,2.5vw,38px)' }}>
            {species.map((s) => (
              <button key={s.id} onClick={() => setSelected(s)} className="grid-card" style={{ appearance: 'none', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pic
                    src={s.img}
                    alt={s.vn}
                    className="wing-anim"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', transformOrigin: 'center 62%', filter: 'drop-shadow(0 18px 26px rgba(40,36,16,.26))', animation: 'wingIdle 3.8s ease-in-out infinite', animationDelay: s.flapDelay }}
                  />
                  {s.premium && (
                    <span style={{ position: 'absolute', left: '6%', bottom: '7%', background: '#e9dcae', color: '#5a4a1c', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12.5, padding: '2px 13px', borderRadius: 3, boxShadow: '0 2px 6px rgba(40,36,16,.18)' }}>
                      Cao cấp
                    </span>
                  )}
                </div>
                <div className="font-display" style={{ fontWeight: 600, fontSize: 19, color: '#2c2a16', marginTop: 10, lineHeight: 1.15 }}>{s.vn}</div>
                <div className="font-display" style={{ fontStyle: 'italic', fontSize: 14, color: '#9a8a52', marginTop: 1 }}>{s.sci}</div>
                <div style={{ fontSize: 11.5, color: '#9a9163', marginTop: 7, lineHeight: 1.5, maxWidth: 210 }}>{s.tag}</div>
              </button>
            ))}
          </div>
        )}

        {/* LIST VIEW */}
        {!isEmpty && view === 'list' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#e0d5b3', border: '1px solid #e0d5b3', borderRadius: 6, overflow: 'hidden' }}>
            {species.map((s) => (
              <button key={s.id} onClick={() => setSelected(s)} className="list-row" style={{ appearance: 'none', border: 'none', cursor: 'pointer', background: '#f7f1de', display: 'flex', alignItems: 'center', gap: 22, padding: '16px 22px', textAlign: 'left' }}>
                <div style={{ flex: '0 0 auto', width: 76, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pic src={s.img} alt={s.vn} className="wing-anim" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transformOrigin: 'center 62%', animation: 'wingIdle 4s ease-in-out infinite', animationDelay: s.flapDelay }} />
                </div>
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <div className="font-display" style={{ fontWeight: 600, fontSize: 20, color: '#2c2a16', lineHeight: 1.1 }}>{s.vn}</div>
                  <div className="font-display" style={{ fontStyle: 'italic', fontSize: 14, color: '#9a8a52' }}>{s.sci}</div>
                  <div style={{ fontSize: 12, color: '#8a8156', marginTop: 4 }}>{s.tag}</div>
                </div>
                <div style={{ flex: '0 0 auto', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  {s.premium && (
                    <span style={{ background: '#e9dcae', color: '#5a4a1c', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12.5, padding: '2px 13px', borderRadius: 3 }}>Cao cấp</span>
                  )}
                  <span style={{ fontSize: 11.5, color: '#9a8d5c', letterSpacing: '.08em', textTransform: 'uppercase' }}>{s.sizeLabel}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Reveal>

      {/* TRAITS */}
      <Reveal style={{ maxWidth: 1180, margin: 'clamp(64px,8vw,120px) auto 0', padding: '0 clamp(20px,5vw,64px)' }}>
        <div id="dac-diem" style={{ position: 'relative', top: -90 }} />
        <h2 className="font-display" style={{ fontWeight: 600, fontSize: 'clamp(30px,4vw,46px)', color: '#2c2a16', margin: '0 0 18px', letterSpacing: '-.01em' }}>Mỗi loài một cá tính</h2>
        <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 620, margin: '0 0 44px', color: '#544f30' }}>
          Hình dáng và sắc màu là điều đầu tiên ta để ý, nhưng mỗi loài bướm còn mang trong mình một tính cách riêng — từ cách nguỵ trang, sắc óng ánh cho tới những câu chuyện đã đi vào văn hoá. Đây là vài nét cá tính giúp bạn khám phá bộ sưu tập.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(248px,1fr))', gap: 1, background: '#e0d5b3', border: '1px solid #e0d5b3' }}>
          {TRAITS.map((t) => (
            <div key={t.n} style={{ background: '#f7f1de', padding: '30px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
                <span className="font-display" style={{ fontSize: 22, color: '#a08a3e' }}>{t.n}</span>
                <span style={{ fontWeight: 600, fontSize: 14, letterSpacing: '.08em', textTransform: 'uppercase', color: '#2c2a16' }}>{t.title}</span>
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.65, margin: 0, color: '#544f30' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ABOUT */}
      <Reveal style={{ marginTop: 'clamp(72px,9vw,140px)' }}>
        <section id="ve-chung-toi" style={{ background: INK, color: '#e7dcb5' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(60px,8vw,110px) clamp(20px,5vw,64px)', display: 'flex', flexWrap: 'wrap', gap: 'clamp(40px,6vw,90px)', alignItems: 'center' }}>
            <div style={{ flex: '0 1 300px', minWidth: 220, display: 'flex', justifyContent: 'center' }}>
              <Pic src="/images/mark-gold.png" alt="All About Butterfly" style={{ width: 'min(300px,72vw)', height: 'auto', animation: 'drift 7s ease-in-out infinite' }} />
            </div>
            <div style={{ flex: '1 1 440px', minWidth: 300 }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: '#cdbb73', marginBottom: 22 }}>Về All About Butterfly</div>
              <h2 className="font-display" style={{ fontWeight: 500, fontSize: 'clamp(30px,4.2vw,50px)', color: '#f4ecc9', margin: '0 0 26px', lineHeight: 1.1 }}>Lớn lên, Tiến hoá, Chuyển hoá.</h2>
              <p style={{ fontSize: 15, lineHeight: 1.78, maxWidth: 520, margin: '0 0 16px', color: '#d8cda0' }}>
                Tiêu bản bướm chính là biểu tượng cho sự tái sinh không ngừng của tự nhiên và cho sự vĩnh cửu — cùng với đó là khả năng trân trọng, lưu giữ vẻ đẹp ngay trong tâm hồn mỗi người.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.78, maxWidth: 520, margin: '0 0 32px', color: '#d8cda0' }}>
                Biểu tượng của chúng tôi — con rắn ngậm đuôi ôm lấy đôi cánh bướm — là hình ảnh của vòng tuần hoàn bất tận và sự lột xác. Đó cũng chính là điều loài bướm dạy ta: cái đẹp luôn nảy sinh từ chuyển hoá.
              </p>
              <a href="#lien-he" className="about-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, border: '1px solid #6f6936', color: '#f4ecc9', padding: '14px 28px', borderRadius: 2, fontSize: 12, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' }}>
                Liên hệ với chúng tôi
              </a>
            </div>
          </div>
        </section>
      </Reveal>

      {/* CLOSING / CONTACT */}
      <section id="lien-he" style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(56px,7vw,110px) clamp(20px,5vw,64px)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 'clamp(12px,3vw,50px)' }}>
          <Pic src="/images/flank-ulysses.png" alt="Papilio ulysses" className="flank-img" style={{ flex: '0 0 auto', width: 'clamp(120px,17vw,280px)', height: 'auto', filter: 'drop-shadow(0 22px 30px rgba(40,36,16,.22))', animation: 'drift 8s ease-in-out infinite' }} />
          <div style={{ textAlign: 'center', maxWidth: 440 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.26em', textTransform: 'uppercase', color: '#8a7630', marginBottom: 20 }}>All About Butterfly</div>
            <h2 className="font-display" style={{ fontWeight: 500, fontSize: 'clamp(28px,4vw,46px)', color: '#2c2a16', margin: '0 0 28px', lineHeight: 1.12 }}>Mỗi đôi cánh là một vòng đời được giữ lại.</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
              <a href="#bo-suu-tap" className="contact-primary" style={{ background: INK, color: INK_FG, padding: '15px 30px', borderRadius: 2, fontSize: 12, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' }}>Xem bộ sưu tập</a>
              <a href="https://shopee.vn/allaboutbutterfly" target="_blank" rel="noopener" className="contact-secondary" style={{ border: `1px solid ${BORDER}`, color: '#2c2a16', padding: '15px 30px', borderRadius: 2, fontSize: 12, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' }}>Đặt mua trên Shopee</a>
            </div>
          </div>
          <Pic src="/images/flank-archaeo.png" alt="Archaeoprepona meander" className="flank-img" style={{ flex: '0 0 auto', width: 'clamp(120px,17vw,280px)', height: 'auto', filter: 'drop-shadow(0 22px 30px rgba(40,36,16,.22))', animation: 'drift 9s ease-in-out infinite' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 760, margin: '18px auto 0', fontSize: 10.5, letterSpacing: '.18em', textTransform: 'uppercase', color: '#a99a68' }}>
          <span>Papilio ulysses</span><span>Archaeoprepona meander</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: INK, color: '#cdbb73' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,6vw,84px) clamp(20px,5vw,64px) 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, border: '1px solid #55512b', borderRadius: 2, padding: '22px 26px', maxWidth: 620, margin: '0 auto clamp(48px,6vw,72px)' }}>
            <Pic src="/images/cut-paris.png" alt="" style={{ width: 74, height: 74, objectFit: 'contain', flex: '0 0 auto', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.3))' }} />
            <p style={{ fontSize: 13, lineHeight: 1.65, margin: 0, color: '#d8cda0' }}>
              Mỗi tiêu bản được tuyển chọn, xử lý và đóng khung thủ công, gìn giữ trọn vẹn vẻ đẹp và thần thái nguyên bản của loài bướm.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 36, justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 40, borderBottom: '1px solid #4d4926' }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <Pic src="/images/mark-gold.png" alt="" style={{ width: 38, height: 38, objectFit: 'contain' }} />
                <span className="font-display" style={{ fontWeight: 600, fontSize: 20, color: '#f4ecc9' }}>All About <span style={{ fontStyle: 'italic' }}>Butterfly</span></span>
              </div>
              <p className="font-display" style={{ fontStyle: 'italic', fontSize: 16, lineHeight: 1.5, margin: 0, color: '#b6a972' }}>Grow, Evolve, Transform.</p>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <a href="https://shopee.vn/allaboutbutterfly" target="_blank" rel="noopener" aria-label="Shopee" className="social-link" style={{ width: 42, height: 42, border: '1px solid #55512b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#cdbb73" strokeWidth={1.6}><path d="M5 8h14l-1 11.5a1.5 1.5 0 0 1-1.5 1.4h-9A1.5 1.5 0 0 1 6 19.5z" /><path d="M8.5 8a3.5 3.5 0 0 1 7 0" /><path d="M10 13.6c0 1 .9 1.5 2 1.5s2-.5 2-1.4c0-1.8-3.6-1-3.6-2.8 0-.8.8-1.3 1.7-1.3.8 0 1.4.3 1.7.7" strokeWidth={1.3} /></svg>
              </a>
              <a href="https://www.instagram.com/allaboutbutterfly_shop" target="_blank" rel="noopener" aria-label="Instagram" className="social-link" style={{ width: 42, height: 42, border: '1px solid #55512b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cdbb73" strokeWidth={1.6}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#cdbb73" stroke="none" /></svg>
              </a>
              <a href="https://www.threads.com/@allaboutbutterfly_shop" target="_blank" rel="noopener" aria-label="Threads" className="social-link" style={{ width: 42, height: 42, border: '1px solid #55512b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cdbb73" strokeWidth={1.7}><path d="M12.2 21c-4.6 0-7.2-3.2-7.2-9s2.7-9 7.1-9c3 0 5.1 1.4 6.1 4M12 21c3.5 0 5.6-1.9 5.6-4.4 0-2.6-2.3-3.8-4.7-3.8-2 0-3.4 1-3.4 2.5 0 1.3 1.1 2.1 2.5 2.1 2 0 3.3-1.8 3.3-4.4 0-1.8-1.1-3-2.9-3" /></svg>
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'space-between', paddingTop: 24, fontSize: 12, color: '#9a8d5c' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22 }}>
              <a href="#" className="footer-link">Chính sách bảo mật</a>
              <a href="#" className="footer-link">Điều khoản</a>
              <a href="#" className="footer-link">Vận chuyển &amp; bảo hành</a>
            </div>
            <span>© 2019–2025 All About Butterfly · ETSD 2019</span>
          </div>
        </div>
      </footer>

      {/* MODAL */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(34,32,16,.62)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(14px,4vw,56px)', animation: 'fadeIn .3s ease' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'relative', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', background: '#f7f1de', borderRadius: 3, maxWidth: 1000, width: '100%', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 40px 90px -30px rgba(20,18,6,.7)', animation: 'popIn .35s ease' }}>
            <button onClick={() => setSelected(null)} aria-label="Đóng" className="modal-close" style={{ position: 'absolute', top: 16, right: 16, zIndex: 3, width: 40, height: 40, borderRadius: '50%', border: '1px solid #cabd97', background: 'rgba(247,241,222,.85)', color: '#3a3620', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            <div style={{ flex: '1 1 360px', minWidth: 280, background: '#ece3c8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px,3vw,40px)' }}>
              <Pic src={selected.img} alt={selected.vn} style={{ width: '100%', maxHeight: '78vh', objectFit: 'contain', filter: 'drop-shadow(0 16px 26px rgba(40,36,16,.3))' }} />
            </div>
            <div style={{ flex: '1 1 360px', minWidth: 290, padding: 'clamp(30px,3.4vw,56px)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.24em', textTransform: 'uppercase', color: '#8a7630' }}>Tiêu bản · {selected.en}</span>
                {selected.premium && (
                  <span style={{ background: '#e9dcae', color: '#5a4a1c', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 12.5, padding: '1px 12px', borderRadius: 3 }}>Cao cấp</span>
                )}
              </div>
              <h3 className="font-display" style={{ fontWeight: 600, fontSize: 'clamp(30px,4vw,44px)', color: '#2c2a16', margin: 0, lineHeight: 1.05, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '.8em', lineHeight: 1 }}>{selectedEmoji}</span><span>{selected.vn}</span>
              </h3>
              <div className="font-display" style={{ fontStyle: 'italic', fontSize: 19, color: '#9a8a52', margin: '6px 0 26px' }}>{selected.sci}</div>
              {selected.desc.map((p, i) => (
                <p key={i} style={{ fontSize: 14.5, lineHeight: 1.75, color: '#544f30', margin: '0 0 15px' }}>{p}</p>
              ))}
              <div style={{ margin: '24px 0 26px' }}>
                <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 600, color: '#a08a3e', marginBottom: 12 }}>Cá tính</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                  {selectedVibes.map((v) => (
                    <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fdfaef', border: '1px solid #d8ccaa', borderRadius: 7, padding: '8px 14px 8px 12px', fontSize: 11.5, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: '#3a3620' }}>
                      <span style={{ fontSize: 16, lineHeight: 1 }}>{vibeFor(v)}</span>{v}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#e0d5b3', border: '1px solid #e0d5b3', margin: '0 0 28px' }}>
                <div style={{ background: '#f7f1de', padding: '16px 18px' }}>
                  <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#a08a3e', marginBottom: 6 }}>Phân bố</div>
                  <div style={{ fontSize: 13.5, color: '#33311a' }}>{selected.region}</div>
                </div>
                <div style={{ background: '#f7f1de', padding: '16px 18px' }}>
                  <div style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#a08a3e', marginBottom: 6 }}>Sải cánh</div>
                  <div style={{ fontSize: 13.5, color: '#33311a' }}>{selected.wingspan}</div>
                </div>
              </div>
              <a href="https://shopee.vn/allaboutbutterfly" target="_blank" rel="noopener" className="contact-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: INK, color: INK_FG, padding: '14px 28px', borderRadius: 2, fontSize: 12, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                Đặt mua trên Shopee →
              </a>
              <p style={{ fontSize: 11, color: '#a99a68', margin: '16px 0 0', letterSpacing: '.04em' }}>Tiêu bản thật · Đóng khung thủ công · Bảo hành trọn đời</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
