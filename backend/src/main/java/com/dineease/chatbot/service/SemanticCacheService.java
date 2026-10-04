package com.dineease.chatbot.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class SemanticCacheService {

    private static final Logger log = LoggerFactory.getLogger(SemanticCacheService.class);

    private final EmbeddingModel embeddingModel;
    
    // Sử dụng CopyOnWriteArrayList để Thread-safe (An toàn khi nhiều người chat cùng lúc)
    private final List<CacheEntry> memoryCache = new CopyOnWriteArrayList<>();

    // Ngưỡng Cache: Câu chat phải giống 96% trở lên mới được xài lại (Tránh sai lệch ý nghĩa)
    private static final double CACHE_THRESHOLD = 0.96;

    // Cấu trúc lưu trữ 1 dòng Cache
    private record CacheEntry(float[] queryVector, String aiResponse) {}

    public SemanticCacheService(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    /**
     * Dò tìm trong Cache xem có câu trả lời nào sẵn không
     */
    public String checkCache(String userMessage) {
        float[] queryVector = embeddingModel.embed(userMessage);

        for (CacheEntry entry : memoryCache) {
            double score = cosineSimilarity(queryVector, entry.queryVector());
            if (score >= CACHE_THRESHOLD) {
                log.info("⚡ [CACHE HIT] Đã bắt trúng bộ nhớ đệm! Độ tương đồng: {}", Math.round(score * 100.0) / 100.0);
                return entry.aiResponse(); // Trả về kết quả luôn, KHÔNG cần gọi LLM
            }
        }
        return null; // Không trúng Cache
    }

    /**
     * Lưu câu trả lời của AI vào Cache để người sau dùng
     */
    public void saveToCache(String userMessage, String aiResponse) {
        float[] queryVector = embeddingModel.embed(userMessage);
        memoryCache.add(new CacheEntry(queryVector, aiResponse));
        
        // Giới hạn RAM: Nếu bộ nhớ vượt quá 500 câu, xóa bớt câu cũ nhất
        if (memoryCache.size() > 500) {
            memoryCache.remove(0);
        }
    }

    // Thuật toán đo góc Vector (Cosine Similarity)
    private double cosineSimilarity(float[] vectorA, float[] vectorB) {
        double dotProduct = 0.0, normA = 0.0, normB = 0.0;
        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += Math.pow(vectorA[i], 2);
            normB += Math.pow(vectorB[i], 2);
        }
        if (normA == 0.0 || normB == 0.0) return 0.0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
