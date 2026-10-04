import React, { useState, useEffect, useRef } from "react";
import { X, UploadCloud, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ActionFooter } from "@/components/shared/ui/ActionFooter";

// 1. ĐÃ FIX: Đổi id của Category thành number cho khớp với DB
interface Category { id: number; name: string; }

interface DishFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialData?: any;
  onSave: (dishData: any, files: File[]) => void;
}

export function DishFormModal({ isOpen, onClose, categories, initialData, onSave }: DishFormModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  // 2. ĐÃ FIX: Đổi tên state từ catId thành categoryId
  const [categoryId, setCategoryId] = useState(""); 
  const [desc, setDesc] = useState("");
  
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "");
        setPrice(initialData.price?.toString() || "");
        // ĐÃ FIX: Map đúng tên biến categoryId và ép về string để bỏ vào thẻ <select>
        setCategoryId(initialData.categoryId?.toString() || categories[0]?.id?.toString() || "");
        setDesc(initialData.description || initialData.desc || "");
        setPreviewImages(initialData.imageUrls || []);
        setImageFiles([]); 
      } else {
        setName(""); 
        setPrice(""); 
        setCategoryId(categories[0]?.id?.toString() || ""); 
        setDesc("");
        setPreviewImages([]); 
        setImageFiles([]);
      }
    }
  }, [isOpen, initialData, categories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (previewImages.length + filesArray.length > 5) {
        return toast.error("Tối đa chỉ được tải lên 5 ảnh!");
      }
      setImageFiles(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name || !price || !categoryId) {
      return toast.error("Vui lòng điền đủ Tên món, Giá và Danh mục!");
    }
    
    // ==========================================================
    // [VÁ LỖ HỔNG XÓA ẢNH]: LỌC LẤY NHỮNG ẢNH CŨ CẦN GIỮ LẠI
    // (Bỏ qua các ảnh mới dạng blob: do file upload sinh ra)
    // ==========================================================
    const retainedImageUrls = previewImages.filter(url => !url.startsWith("blob:"));

    // 3. ĐÃ FIX PAYLOAD: Gửi đúng key 'categoryId' và Ép kiểu Number()
    onSave(
      { 
        id: initialData?.id || Date.now(), 
        name: name, 
        price: Number(price), 
        categoryId: Number(categoryId), // ÉP KIỂU SANG SỐ ĐỂ BACKEND KHÔNG CRASH
        description: desc, 
        active: initialData ? initialData.active : true,
        retainedImageUrls: retainedImageUrls // <--- TRUYỀN MẢNG NÀY LÊN BACKEND
      },
      imageFiles
    );
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden rounded-3xl border-stone-100 bg-white p-0 sm:max-w-xl" showCloseButton={false}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-50 bg-white px-8 py-5">
          <DialogTitle className="text-brand-dark text-xl font-bold">{initialData ? "Chỉnh sửa món ăn" : "Thêm món ăn mới"}</DialogTitle>
          <button onClick={onClose} className="rounded-full p-1.5 text-stone-400 transition-colors hover:bg-stone-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="custom-scrollbar max-h-[70vh] space-y-6 overflow-y-auto p-8">
          {/* MULTI UPLOAD UI */}
          <div className="space-y-2">
             <label className="ml-1 text-xs font-bold tracking-widest text-stone-500 uppercase">Hình ảnh món ăn (Tối đa 5 ảnh)</label>
             <div className="grid grid-cols-3 gap-3">
                {previewImages.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl border border-stone-200 overflow-hidden group">
                    <img src={src} className="w-full h-full object-cover" alt="preview" />
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
                {previewImages.length < 5 && (
                  <div onClick={() => fileInputRef.current?.click()} className="aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50 cursor-pointer hover:border-amber-400 hover:bg-amber-50">
                    <UploadCloud className="h-6 w-6 text-stone-400 mb-1" />
                    <span className="text-xs font-bold text-stone-400">Thêm ảnh</span>
                  </div>
                )}
             </div>
             <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="ml-1 text-xs font-bold tracking-widest text-stone-500 uppercase">Tên món</label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="ml-1 text-xs font-bold tracking-widest text-stone-500 uppercase">Giá bán (VNĐ)</label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="text-primary-hover font-black" />
              </div>
              <div className="space-y-1.5">
                <label className="ml-1 text-xs font-bold tracking-widest text-stone-500 uppercase">Danh mục</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-5 py-3 font-bold text-stone-700 outline-none focus:ring-2 focus:ring-amber-400">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="ml-1 text-xs font-bold tracking-widest text-stone-500 uppercase">Mô tả</label>
              <textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-5 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
        </div>

        <ActionFooter onCancel={onClose} onConfirm={handleSave} cancelText="Hủy" confirmText="Lưu món ăn" className="bg-stone-50/80 px-8 py-5 mt-auto" />
      </DialogContent>
    </Dialog>
  );
}
