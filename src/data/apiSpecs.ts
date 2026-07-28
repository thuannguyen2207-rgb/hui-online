export interface ApiEndpointSpec {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  headers: Record<string, string>;
  requestBody?: object;
  responseSuccess: object;
  responseError?: object;
  notes?: string;
}

export const API_ENDPOINTS_LIST: ApiEndpointSpec[] = [
  {
    id: 'auth_otp',
    name: '1. Đăng ký / Đăng nhập OTP SĐT',
    method: 'POST',
    path: '/api/v1/auth/verify-phone-otp',
    description: 'Xác thực mã OTP gửi về số điện thoại người dùng, tự động khởi tạo tài khoản nếu là hội viên mới.',
    headers: {
      'Content-Type': 'application/json',
    },
    requestBody: {
      phone: '0908123456',
      otp_code: '668899',
      full_name: 'Nguyen Van An',
      role: 'chu_hui',
    },
    responseSuccess: {
      status: 200,
      success: true,
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'usr_98231a4f-561b-4172-8889-7262f1228491',
          phone: '0908123456',
          name: 'Nguyen Van An',
          role: 'chu_hui',
          verified: true,
        },
      },
    },
  },
  {
    id: 'create_hui_day',
    name: '2. Khởi Tạo Dây Hụi Mới (Host)',
    method: 'POST',
    path: '/api/v1/hui-days/create',
    description: 'Tạo dây hụi với đầy đủ cấu hình linh hoạt: Phí Thảo, Trần/Sàn nộp thăm, Quy tắc xử lý khi hòa giá đấu.',
    headers: {
      'Authorization': 'Bearer eyJhbGciOi...',
      'Content-Type': 'application/json',
    },
    requestBody: {
      name: 'Hụi Tháng Chợ Bến Thành - 10 Tr/Kỳ',
      total_shares: 12,
      share_amount: 10000000,
      cycle_type: 'monthly',
      fee_type: 'percent_value',
      fee_value: 2.0, // 2% của V = 200,000 VND / phần
      min_bid_type: 'amount',
      min_bid_value: 100000,
      max_bid_type: 'percent',
      max_bid_value: 30.0, // Trần tối đa 3,000,000 VND
      tie_break_rule: 'earliest', // 1. Người nộp sớm hơn OR 2. Random
      start_date: '2026-08-01',
      bank_config: {
        bank_name: 'Ngan Hang Quan Doi',
        bank_code: 'MB',
        account_number: '0908123456888',
        account_name: 'NGUYEN VAN AN',
      },
    },
    responseSuccess: {
      status: 201,
      success: true,
      data: {
        hui_day_id: 'day_78a1f29b-8890-4e2b-a128-89c0a3771901',
        invite_code: 'HUI8899',
        invite_link: 'https://tingbooks.net/join/HUI8899',
        created_at: '2026-07-23T05:32:00Z',
      },
    },
  },
  {
    id: 'submit_bid',
    name: '3. Nộp Thăm / Bỏ Giá Đấu Hụi',
    method: 'POST',
    path: '/api/v1/hui-days/:hui_day_id/rounds/:round_number/bids',
    description: 'Hụi viên chưa hốt (Hụi Sống) gửi mức nộp thăm $T$. Hệ thống kiểm tra trần/sàn tự động.',
    headers: {
      'Authorization': 'Bearer eyJhbGciOi...',
      'Content-Type': 'application/json',
    },
    requestBody: {
      member_id: 'mem_1102',
      bid_amount: 1500000, // T = 1.500.000 VNĐ
    },
    responseSuccess: {
      status: 200,
      success: true,
      data: {
        bid_id: 'bid_5588102',
        submitted_at: '2026-07-23T10:15:30Z',
        validation: {
          is_valid: true,
          min_bid: 100000,
          max_bid: 3000000,
        },
      },
    },
    responseError: {
      status: 400,
      success: false,
      error: {
        code: 'BID_EXCEEDS_MAX_LIMIT',
        message: 'Mức nộp thăm 3.500.000 đ vượt quá mức trần tối đa 3.000.000 đ.',
      },
    },
  },
  {
    id: 'finalize_round',
    name: '4. Chốt Kỳ & Chạy Thuật Toán Tài Chính',
    method: 'POST',
    path: '/api/v1/hui-days/:hui_day_id/rounds/:round_number/finalize',
    description: 'Chủ hụi mở thăm, xác định người thắng (xử lý hòa giá nếu có), tính toán $R$ và tự động sinh sổ gạch nợ.',
    headers: {
      'Authorization': 'Bearer eyJhbGciOi...',
      'Content-Type': 'application/json',
    },
    requestBody: {
      round_number: 1,
      override_winner_bid_id: null, // Mặc định tự động chọn cao nhất
    },
    responseSuccess: {
      status: 200,
      success: true,
      data: {
        round_summary: {
          round_number: 1,
          winning_bid_amount: 1500000,
          winner_user_name: 'Tran Thi Binh',
          total_dead_shares: 0,
          total_live_shares: 12,
          live_contribution_per_share: 8500000, // V - T = 10tr - 1.5tr
          dead_contribution_per_share: 10000000, // V = 10tr
          gross_collected: 102000000,
          host_commission: 2000000,
          winner_net_payout_R: 91500000, // R formula
        },
        generated_transactions_count: 12,
      },
    },
  },
  {
    id: 'generate_vietqr',
    name: '5. Lấy Mã VietQR Động Cho Kỳ Hụi',
    method: 'GET',
    path: '/api/v1/transactions/:tx_id/vietqr',
    description: 'Tạo ảnh Napas247 VietQR động chứa đúng số tiền phải đóng ($V-T$ hoặc $V$) và nội dung gạch nợ tự động.',
    headers: {
      'Authorization': 'Bearer eyJhbGciOi...',
    },
    responseSuccess: {
      status: 200,
      success: true,
      data: {
        tx_id: 'tx_998122',
        amount_due: 8500000,
        payment_ref: 'HUI CHOBENTHANH K1 TRANTHIBINH',
        vietqr_image_url: 'https://img.vietqr.io/image/MB-0908123456888-compact2.png?amount=8500000&addInfo=HUI%20CHOBENTHANH%20K1&accountName=NGUYEN%20VAN%20AN',
        bank_details: {
          bank_name: 'MB Bank',
          account_number: '0908123456888',
          account_name: 'NGUYEN VAN AN',
        },
      },
    },
  },
];
