package com.dineease.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.dineease.entity.LegalDocument;
import com.dineease.entity.Restaurant;
import com.dineease.repository.RestaurantRepository;
import com.dineease.exception.ResourceNotFoundException;

@Service
public class LegalDocumentService {

    private final RestaurantRepository restaurantRepository;
    private final FileUploadService fileUploadService;

    public LegalDocumentService(RestaurantRepository restaurantRepository, FileUploadService fileUploadService) {
        this.restaurantRepository = restaurantRepository;
        this.fileUploadService = fileUploadService;
    }

    @Transactional
    public void uploadLegalDocument(String email, String docName, MultipartFile file) {
        Restaurant restaurant = restaurantRepository.findByOwnerEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng không tồn tại"));

        String fileUrl = fileUploadService.uploadFile(file);
        
        LegalDocument doc = LegalDocument.builder()
            .documentName(docName)
            .fileUrl(fileUrl)
            .restaurant(restaurant)
            .build();
            
        restaurant.getLegalDocuments().add(doc);
        restaurantRepository.save(restaurant);
    }
}
