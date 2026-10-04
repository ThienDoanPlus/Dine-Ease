"use client";

import React, { useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { toast } from "sonner";
// import { useUploadImage } from "@/hooks/useCustomer"; // Không cần dùng Hook upload ở đây nữa

import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageInsert?: (blobUrl: string, file: File) => void; // Prop mới để báo cho trang cha
}

export function RichTextEditor({ value, onChange, placeholder, onImageInsert }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Nhập nội dung...",
        emptyEditorClass: "is-editor-empty",
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      ImageExtension,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base prose-a:text-amber-600 prose-img:rounded-xl focus:outline-none min-h-[120px] max-w-none text-sm px-4 py-3 bg-transparent",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  // Xử lý Thêm Link
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập đường dẫn URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // ==========================================
  // XỬ LÝ UPLOAD ẢNH TỪ MÁY TÍNH
  // ==========================================
  const triggerImageUpload = () => {
    fileInputRef.current?.click(); // Mở hộp thoại chọn file
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Thay vì upload ngay, chúng ta tạo Blob URL
    const localBlobUrl = URL.createObjectURL(file);
    
    // Chèn ảnh vào editor bằng URL tạm
    editor.chain().focus().setImage({ src: localBlobUrl }).run();

    // Báo ra bên ngoài để trang cha giữ lại File vật lý này
    if (onImageInsert) {
      onImageInsert(localBlobUrl, file);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getButtonClass = (isActive: boolean) =>
    `rounded p-1.5 transition-colors ${isActive ? "text-brand-dark-hover bg-stone-200" : "hover:text-brand-dark-hover text-stone-600 hover:bg-stone-200"}`;

  return (
    <div className="focus-within:border-primary flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-all focus-within:ring-2 focus-within:ring-amber-400">
      
      {/* Input File Ẩn */}
      <input 
        type="file" 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />

      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50/80 px-3 py-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={getButtonClass(editor.isActive("bold"))} type="button" title="In đậm"><Bold className="h-4 w-4" strokeWidth={2.5} /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={getButtonClass(editor.isActive("italic"))} type="button" title="In nghiêng"><Italic className="h-4 w-4" strokeWidth={2.5} /></button>
        
        <div className="mx-1 h-5 w-px bg-stone-300"></div>
        
        <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className={getButtonClass(editor.isActive({ textAlign: "left" }))} type="button" title="Căn trái"><AlignLeft className="h-4 w-4" strokeWidth={2.5} /></button>
        <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className={getButtonClass(editor.isActive({ textAlign: "center" }))} type="button" title="Căn giữa"><AlignCenter className="h-4 w-4" strokeWidth={2.5} /></button>
        
        <div className="mx-1 h-5 w-px bg-stone-300"></div>
        
        <button onClick={setLink} className={getButtonClass(editor.isActive("link"))} type="button" title="Chèn liên kết"><LinkIcon className="h-4 w-4" strokeWidth={2.5} /></button>
        
        {/* NÚT BẤM GỌI UPLOAD ẢNH TẠM */}
        <button onClick={triggerImageUpload} className={getButtonClass(editor.isActive("image"))} type="button" title="Chèn ảnh">
          <ImageIcon className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      <EditorContent editor={editor} className="flex-1 cursor-text" />
      
      <style dangerouslySetInnerHTML={{ __html: `.is-editor-empty:first-child::before { color: #adb5bd; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }` }} />
    </div>
  );
}
