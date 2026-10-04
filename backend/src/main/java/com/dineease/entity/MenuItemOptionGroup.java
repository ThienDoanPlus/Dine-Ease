package com.dineease.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "menu_item_option_groups")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuItemOptionGroup {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name; // VD: "Chọn Size", "Độ ngọt", "Thêm Topping"

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRequired = false; // Bắt buộc chọn không? (VD: Size là bắt buộc)

    @Column(nullable = false)
    @Builder.Default
    private Integer maxChoices = 1; // Chọn tối đa bao nhiêu? (VD: Topping có thể chọn nhiều)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @OneToMany(mappedBy = "optionGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MenuItemOptionChoice> choices = new ArrayList<>();
}
