package com.dineease.chatbot.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SemanticRouter {

    private static final Logger log = LoggerFactory.getLogger(SemanticRouter.class);

    private final EmbeddingModel embeddingModel;
    private final ObjectMapper objectMapper;

    // Trỏ tới file JSON trong thư mục resources
    @Value("classpath:chatbot-intents.json")
    private Resource intentsResource;

    private record IntentPattern(String text, float[] vector, ChatIntent intent) {
    }

    private final List<IntentPattern> patterns = new ArrayList<>();

    // Ngưỡng tự tin (Điều chỉnh về 0.72 theo yêu cầu thực tế)
    private static final double SIMILARITY_THRESHOLD = 0.72;

    // Inject thêm ObjectMapper
    public SemanticRouter(EmbeddingModel embeddingModel, ObjectMapper objectMapper) {
        this.embeddingModel = embeddingModel;
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void initializeSeedPhrases() {
        log.info("🧠 Đang đọc file chatbot-intents.json và khởi tạo Semantic Router...");

        try (InputStream inputStream = intentsResource.getInputStream()) {
            // Đọc file JSON và ép kiểu thành Map<ChatIntent, List<String>>
            Map<ChatIntent, List<String>> intentData = objectMapper.readValue(
                    inputStream,
                    new TypeReference<Map<ChatIntent, List<String>>>() {
                    });

            // Duyệt qua từng Key (DISCOVERY, TRANSACTION, GENERAL)
            intentData.forEach((intent, phrases) -> {
                for (String text : phrases) {
                    addPattern(text, intent);
                }
            });

            log.info("✅ Hoàn tất khởi tạo. Nạp xong {} mẫu nhận thức Intent từ file JSON.", patterns.size());

        } catch (Exception e) {
            log.error("❌ LỖI: Không thể đọc file chatbot-intents.json. Vui lòng kiểm tra lại!", e);
        }
    }

    private void addPattern(String text, ChatIntent intent) {
        float[] vector = embeddingModel.embed(text);
        patterns.add(new IntentPattern(text, vector, intent));
    }

    public ChatIntent predictIntent(String userMessage) {
        float[] userVector;
        try {
            userVector = embeddingModel.embed(userMessage);
        } catch (Exception e) {
            log.error("⚠️ Lỗi Embedding khi dự đoán Intent (có thể do API key): {}. Fallback to GENERAL.", e.getMessage());
            return ChatIntent.GENERAL;
        }

        double maxScore = -1.0;
        ChatIntent bestIntent = ChatIntent.GENERAL;

        for (IntentPattern pattern : patterns) {
            double score = cosineSimilarity(userVector, pattern.vector());

            if (score > maxScore) {
                maxScore = score;
                bestIntent = pattern.intent();
            }
        }

        log.info("📏 Độ khớp Router cao nhất: {}, Intent chốt lại: {}", Math.round(maxScore * 100.0) / 100.0,
                bestIntent);

        if (maxScore < SIMILARITY_THRESHOLD) {
            log.warn("⚠️ Intent lệch chuẩn thấp hơn Threshold ({} < {}), Chuyển hướng Fallback qua GENERAL.", maxScore,
                    SIMILARITY_THRESHOLD);
            return ChatIntent.GENERAL;
        }

        return bestIntent;
    }

    private double cosineSimilarity(float[] vectorA, float[] vectorB) {
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;
        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += Math.pow(vectorA[i], 2);
            normB += Math.pow(vectorB[i], 2);
        }
        if (normA == 0.0 || normB == 0.0)
            return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
