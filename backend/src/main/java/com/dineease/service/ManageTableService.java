package com.dineease.service;

import com.dineease.dto.FloorPlanResponse;
import com.dineease.dto.FloorPlanSyncRequest;
import com.dineease.dto.TableRequest;
import com.dineease.dto.TableResponse;
import com.dineease.entity.Restaurant;
import com.dineease.entity.RestaurantTable;
import com.dineease.entity.TableStatus;
import com.dineease.exception.ResourceNotFoundException;
import com.dineease.repository.RestaurantRepository;
import com.dineease.repository.RestaurantTableRepository;
import com.dineease.repository.OrderRepository;
import com.dineease.entity.OrderStatus;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ManageTableService {
    private final RestaurantTableRepository tableRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderRepository orderRepository;


    @Transactional(readOnly = true)
    public FloorPlanResponse getFloorPlanData(String email) {
        Restaurant restaurant = restaurantRepository.findByOwnerEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng không tồn tại"));

        // Chỉ lấy những bàn không bị xóa mềm (Khác HIDDEN)
        List<TableResponse> tableResponses = tableRepository.findByRestaurantOwnerEmail(email).stream()
            .filter(t -> t.getStatus() != TableStatus.HIDDEN)
            .map(t -> new TableResponse(
                t.getId(), t.getTableName(), t.getCapacity(), t.getStatus(),
                t.getX(), t.getY(), t.getWidth(), t.getHeight(),
                t.getShape(), t.getRotation(), t.getFloorName(),
                t.getMergedId()
            )).toList();

        return new FloorPlanResponse(tableResponses, restaurant.getArchitecturalData());
    }

    public void syncFloorPlan(FloorPlanSyncRequest request, String email) {
        Restaurant restaurant = restaurantRepository.findByOwnerEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng không tồn tại"));

        // 1. Lưu chuỗi JSON kiến trúc (Tường, Cửa, Quầy)
        restaurant.setArchitecturalData(request.architecturalData());
        restaurantRepository.save(restaurant);

        // ==========================================================
        // 2. [ĐÃ FIX]: Đưa vào Map theo ID (Khóa chính) thay vì Tên bàn
        // ==========================================================
        List<RestaurantTable> existingTables = tableRepository.findByRestaurantOwnerEmail(email);
        Map<Long, RestaurantTable> existingTableMap = existingTables.stream()
            .filter(t -> t.getStatus() != TableStatus.HIDDEN)
            .collect(Collectors.toMap(RestaurantTable::getId, t -> t)); // SỬA: Lấy ID làm Key

        // [VÁ LỖ HỔNG]: Gom lại thành 1 list để Batch Update
        List<RestaurantTable> tablesToSave = new java.util.ArrayList<>();

        // 3. Duyệt qua mảng bàn gửi từ Frontend
        for (TableRequest tableReq : request.tables()) {
            RestaurantTable table = null;

            // Xử lý ID từ Frontend: Frontend sẽ gửi dạng "t_12" (bàn cũ) hoặc "el_123456" (bàn mới vẽ)
            Long dbId = null;
            if (tableReq.id() != null && tableReq.id().startsWith("t_")) {
                try {
                    dbId = Long.parseLong(tableReq.id().replace("t_", ""));
                } catch (NumberFormatException ignored) {}
            }

            // Nếu ID hợp lệ và tồn tại trong Map -> BÀN CŨ (Cần Update thông tin/tọa độ)
            if (dbId != null && existingTableMap.containsKey(dbId)) {
                table = existingTableMap.get(dbId);
                
                // ==========================================================
                // [VÁ LỖ HỔNG UNMERGE]: KIỂM TRA TRƯỚC KHI CHO PHÉP TÁCH BÀN
                // ==========================================================
                Long oldMergedId = table.getMergedId();
                Long newMergedId = tableReq.mergedId();

                // Nếu bàn trước đó bị gộp, mà bây giờ truyền lên NULL (Tức là đang cố Tách bàn)
                if (oldMergedId != null && newMergedId == null) {
                    
                    // 1. Kiểm tra xem Bàn Master hoặc chính Bàn này có đang mở Bill POS không
                    boolean hasActiveOrder = orderRepository.existsByTableIdAndStatus(oldMergedId, OrderStatus.OPEN) ||
                                             orderRepository.existsByTableIdAndStatus(table.getId(), OrderStatus.OPEN);

                    // 2. Kể cả không có Bill POS, nếu trạng thái bàn đang có khách (OCCUPIED/RESERVED) thì cũng không cho tách
                    if (hasActiveOrder || table.getStatus() == TableStatus.OCCUPIED || table.getStatus() == TableStatus.RESERVED) {
                        throw new IllegalStateException(
                            "Thao tác thất bại: Không thể tách bàn '" + table.getTableName() + 
                            "' vì cụm bàn này đang có khách hoặc chưa hoàn tất thanh toán Hóa đơn!"
                        );
                    }
                }
                // ==========================================================

                existingTableMap.remove(dbId); // Xóa khỏi Map để đánh dấu đã xử lý
            } 

            // Nếu không tìm thấy ID -> BÀN MỚI TOANH VỪA KÉO THẢ (Tạo mới)
            else {
                table = new RestaurantTable();
                table.setRestaurant(restaurant);
                table.setStatus(TableStatus.AVAILABLE);
            }

            // Cập nhật thông tin (Dù đổi tên thì ID vẫn giữ nguyên, bảo toàn Khóa ngoại)
            table.setTableName(tableReq.tableName());
            table.setCapacity(tableReq.capacity());
            table.setX(tableReq.x());
            table.setY(tableReq.y());
            table.setWidth(tableReq.width());
            table.setHeight(tableReq.height());
            table.setShape(tableReq.shape());
            table.setRotation(tableReq.rotation());
            table.setFloorName(tableReq.floorName());
            table.setMergedId(tableReq.mergedId());

            // ==========================================================
            // [VÁ LỖ HỔNG LƯU SƠ ĐỒ BÀN]: Cập nhật Status vào DB
            // ==========================================================
            if (tableReq.status() != null && !tableReq.status().isBlank()) {
                try {
                    table.setStatus(TableStatus.valueOf(tableReq.status()));
                } catch (IllegalArgumentException e) {
                    // Nếu gửi lên bậy bạ thì bỏ qua, giữ status cũ
                }
            }
            
            tablesToSave.add(table); // Add vào list thay vì lưu ngay

        }

        // 4. Các bàn còn sót lại trong Map là các bàn đã bị XÓA trên giao diện
        for (RestaurantTable deletedTable : existingTableMap.values()) {
            if (deletedTable.getStatus() == TableStatus.OCCUPIED || deletedTable.getStatus() == TableStatus.RESERVED) {
                throw new IllegalStateException("Không thể xóa bàn " + deletedTable.getTableName() + " vì đang có khách.");
            }
            deletedTable.setStatus(TableStatus.HIDDEN); 
            tablesToSave.add(deletedTable);
        }

        // [QUAN TRỌNG]: Lưu tất cả bằng 1 lệnh duy nhất (Batch Insert/Update)
        tableRepository.saveAll(tablesToSave);

    }

    public TableResponse createTable(TableRequest request, String email) {
        Restaurant restaurant = restaurantRepository.findByOwnerEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Nhà hàng không tồn tại"));

        RestaurantTable table = RestaurantTable.builder()
            .tableName(request.tableName()) 
            .capacity(request.capacity())
            .restaurant(restaurant)
            .status(TableStatus.AVAILABLE)
            .x(request.x())
            .y(request.y())
            .width(request.width())
            .height(request.height())
            .shape(request.shape())
            .rotation(request.rotation())
            .floorName(request.floorName())
            .mergedId(request.mergedId())
            .build();

        RestaurantTable saved = tableRepository.save(table);
        
        return new TableResponse(
            saved.getId(), saved.getTableName(), saved.getCapacity(), saved.getStatus(),
            saved.getX(), saved.getY(), saved.getWidth(), saved.getHeight(),
            saved.getShape(), saved.getRotation(), saved.getFloorName(),
            saved.getMergedId()
        );
    }

    @Transactional(readOnly = true)
    public List<TableResponse> getTablesByRestaurant(String email) {
        return tableRepository.findByRestaurantOwnerEmail(email).stream()
            .filter(t -> t.getStatus() != TableStatus.HIDDEN) // Lọc bàn đã xóa mềm
            .map(t -> new TableResponse( 
                t.getId(), t.getTableName(), t.getCapacity(), t.getStatus(),
                t.getX(), t.getY(), t.getWidth(), t.getHeight(),
                t.getShape(), t.getRotation(), t.getFloorName(),
                t.getMergedId()
            ))
            .toList();
    }
}