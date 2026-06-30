import type { Metadata } from 'next';
import XuongGhepKhungPage from '@/components/XuongGhepKhungPage';

export const metadata: Metadata = {
  title: 'Xưởng ghép khung — All About Butterfly',
  description: 'Tự tay ghép khung bướm của riêng bạn — chọn kích thước, hướng khung, nền giấy và sắp đặt tiêu bản, rồi tải bản xem trước.',
};

export default function Page() {
  return <XuongGhepKhungPage />;
}
