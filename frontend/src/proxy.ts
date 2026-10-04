import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  // Cho phép các route public của nhà hàng (VD: /restaurant/1)
  const isPublicRestaurantRoute = /^\/restaurant\/\d+$/.test(pathname);

  // ========================================================
  // NHÓM 1: BẢO VỆ CÁC TRANG ADMIN / RESTAURANT / USER
  // ========================================================
  const isProtected = pathname.startsWith("/admin") || pathname.startsWith("/restaurant") || pathname.startsWith("/user");

  // Cho phép xem trang thành công mà không bị Middleware đá ra Login (Fix redirect VNPay)
  const isCheckoutSuccess = pathname.endsWith("/success");

  if (isProtected && !isPublicRestaurantRoute && !isCheckoutSuccess) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }


    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api/v1";
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store", 
      });

      if (!res.ok) {
        // Token tồn tại nhưng không hợp lệ (hết hạn) -> Xóa Cookie rác và bắt Login lại
        
        // VÁ LỖ HỔNG: Gắn thêm callbackUrl để nhớ vị trí khách bị đá
        const loginUrl = new URL("/login?session_expired=true", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname); // Lưu đường dẫn hiện tại
        
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("accessToken"); 
        response.cookies.delete("userRoles");
        return response;
      }


      const userData = await res.json();
      const roles: string[] = userData.roles || [];
      const restaurantStatus: string = userData.restaurantStatus; // <-- Lấy thêm field này

      if (pathname.startsWith("/admin") && !roles.includes("ADMIN")) {
        return NextResponse.redirect(new URL(roles.includes("RESTAURANT") ? "/restaurant" : "/", request.url));
      }
      
      if (pathname.startsWith("/restaurant") && !roles.includes("RESTAURANT")) {
        return NextResponse.redirect(new URL(roles.includes("ADMIN") ? "/admin" : "/", request.url));
      }

      // [BẢO MẬT QUAN TRỌNG]: Đang vào route /restaurant và ĐÃ CÓ Role RESTAURANT
      // Kiểm tra xem nhà hàng đó có đang hợp lệ không (ACTIVE hoặc APPROVED)
      if (pathname.startsWith("/restaurant") && roles.includes("RESTAURANT")) {
        if (restaurantStatus !== "ACTIVE" && restaurantStatus !== "APPROVED") {
          // Nhà hàng bị khóa/chưa duyệt -> Xóa token và đá về trang Login kèm thông báo
          const response = NextResponse.redirect(new URL("/login?error=restaurant_locked", request.url));
          response.cookies.delete("accessToken"); 
          response.cookies.delete("userRoles");
          return response;
        }
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ========================================================
  // NHÓM 2: XỬ LÝ TRANG LOGIN / REGISTER (TRÁNH LỖI LẶP VÔ HẠN)
  // ========================================================
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api/v1";
        const res = await fetch(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        // Nếu Token còn ngon lành -> Mới không cho vào trang Login nữa, đẩy vào Home/Admin
        if (res.ok) {
          const userData = await res.json();
          const roles: string[] = userData.roles || [];
          if (roles.includes("ADMIN")) return NextResponse.redirect(new URL("/admin", request.url));
          if (roles.includes("RESTAURANT")) return NextResponse.redirect(new URL("/restaurant", request.url));
          return NextResponse.redirect(new URL("/", request.url));
        } else {
          // [FIX CỦA YẾN]: Nếu Token hỏng -> Cho phép ở lại trang Login và dọn dẹp Cookie cũ
          const response = NextResponse.next();
          response.cookies.delete("accessToken");
          response.cookies.delete("userRoles");
          return response;
        }
      } catch (error) {
        // Lỗi server sập -> Cứ để họ vào form login
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/restaurant/:path*", "/user/:path*", "/login", "/register"],
};

