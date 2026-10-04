export interface MasterCuisine {
  id: string;
  name: string;
  icon: string; // Sử dụng emoji/icon
}

export const MASTER_CUISINES: MasterCuisine[] = [
  { id: "c1", name: "Món Việt", icon: "🍜" },
  { id: "c2", name: "Món Nhật", icon: "🍣" },
  { id: "c3", name: "Đồ Âu", icon: "🍕" },
  { id: "c4", name: "Hải Sản", icon: "🦞" },
  { id: "c5", name: "Ăn Chay", icon: "🥗" },
  { id: "c6", name: "Steak", icon: "🥩" },
  { id: "c7", name: "Món Hàn", icon: "🍱" },
];

export interface MasterAmenity {
  id: string;
  name: string;
  icon: string;
}

export const MASTER_AMENITIES: MasterAmenity[] = [
  { id: "a1", name: "Chỗ đậu ôtô", icon: "🅿️" },
  { id: "a2", name: "Có phòng VIP", icon: "👑" },
  { id: "a3", name: "Khu vui chơi trẻ em", icon: "👶" },
  { id: "a4", name: "Thanh toán thẻ", icon: "💳" },
  { id: "a5", name: "Khu vực hút thuốc", icon: "🚬" },
  { id: "a6", name: "Lối đi xe lăn", icon: "♿" },
];
