import { BookingStatus } from "@/lib/enums";
export type { BookingStatus };

export interface BookingData {
  id: number;
  customerName: string;      
  reservationTime: string;   
  guestCount: number;        
  notes: string;             
  cancelReason?: string | null; 
  status: BookingStatus;
  customerAvatar: string;    
  assignedTableName: string | null; 
}
