export interface CityData {
  name: string;
  districts: {
    name: string;
    wards: string[];
  }[];
}

export const POPULAR_STREETS = [
  'Nguyễn Trãi',
  'Lê Văn Sỹ',
  'Cách Mạng Tháng 8',
  'Nguyễn Thị Minh Khai',
  'Điện Biên Phủ',
  'Trần Hưng Đạo',
  'Nam Kỳ Khởi Nghĩa',
  'Nguyễn Huệ',
  'Lê Lợi',
  'Phạm Văn Đồng',
  'Hoàng Văn Thụ',
  'Võ Văn Kiệt',
  'Cộng Hòa',
  'Trường Chinh'
];

export const VIETNAM_PROVINCES: CityData[] = [
  {
    name: 'TP. Hồ Chí Minh',
    districts: [
      {
        name: 'Quận 1',
        wards: ['Phường Bến Thành', 'Phường Bến Nghé', 'Phường Phạm Ngũ Lão', 'Phường Tân Định', 'Phường Đa Kao']
      },
      {
        name: 'Quận 3',
        wards: ['Phường Võ Thị Sáu', 'Phường 1', 'Phường 2', 'Phường 3', 'Phường 14']
      },
      {
        name: 'Quận 7',
        wards: ['Phường Tân Phong', 'Phường Tân Phú', 'Phường Tân Quy', 'Phường Bình Thuận']
      },
      {
        name: 'Quận Bình Thạnh',
        wards: ['Phường 14', 'Phường 15', 'Phường 25', 'Phường 26', 'Phường 27']
      },
      {
        name: 'Quận Tân Bình',
        wards: ['Phường 2', 'Phường 4', 'Phường 12', 'Phường 13', 'Phường 15']
      },
      {
        name: 'TP. Thủ Đức',
        wards: ['Phường Thảo Điền', 'Phường An Phú', 'Phường Bình Trưng Đông', 'Phường Linh Trung', 'Phường Hiệp Bình Chánh']
      }
    ]
  },
  {
    name: 'TP. Hà Nội',
    districts: [
      {
        name: 'Quận Hoàn Kiếm',
        wards: ['Phường Hàng Bạc', 'Phường Hàng Bài', 'Phường Tràng Tiền', 'Phường Lý Thái Tổ']
      },
      {
        name: 'Quận Cầu Giấy',
        wards: ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Yên Hòa', 'Phường Trung Hòa']
      },
      {
        name: 'Quận Nam Từ Liêm',
        wards: ['Phường Mỹ Đình 1', 'Phường Mỹ Đình 2', 'Phường Mễ Trì', 'Phường Trung Văn']
      },
      {
        name: 'Quận Đống Đa',
        wards: ['Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Ô Chợ Dừa', 'Phường Văn Miếu']
      }
    ]
  },
  {
    name: 'TP. Đà Nẵng',
    districts: [
      {
        name: 'Quận Hải Châu',
        wards: ['Phường Hải Châu 1', 'Phường Thạch Thang', 'Phường Phước Ninh']
      },
      {
        name: 'Quận Thanh Khê',
        wards: ['Phường Vĩnh Trung', 'Phường Tân Chính', 'Phường An Khê']
      },
      {
        name: 'Quận Sơn Trà',
        wards: ['Phường An Hải Bắc', 'Phường Phước Mỹ', 'Phường Thọ Quang']
      }
    ]
  },
  {
    name: 'TP. Cần Thơ',
    districts: [
      {
        name: 'Quận Ninh Kiều',
        wards: ['Phường Tân An', 'Phường An Phú', 'Phường Xuân Khánh', 'Phường An Hòa']
      },
      {
        name: 'Quận Bình Thủy',
        wards: ['Phường Bình Thủy', 'Phường Trà Nóc', 'Phường Trà An']
      }
    ]
  },
  {
    name: 'Tỉnh Bình Dương',
    districts: [
      {
        name: 'TP. Thủ Dầu Một',
        wards: ['Phường Phú Hòa', 'Phường Phú Cường', 'Phường Chánh Nghĩa', 'Phường Chánh Mỹ']
      },
      {
        name: 'TP. Dĩ An',
        wards: ['Phường Dĩ An', 'Phường Tân Đông Hiệp', 'Phường Đông Hòa']
      },
      {
        name: 'TP. Thuận An',
        wards: ['Phường Lái Thiêu', 'Phường An Thạnh', 'Phường Thuận Giao']
      }
    ]
  },
  {
    name: 'Tỉnh Đồng Nai',
    districts: [
      {
        name: 'TP. Biên Hòa',
        wards: ['Phường Tân Phong', 'Phường Trảng Dài', 'Phường Bửu Long', 'Phường Hố Nai']
      }
    ]
  },
  {
    name: 'Tỉnh Tiền Giang',
    districts: [
      {
        name: 'TP. Mỹ Tho',
        wards: ['Phường 1', 'Phường 2', 'Phường 5', 'Phường 6']
      }
    ]
  },
  {
    name: 'Tỉnh An Giang',
    districts: [
      {
        name: 'TP. Long Xuyên',
        wards: ['Phường Mỹ Bình', 'Phường Mỹ Long', 'Phường Mỹ Phước']
      }
    ]
  }
];

export const POPULAR_BUILDINGS = [
  'Chung cư Vinhomes Central Park',
  'Chung cư Masteri Thảo Điền',
  'Chung cư Sunrise City',
  'Chung cư Goldmark City',
  'Chung cư Royal City',
  'Chung cư Times City',
  'Chung cư The Sun Avenue',
  'Chung cư Imperia An Phú',
  'Chung cư Scenic Valley',
  'Chung cư Feliz En Vista'
];

export const QUICK_PRESET_ADDRESSES = [
  '123 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
  'Căn hộ A-12.08, Chung cư Vinhomes Central Park, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh',
  'Căn hộ B-0502, Chung cư Sunrise City, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh',
  '456 Lê Văn Sỹ, Phường 12, Quận 3, TP. Hồ Chí Minh',
  '88 Đường Cách Mạng Tháng 8, Phường 6, Quận 3, TP. Hồ Chí Minh',
  '79 Đường Dịch Vọng Hậu, Quận Cầu Giấy, TP. Hà Nội'
];
