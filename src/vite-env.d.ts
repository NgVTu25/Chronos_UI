interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Thêm các biến env khác của bạn ở đây nếu cần
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}