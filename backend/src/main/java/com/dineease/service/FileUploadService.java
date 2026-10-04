package com.dineease.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class FileUploadService {
    private static final Logger log = LoggerFactory.getLogger(FileUploadService.class);
    private final Cloudinary cloudinary;

    public FileUploadService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadFile(MultipartFile file) {
        try {
            // Kiểm tra file trống
            if (file.isEmpty()) {
                throw new RuntimeException("File không được để trống");
            }

            String uniqueFilename = UUID.randomUUID().toString();

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadOptions = ObjectUtils.asMap(
                    "public_id", "dineease-menu/" + uniqueFilename,
                    "resource_type", "auto");

            // --- THAY ĐỔI Ở ĐÂY ---
            // Thay vì truyền file.getInputStream(), hãy truyền file.getBytes()
            // Cloudinary SDK nhận diện byte[] tốt hơn so với các luồng InputStream phức tạp
            byte[] fileBytes = file.getBytes();

            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(fileBytes, uploadOptions);

            String secureUrl = uploadResult.get("secure_url").toString();
            log.info("Tải ảnh lên thành công: {}", secureUrl);
            return secureUrl;

        } catch (IOException e) {
            log.error("Lỗi tải ảnh lên Cloudinary chi tiết: ", e);
            throw new RuntimeException("Không thể tải hình ảnh lên hệ thống: " + e.getMessage());
        }
    }

    // Đã thêm từ code của Đoan: Hàm dọn rác (Xóa ảnh trên Cloudinary)
    public void deleteFile(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty())
            return;
        try {
            int uploadIndex = imageUrl.indexOf("/upload/");
            if (uploadIndex == -1)
                return; // Không phải link Cloudinary hợp lệ

            String afterUpload = imageUrl.substring(uploadIndex + 8);
            int versionSlashIndex = afterUpload.indexOf('/');
            String publicIdWithExt = afterUpload.substring(versionSlashIndex + 1);

            // Cắt bỏ phần đuôi mở rộng (ví dụ: .jpg, .png)
            int lastDotIndex = publicIdWithExt.lastIndexOf('.');
            String publicId = (lastDotIndex != -1) ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;

            // Gửi API xóa lên Cloudinary
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Đã dọn dẹp rác (xóa ảnh cũ) trên Cloudinary: {}", publicId);

        } catch (Exception e) {
            log.error("Lỗi khi xóa ảnh trên Cloudinary: {}", e.getMessage());
        }
    }
}