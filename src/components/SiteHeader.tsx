'use client';

import { useState } from 'react';
import { Pic } from './Pic';
import { INK, INK_FG, BORDER } from '@/lib/theme';

type SiteHeaderProps = {
  current: 'home' | 'xuong-ghep-khung';
};

export function SiteHeader({ current }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const home = current === 'home' ? '' : '/';

  const links = [
    { href: `${home}#bo-suu-tap`, label: 'Bộ sưu tập' },
    { href: `${home}#dac-diem`, label: 'Đặc điểm' },
    { href: '/xuong-ghep-khung', label: 'Xưởng ghép khung', active: current === 'xuong-ghep-khung' },
    { href: `${home}#ve-chung-toi`, label: 'Về chúng tôi' },
  ];

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 90, background: 'rgba(241,233,210,.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #ddd2af' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '14px clamp(20px,5vw,64px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <a href={`${home}#top`} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Pic src="/images/mark-ink.png" alt="All About Butterfly" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span className="font-display" style={{ fontWeight: 600, fontSize: 21, color: '#2c2a16', letterSpacing: '.01em' }}>
              All About <span style={{ fontStyle: 'italic' }}>Butterfly</span>
            </span>
            <span style={{ fontSize: 9.5, letterSpacing: '.34em', textTransform: 'uppercase', color: '#9a8a52', marginTop: 3 }}>ETSD · 2019</span>
          </span>
        </a>
        <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30, fontSize: 13, letterSpacing: '.05em', color: '#4a4628' }}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={l.active ? undefined : 'nav-link'}
              style={{ padding: '6px 0', borderBottom: l.active ? '1px solid #5a4a1c' : '1px solid transparent', color: l.active ? '#2c2a16' : undefined, fontWeight: l.active ? 500 : undefined }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a href={`${home}#lien-he`} className="btn-fill header-cta" style={{ background: INK, color: INK_FG, padding: '12px 22px', borderRadius: 2, fontSize: 11.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' }}>
          Liên hệ đặt mua
        </a>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={menuOpen}
          className="menu-toggle"
          style={{ appearance: 'none', cursor: 'pointer', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 4, width: 42, height: 42, flex: '0 0 auto' }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={1.8} style={{ display: 'block', margin: '0 auto' }}>
            {menuOpen ? (
              <path d="M5 5l14 14M19 5L5 19" />
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <nav className="mobile-menu">
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} style={l.active ? { color: '#2c2a16', fontWeight: 600 } : undefined}>
              {l.label}
            </a>
          ))}
          <a
            href={`${home}#lien-he`}
            onClick={() => setMenuOpen(false)}
            className="btn-fill"
            style={{ background: INK, color: INK_FG, textAlign: 'center', padding: '12px 22px', borderRadius: 2, fontSize: 11.5, fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase', marginTop: 8 }}
          >
            Liên hệ đặt mua
          </a>
        </nav>
      )}
    </header>
  );
}
