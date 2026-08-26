export interface Credentials {
  email: string;
  password: string;
}

/** Tài khoản hợp lệ (lấy từ .env, có fallback cho demo site). */
export const VALID_USER: Credentials = {
  email: process.env.APP_USERNAME ?? 'admin@example.com',
  password: process.env.APP_PASSWORD ?? '123456',
};

export const INVALID_USERS: Array<{ title: string } & Credentials> = [
  { title: 'sai password', email: VALID_USER.email, password: 'wrong-password-123' },
  { title: 'sai email', email: 'not-exist-user@example.com', password: VALID_USER.password },
  { title: 'sai cả email và password', email: 'nobody@example.com', password: 'nope' },
];

export const EMPTY_FIELD_CASES: Array<{ title: string } & Credentials> = [
  { title: 'bỏ trống email', email: '', password: VALID_USER.password },
  { title: 'bỏ trống password', email: VALID_USER.email, password: '' },
  { title: 'bỏ trống cả hai', email: '', password: '' },
];
