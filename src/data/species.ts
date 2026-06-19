export type Species = {
  id: string;
  img: string;
  vn: string;
  sci: string;
  en: string;
  premium: boolean;
  tag: string;
  types: string[];
  colour: string;
  pop: number;
  wmax: number;
  region: string;
  wingspan: string;
  meaning: string;
  desc: string[];
};

export const SPECIES: Species[] = [
  { id: 'morpho', img: '/images/card-morpho.png', vn: 'Bướm Xanh Morpho', sci: 'Morpho amathonte', en: 'Blue Morpho', premium: true, tag: 'Ánh kim hologram · niềm vui & hy vọng', types: ['premium', 'iridescent', 'large'], colour: 'blue', pop: 1, wmax: 150,
    region: 'Trung & Nam Mỹ', wingspan: '120 – 150 mm', meaning: 'Niềm vui · Hy vọng · Chuyển hoá',
    desc: ['Một trong những loài Morpho có sắc xanh rực rỡ nhất. Màu xanh kim loại ấy không đến từ sắc tố mà sinh ra từ cấu trúc siêu nhỏ trên vảy cánh bẻ cong ánh sáng.', 'Sống trong các khu rừng nhiệt đới Trung và Nam Mỹ, đôi cánh lớn của chúng lấp lánh như mặt nước khi tung bay dưới nắng.'] },
  { id: 'chrysiridia', img: '/images/card-chrysiridia.png', vn: 'Bướm Hoàng Hôn Madagascar', sci: 'Chrysiridia rhipheus', en: 'Madagascan Sunset Moth', premium: true, tag: 'Lộng lẫy như cầu vồng · được săn lùng', types: ['premium', 'rare', 'colorful', 'iridescent'], colour: 'green', pop: 2, wmax: 90,
    region: 'Đặc hữu Madagascar', wingspan: '70 – 90 mm', meaning: 'Rực rỡ · Độc bản',
    desc: ['Tuy thường bị nhầm là bướm, đây thực chất là một loài ngài hoạt động ban ngày và là loài đặc hữu của Madagascar.', 'Toàn bộ sắc cầu vồng trên cánh đều là màu cấu trúc — không hề có sắc tố — khiến nó được xem là một trong những loài cánh vảy đẹp nhất hành tinh.'] },
  { id: 'ulysses', img: '/images/flank-ulysses.png', vn: 'Phượng Xanh Ulysses', sci: 'Papilio ulysses', en: 'Blue Emperor', premium: true, tag: 'Xanh điện rực rỡ · biểu tượng khát vọng', types: ['premium', 'phuong', 'iridescent', 'large'], colour: 'blue', pop: 3, wmax: 140,
    region: 'Úc · Đông Nam Á', wingspan: '105 – 140 mm', meaning: 'Rực rỡ · Khát vọng',
    desc: ['Đôi cánh xanh điện rực rỡ của phượng Ulysses bừng sáng mỗi khi bắt nắng — một trong những sắc xanh quyến rũ nhất giới côn trùng.', 'Là biểu tượng của bang Queensland (Úc), loài bướm lớn này từng khiến bao nhà sưu tầm phải say mê tìm kiếm.'] },
  { id: 'maackii', img: '/images/card-maackii.png', vn: 'Phượng Xanh Maack', sci: 'Papilio maackii', en: 'Alpine Black Swallowtail', premium: true, tag: 'Phượng lớn · ánh xanh lục lam', types: ['premium', 'phuong', 'iridescent', 'large'], colour: 'green', pop: 4, wmax: 135,
    region: 'Đông Á', wingspan: '90 – 135 mm', meaning: 'Cao quý · Lộng lẫy',
    desc: ['Đôi cánh đen được phủ lớp vảy ánh xanh lục – lam óng ánh, lộng lẫy nhất khi xoè rộng dưới ánh nắng.', 'Là loài phượng lớn và rực rỡ bậc nhất vùng ôn đới Đông Á, từ Viễn Đông nước Nga tới Nhật Bản và Triều Tiên.'] },
  { id: 'sasakia', img: '/images/card-sasakia.png', vn: 'Bướm Hoàng Đế Nhật Bản', sci: 'Sasakia charonda', en: 'Japanese Emperor', premium: false, tag: 'Bướm quốc dân Nhật Bản · quý hiếm', types: ['rare', 'large', 'colorful'], colour: 'purple', pop: 5, wmax: 110,
    region: 'Nhật Bản · Triều Tiên · Trung Quốc · Bắc Việt Nam', wingspan: '50 – 110 mm', meaning: 'Quyền quý · Kiêu hãnh',
    desc: ['Được tôn vinh là quốc điệp của Nhật Bản, Sasakia charonda khoác lên mình lớp vảy ánh tím xanh óng ánh chỉ hiện rõ ở những con đực khi bắt sáng.', 'Là loài bướm giáp lớn, chúng sống trong những khu rừng sồi và gắn liền với cây sếu — nơi ấu trùng sinh trưởng.'] },
  { id: 'paris', img: '/images/cut-paris2.png', vn: 'Bướm Phượng Paris', sci: 'Papilio paris', en: 'Paris Peacock', premium: false, tag: 'Biểu tượng phượng hoàng Á Đông', types: ['phuong', 'iridescent'], colour: 'green', pop: 6, wmax: 100,
    region: 'Nam Á · Đông Nam Á', wingspan: '80 – 100 mm', meaning: 'Cao quý · Phương Đông',
    desc: ['Cánh đen nhung điểm mảng vảy ánh lục – lam rực rỡ cùng đốm mắt đỏ đen nơi cánh sau, Papilio paris được ví như "phượng hoàng" của phương Đông.', 'Sắc óng ánh thay đổi theo góc nhìn khiến mỗi tiêu bản như mang một viên ngọc sống trên cánh.'] },
  { id: 'luna', img: '/images/cut-luna.png', vn: 'Bướm Trăng', sci: 'Actias luna', en: 'Luna Moth', premium: true, tag: 'Sắc xanh ánh trăng · đuôi dài thanh tao', types: ['premium', 'large'], colour: 'green', pop: 7, wmax: 115,
    region: 'Bắc Mỹ', wingspan: '80 – 115 mm', meaning: 'Thanh tao · Ánh trăng',
    desc: ['Một trong những loài ngài lớn và thanh tao nhất, khoác sắc xanh lục nhạt như ánh trăng cùng đôi đuôi dài duyên dáng.', 'Khi trưởng thành, bướm trăng không ăn và chỉ sống vỏn vẹn khoảng một tuần — một biểu tượng đẹp đẽ của sự phù du.'] },
  { id: 'mimathyma', img: '/images/cut-mimathyma.png', vn: 'Hoàng Đế Schrenck', sci: 'Mimathyma schrenckii', en: 'Schrenck’s Emperor', premium: true, tag: 'Nhung xanh mê hoặc · phối màu mosaic', types: ['premium', 'rare', 'iridescent'], colour: 'green', pop: 8, wmax: 95,
    region: 'Đông Á', wingspan: '80 – 95 mm', meaning: 'Mê hoặc · Vương giả',
    desc: ['Loài bướm giáp quý hiếm của vùng Đông Á, nổi bật với lớp vảy nhung xanh ánh tím và cách phối màu mosaic độc đáo trên cánh.', 'Mặt dưới cánh phủ sắc bạc lục dịu, khiến nó thay đổi diện mạo tuỳ góc nhìn — một "hoàng đế" thực thụ của núi rừng phương Bắc.'] },
  { id: 'archaeo', img: '/images/flank-archaeo.png', vn: 'Hoàng Đế "Đánh Giày"', sci: 'Archaeoprepona meander', en: 'Meander Prepona', premium: true, tag: 'Viền đá ngọc lam · bay cực nhanh', types: ['premium', 'iridescent'], colour: 'blue', pop: 9, wmax: 110,
    region: 'Trung & Nam Mỹ', wingspan: '90 – 110 mm', meaning: 'Mạnh mẽ · Bí ẩn',
    desc: ['"Hoàng đế đánh giày" gây ấn tượng bởi dải xanh ngọc lam óng ánh vắt ngang nền cánh nâu đen sẫm.', 'Là loài bay nhanh bậc nhất trong rừng nhiệt đới Trung và Nam Mỹ, chúng ưa nhựa cây và trái cây lên men hơn là mật hoa.'] },
  { id: 'hebomoia', img: '/images/card-hebomoia.png', vn: 'Bướm Đuôi Én Cam', sci: 'Hebomoia glaucippe', en: 'Great Orange Tip', premium: false, tag: 'Sát thủ đẹp mà độc · viền sắc nét', types: ['large', 'colorful'], colour: 'orange', pop: 10, wmax: 100,
    region: 'Nam Á · Đông Nam Á', wingspan: '80 – 100 mm', meaning: 'Nhiệt huyết · Khéo léo',
    desc: ['Là loài bướm phấn lớn nhất, nó gây ấn tượng bởi chóp cánh cam rực như ngọn lửa trên nền trắng tinh khôi.', 'Mặt dưới cánh lại nguỵ trang thành chiếc lá khô, giúp nó biến mất hoàn toàn khi khép cánh nghỉ ngơi.'] },
  { id: 'sarpedon', img: '/images/card-sarpedon.png', vn: 'Bướm Chai Xanh', sci: 'Graphium sarpedon', en: 'Common Bluebottle', premium: false, tag: 'Gradient xanh lá – xanh dương', types: ['phuong', 'tropical', 'iridescent'], colour: 'green', pop: 11, wmax: 90,
    region: 'Châu Á · Úc', wingspan: '70 – 90 mm', meaning: 'Minh mẫn · Tinh anh',
    desc: ['Một dải xanh lục trong veo vắt ngang đôi cánh đen tuyền — gọn gàng, hiện đại và đầy khí chất.', 'Nổi tiếng vì đôi mắt có tới mười lăm loại tế bào cảm quang, loài bướm này nhìn thế giới rực rỡ hơn cả con người.'] },
  { id: 'doson', img: '/images/card-doson.png', vn: 'Bướm Hoa Xanh', sci: 'Graphium doson', en: 'Common Jay', premium: false, tag: 'Mosaic xanh ngọc', types: ['phuong', 'tropical'], colour: 'blue', pop: 12, wmax: 85,
    region: 'Nam Á · Đông Nam Á', wingspan: '70 – 85 mm', meaning: 'Năng động · Tươi mới',
    desc: ['Nền cánh đen được tô điểm bởi một dải đốm xanh ngọc bích, tạo nên vẻ đẹp giản dị mà cuốn hút.', 'Là loài phượng năng động, chúng thường bay theo đàn và ghé xuống vũng nước để hấp thụ khoáng chất.'] },
  { id: 'urania', img: '/images/cut-urania.png', vn: 'Ngài Urania', sci: 'Urania leilus', en: 'Urania Moth', premium: true, tag: 'Cấu trúc màu phân tử · óng ánh lục lam', types: ['premium', 'iridescent', 'colorful'], colour: 'green', pop: 13, wmax: 90,
    region: 'Nam Mỹ', wingspan: '70 – 90 mm', meaning: 'Óng ánh · Tự do',
    desc: ['Tuy mang dáng dấp một loài bướm, Urania thực chất là ngài hoạt động ban ngày với những dải vảy lục lam óng ánh sinh ra từ cấu trúc quang học.', 'Chúng nổi tiếng với những đợt di cư hàng loạt ngoạn mục khắp các khu rừng Nam Mỹ.'] },
  { id: 'genutia', img: '/images/card-genutia.png', vn: 'Bướm Hổ Vằn', sci: 'Danaus genutia', en: 'Common Tiger', premium: false, tag: 'Hoa văn da hổ · cánh bền', types: ['tropical', 'colorful'], colour: 'orange', pop: 14, wmax: 95,
    region: 'Nam Á · Đông Nam Á', wingspan: '70 – 95 mm', meaning: 'Tự do · Bền bỉ',
    desc: ['Đôi cánh cam ấm được chia bởi những đường gân đen đậm tựa vằn hổ, khiến loài này dễ nhận ra giữa muôn loài.', 'Là họ hàng của bướm sữa, chúng bay khoan thai và mang độc nhẹ — lời cảnh báo tự nhiên dành cho kẻ săn mồi.'] },
  { id: 'chrysippus', img: '/images/card-chrysippus.png', vn: 'Nữ Hoàng Châu Phi', sci: 'Danaus chrysippus', en: 'Plain Tiger', premium: false, tag: 'Hoa văn cam tươi', types: ['tropical', 'colorful'], colour: 'orange', pop: 15, wmax: 80,
    region: 'Châu Phi · Châu Á · Úc', wingspan: '70 – 80 mm', meaning: 'Trường tồn · Bảo hộ',
    desc: ['Một trong những loài bướm xuất hiện sớm nhất trong nghệ thuật loài người, từng được khắc hoạ trên bích hoạ Ai Cập cổ hơn 3.000 năm trước.', 'Thuộc họ bướm sữa, nó tích luỹ độc tố từ cây ký chủ để tự vệ, trở thành hình mẫu cho nhiều loài bướm khác bắt chước.'] },
  { id: 'antiphates', img: '/images/card-antiphates.png', vn: 'Bướm Phượng Cánh Kiếm', sci: 'Graphium antiphates', en: 'Five-bar Swordtail', premium: false, tag: 'Đuôi dài như thanh kiếm · thanh thoát', types: ['phuong', 'large'], colour: 'white', pop: 16, wmax: 100,
    region: 'Ấn Độ · Đông Nam Á', wingspan: '80 – 100 mm', meaning: 'Nhanh nhẹn · Thanh thoát',
    desc: ['Cánh trắng kem điểm những vạch đen thanh mảnh, kéo dài thành đôi đuôi nhọn như lưỡi kiếm — nguồn gốc của cái tên "cánh kiếm".', 'Loài phượng bay rất nhanh này thường tụ tập hút khoáng bên bờ suối ẩm trong các khu rừng nhiệt đới.'] },
  { id: 'parantica', img: '/images/card-parantica.png', vn: 'Hổ Thuỷ Tinh', sci: 'Parantica aglea', en: 'Glassy Tiger', premium: false, tag: 'Cánh trong suốt · vân tinh tế', types: ['tropical'], colour: 'white', pop: 17, wmax: 85,
    region: 'Nam Á · Đông Nam Á', wingspan: '70 – 85 mm', meaning: 'Thuần khiết · Tĩnh tại',
    desc: ['Đôi cánh nửa trong suốt phơn phớt xanh như thuỷ tinh, kẻ bởi những đường gân đen mảnh — thanh khiết và mong manh.', 'Thuộc họ bướm sữa, nó bay lượn nhẹ nhàng và mang độc tố tự vệ, thường thấy lượn lờ trong rừng thưa.'] },
  { id: 'hollyblue', img: '/images/cut-hollyblue.png', vn: 'Bướm Xanh Holly', sci: 'Celastrina argiolus', en: 'Holly Blue', premium: false, tag: 'Size bé xinh · màu xanh thần thánh', types: ['small'], colour: 'blue', pop: 18, wmax: 35,
    region: 'Châu Âu · Châu Á', wingspan: '30 – 35 mm', meaning: 'Nhỏ xinh · Tinh khôi',
    desc: ['Loài bướm xanh nhỏ nhắn với sắc lam phớt bạc thanh khiết, thường bay quanh những bụi nhựa ruồi và thường xuân.', 'Nhỏ bé nhưng tinh tế, nó mang đến vẻ đẹp dịu dàng rất riêng giữa bộ sưu tập.'] },
];

const VIBE_MAP: Record<string, string> = {
  'Niềm vui': '😊', 'Hy vọng': '🌱', 'Chuyển hoá': '🦋', 'Rực rỡ': '🌈', 'Độc bản': '💎', 'Khát vọng': '🔥',
  'Cao quý': '👑', 'Lộng lẫy': '✨', 'Quyền quý': '👑', 'Kiêu hãnh': '🦚', 'Phương Đông': '🏯', 'Thanh tao': '🕊️',
  'Ánh trăng': '🌙', 'Mê hoặc': '💫', 'Vương giả': '👑', 'Mạnh mẽ': '💪', 'Bí ẩn': '🌑', 'Nhiệt huyết': '🔥',
  'Khéo léo': '🍃', 'Minh mẫn': '👁️', 'Tinh anh': '⚡', 'Năng động': '⚡', 'Tươi mới': '🌿', 'Óng ánh': '✨',
  'Tự do': '🕊️', 'Bền bỉ': '🛡️', 'Trường tồn': '♾️', 'Bảo hộ': '🛡️', 'Nhanh nhẹn': '💨', 'Thanh thoát': '🍃',
  'Thuần khiết': '🤍', 'Tĩnh tại': '🧘', 'Nhỏ xinh': '🌸', 'Tinh khôi': '🤍',
};

export function vibeFor(word: string): string {
  return VIBE_MAP[word] || '🦋';
}

export const TYPE_DEFS: [string, string][] = [
  ['premium', 'Cao cấp'], ['phuong', 'Phượng'], ['iridescent', 'Ánh kim'], ['colorful', 'Rực rỡ'],
  ['rare', 'Quý hiếm'], ['large', 'Khổng lồ'], ['small', 'Nhỏ xinh'], ['tropical', 'Nhiệt đới'],
];

export const COLOUR_DEFS: [string, string][] = [
  ['red', '#E05C45'], ['orange', '#E8956A'], ['yellow', '#D4B84A'], ['green', '#4CAF73'],
  ['blue', '#6BAED6'], ['purple', '#9B6BB5'], ['brown', '#8B6551'], ['black', '#2C2C2C'], ['white', '#F5F0E8'],
];
