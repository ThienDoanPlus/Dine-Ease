package com.dineease.exception;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.LockedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.dineease.dto.ApiError;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 1. Lỗi validation dữ liệu (@Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ApiError.FieldErrorDetail> details = ex.getBindingResult().getFieldErrors().stream()
            .map(this::toFieldError)
            .collect(Collectors.toList());

        ApiError body = new ApiError("Bad Request", "Dữ liệu đầu vào không hợp lệ", details, request.getRequestURI(), Instant.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // 2. Lỗi không tìm thấy tài nguyên (404)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ApiError body = new ApiError("Not Found", ex.getMessage(), null, request.getRequestURI(), Instant.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // 3. Lỗi trùng lặp dữ liệu (409) - Dùng cho kẹt bàn, trùng email
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiError> handleConflict(DuplicateResourceException ex, HttpServletRequest request) {
        ApiError body = new ApiError("Conflict", ex.getMessage(), null, request.getRequestURI(), Instant.now());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // 3.1. Lỗi vi phạm ràng buộc Database (Unique constraint) do race condition
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request) {
        log.error("Data integrity violation: {}", ex.getMessage());
        ApiError body = new ApiError("Conflict", "Dữ liệu đã tồn tại hoặc vi phạm ràng buộc cơ sở dữ liệu.", null, request.getRequestURI(), Instant.now());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // LỖI DATA RACE (Kẹt Bill POS)
    @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> handleOptimisticLocking(Exception ex, HttpServletRequest request) {
        log.error("Data Race Detected: 2 nhân viên đang cùng thao tác trên 1 Bill.");
        ApiError body = new ApiError("Conflict", "Hóa đơn đã thay đổi (Bếp vừa nhận thêm món). Vui lòng tải lại trang để xem hóa đơn mới nhất!", null, request.getRequestURI(), Instant.now());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    // 4. Lỗi sai thông tin đăng nhập (401)
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request) {
        ApiError body = new ApiError("Unauthorized", "Email hoặc mật khẩu không đúng", null, request.getRequestURI(), Instant.now());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    // 5. Lỗi xác thực nói chung (401)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthentication(AuthenticationException ex, HttpServletRequest request) {
        ApiError body = new ApiError("Unauthorized", ex.getMessage(), null, request.getRequestURI(), Instant.now());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    // 6. Lỗi không có quyền truy cập (403)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        ApiError body = new ApiError("Forbidden", "Bạn không có quyền truy cập tài nguyên này", null, request.getRequestURI(), Instant.now());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    // Xử lý riêng lỗi Tài khoản / Nhà hàng bị khóa
    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiError> handleLockedException(LockedException ex, HttpServletRequest request) {
        log.warn("Tài khoản bị khóa cố gắng đăng nhập: {}", ex.getMessage());
        
        // Trả về mã 403 (Forbidden) kèm theo lý do chi tiết từ UserDetailsServiceImpl
        ApiError body = new ApiError("Account Locked", ex.getMessage(), null, request.getRequestURI(), Instant.now());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    // 7. Lỗi logic nghiệp vụ hoặc tham số không hợp lệ (400)
    @ExceptionHandler({IllegalStateException.class, IllegalArgumentException.class})
    public ResponseEntity<ApiError> handleBadRequestLogic(RuntimeException ex, HttpServletRequest request) {
        ApiError body = new ApiError("Bad Request", ex.getMessage(), null, request.getRequestURI(), Instant.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    // [TỪ CODE CỦA ĐOAN]: Lỗi upload file quá dung lượng (413 Payload Too Large)
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> handleMaxSizeException(MaxUploadSizeExceededException ex, HttpServletRequest request) {
        log.warn("Cảnh báo: Phát hiện upload file vượt quá dung lượng cho phép - {}", ex.getMessage());
        
        ApiError body = new ApiError(
            "Payload Too Large", 
            "Kích thước ảnh vượt quá giới hạn cho phép. Vui lòng chọn ảnh có dung lượng dưới 2MB.", 
            null, 
            request.getRequestURI(), 
            Instant.now()
        );
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(body);
    }

    // 8. Lỗi hệ thống chưa xác định (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGlobalException(Exception ex, HttpServletRequest request) {
        System.out.println("====== LỖI RỒI: " + ex.getClass().getName() + " ======");
        ex.printStackTrace(); 
        
        log.error("Unhandled error: ", ex);
        ApiError body = new ApiError("Internal Server Error", "Đã xảy ra lỗi hệ thống.", null, request.getRequestURI(), Instant.now());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private ApiError.FieldErrorDetail toFieldError(FieldError fe) {
        return new ApiError.FieldErrorDetail(fe.getField(), fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "Invalid");
    }
}