import { SPECIES } from './species';

export type Paper = { key: string; label: string; src: string; gradient: string };

// Real paper-texture photos aren't sourced yet — drop them at /images/paper/<key>.jpg
// and they'll swap in automatically (same graceful-fallback pattern as Pic).
export const PAPERS: Paper[] = [
  { key: 'secretgarden', label: 'Vườn hồng', src: '/images/paper/secretgarden.jpg', gradient: 'linear-gradient(135deg,#f3d9d9,#e3b8b0)' },
  { key: 'hoa', label: 'Khung hoa', src: '/images/paper/hoa.jpg', gradient: 'linear-gradient(135deg,#f1e3c0,#e0c79a)' },
  { key: 'nhac', label: 'Khung nhạc', src: '/images/paper/nhac.jpg', gradient: 'linear-gradient(135deg,#efe6d0,#dcd0ad)' },
  { key: 'chu', label: 'Khung chữ', src: '/images/paper/chu.jpg', gradient: 'linear-gradient(135deg,#e8dcc0,#d3c39a)' },
  { key: 'xanh', label: 'Hoa nổi xanh', src: '/images/paper/xanh.jpg', gradient: 'linear-gradient(135deg,#dbe6d9,#b9cdb7)' },
  { key: 'tron', label: 'Trơn vintage', src: '/images/paper/tron.jpg', gradient: 'linear-gradient(135deg,#ece3cd,#d9cdab)' },
];

export type Butterfly = { key: string; vn: string; src: string; wsp: number };

// True wingspan in cm — drives real-scale sizing on the frame canvas.
const WSP: Record<string, number> = {
  morpho: 13, ulysses: 12, paris: 9.5, maackii: 12, chrysiridia: 8.5, luna: 10.5,
  urania: 8, archaeo: 10, mimathyma: 9, hebomoia: 9.5, sarpedon: 8, doson: 7.5,
  antiphates: 9, genutia: 8.5, chrysippus: 7.5, parantica: 7.5, hollyblue: 3.3,
};

export const BFLY: Butterfly[] = Object.entries(WSP).map(([key, wsp]) => {
  const s = SPECIES.find((sp) => sp.id === key)!;
  return { key, vn: s.vn, src: s.img, wsp };
});

export const FRAME_GALLERY: { src: string; alt: string }[] = [
  { src: '/images/frame-madagascar.jpg', alt: 'Khung bướm hoàng hôn Madagascar' },
  { src: '/images/frame-maack.jpg', alt: 'Khung phượng xanh Maack' },
  { src: '/images/frame-maack-ngoc.jpg', alt: 'Khung phượng xanh ánh ngọc' },
  { src: '/images/frame-duoien-cam.jpg', alt: 'Khung bướm đuôi én cam' },
  { src: '/images/frame-ho.jpg', alt: 'Khung bướm hổ' },
  { src: '/images/frame-canhkiem-nhac.jpg', alt: 'Khung phượng cánh kiếm trên nền nhạc' },
  { src: '/images/frame-hoaxanh.jpg', alt: 'Khung bướm hoa xanh' },
  { src: '/images/frame-nenchu.jpg', alt: 'Khung bướm trên nền chữ' },
  { src: '/images/frame-xanh-nenvan.jpg', alt: 'Khung phượng xanh trên nền văn' },
  { src: '/images/frame-xanh-hoatiet.jpg', alt: 'Khung phượng xanh trên nền hoạ tiết' },
  { src: '/images/frame-maack-anhluc.jpg', alt: 'Khung phượng xanh Maack ánh lục' },
];
