package com.dineease.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // @Async giúp hàm này tự rẽ nhánh sang 1 luồng khác để chạy,
    @Async
    public void sendApprovalEmail(String toEmail, String password, String restaurantName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            // Báo hiệu cho Spring biết đây là tin nhắn hỗ trợ HTML
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Dine-Ease: Chúc mừng! Nhà hàng của bạn đã được phê duyệt");

            // Template HTML cho Email
            String htmlContent = "<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;'>"
                    + "<h2 style='color: #4CAF50;'>Chào mừng bạn đến với Dine-Ease!</h2>"
                    + "<p>Kính gửi Chủ nhà hàng <b>" + restaurantName + "</b>,</p>"
                    + "<p>Chúng tôi rất vui mừng thông báo: Yêu cầu đăng ký mở nhà hàng của bạn trên hệ thống Dine-Ease đã được <b>Quản trị viên phê duyệt</b> thành công.</p>"
                    + "<p>Hệ thống đã tự động tạo một tài khoản để bạn có thể truy cập vào Trang Quản Lý (Dashboard). Dưới đây là thông tin đăng nhập của bạn:</p>"
                    + "<div style='background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;'>"
                    + "  <p style='margin: 5px 0;'><b>👤 Tên đăng nhập (Email):</b> " + toEmail + "</p>"
                    + "  <p style='margin: 5px 0;'><b>🔑 Mật khẩu tạm thời:</b> <span style='color: #e74c3c; font-weight: bold;'>" + password + "</span></p>"
                    + "</div>"
                    + "<p style='color: #e74c3c;'><i>* Lưu ý quan trọng: Vui lòng đăng nhập và tiến hành đổi mật khẩu ngay lập tức để đảm bảo tính bảo mật.</i></p>"
                    + "<p>Chúc nhà hàng kinh doanh hồng phát!</p>"
                    + "<br>"
                    + "<p>Trân trọng,<br><b>Đội ngũ Dine-Ease.</b></p>"
                    + "</div>";

            helper.setText(htmlContent, true); // True để parse HTML

            mailSender.send(message);
            log.info("Thành công: Đã gửi email thông báo phê duyệt + Mật khẩu đến tài khoản {}", toEmail);

        } catch (MessagingException e) {
            // Không làm crash hệ thống vì đang ở luồng @Async
            log.error("Thất bại: Lỗi khi gửi email đến {}. Chi tiết: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendNotificationEmail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);
            
            // Nội dung lấy thẳng từ Database (do Frontend soạn bằng RichTextEditor)
            // Bọc thêm một chút CSS khung nền cho đẹp
            String wrappedHtml = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>"
                               + "<h2 style='color: #f59e0b; text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;'>" + subject + "</h2>"
                               + "<div style='margin-top: 20px; color: #444; line-height: 1.6;'>"
                               + htmlContent
                               + "</div>"
                               + "<div style='margin-top: 30px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; pt-10;'>"
                               + "© 2026 Dine Ease. Đây là email tự động, vui lòng không trả lời."
                               + "</div></div>";

            helper.setText(wrappedHtml, true);
            mailSender.send(message);
            log.info("Thành công: Đã gửi thông báo đến {}", toEmail);

        } catch (MessagingException e) {
            log.error("Lỗi khi gửi thông báo đến {}: {}", toEmail, e.getMessage());
        }
    }
}