import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // NẾU GỬI FORMDATA THÌ XÓA CONTENT-TYPE ĐỂ TRÌNH DUYỆT TỰ XỬ LÝ (BOUNDARY)
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Hàng đợi lưu các request bị rớt khi đang chờ refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // [BẢO MẬT TĂNG CƯỜNG]: NẾU BACKEND TRẢ VỀ 403 (FORBIDDEN) HOẶC LỖI AccountLocked
    // NGAY LẬP TỨC ĐÁ VĂNG USER KHỎI HỆ THỐNG (SESSION HACKING FIX)
    if (error.response?.status === 403 || error.response?.data?.error === "AccountLocked") {
      return forceLogout();
    }

    // Nếu lỗi 401 và không phải là request đang đi gọi /auth/refresh hoặc /auth/login
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
      
      if (isRefreshing) {
        // Đang có 1 thằng khác gọi refresh rồi, nhét thằng này vào hàng đợi
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return axios(originalRequest).then(res => res.data); // Chỗ này axios gốc trả về data
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // Không có refresh token -> Cho đăng xuất luôn
        return forceLogout();
      }

      try {
        // Gọi API lấy token mới (Dùng axios thuần, không dùng biến api để tránh lặp vô hạn)
        const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken: refreshToken
        });

        const newAccessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        // Lưu lại thông tin mới
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        
        const cookieOptions = { 
          expires: 1, 
          secure: process.env.NODE_ENV === "production", 
          sameSite: "strict" as const 
        };
        Cookies.set("accessToken", newAccessToken, cookieOptions);

        // Chạy lại các request đang xếp hàng
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Chạy lại chính cái request bị lỗi ban đầu
        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;
        const retryResult = await axios(originalRequest);
        return retryResult.data;

      } catch (refreshError) {
        // Đổi token thất bại (Ví dụ Refresh token hết hạn nốt, hoặc bị admin ban)
        processQueue(refreshError, null);
        isRefreshing = false;
        return forceLogout();
      }
    }

    return Promise.reject(error);
  }
);

// Hàm Helper để bắt ép đăng xuất
function forceLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    Cookies.remove("accessToken");
    Cookies.remove("userRoles");

    if (window.location.pathname !== "/login") {
      // VÁ LỖ HỔNG: Lấy đường dẫn hiện tại (VD: /user/checkout/new/step3)
      const currentPath = window.location.pathname;
      
      // Chuyển hướng kèm tham số callbackUrl
      window.location.href = `/login?session_expired=true&callbackUrl=${encodeURIComponent(currentPath)}`;
    }
  }
  return Promise.reject(new Error("Session Expired"));
}


export default api;
