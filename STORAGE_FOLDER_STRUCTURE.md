# Cấu trúc thư mục Storage với Slug Organization

## 🗂️ **Cấu trúc thư mục mới**

### **Trước đây:**
```
storage/
├── audio/
│   ├── 1234567890-chapter-1.mp3
│   └── 1234567891-chapter-2.mp3
├── images/
│   ├── 1234567892-cover.jpg
│   └── 1234567893-thumbnail.png
└── pdfs/
    ├── 1234567894-book.pdf
    └── 1234567895-guide.pdf
```

### **Bây giờ (với slug organization):**
```
storage/
├── audio/
│   ├── niem-phat-phap/
│   │   ├── 1234567890-chapter-1.mp3
│   │   └── 1234567891-chapter-2.mp3
│   └── kinh-dien-phat-giao/
│       ├── 1234567892-chapter-1.mp3
│       └── 1234567893-chapter-2.mp3
├── images/
│   ├── niem-phat-phap/
│   │   ├── 1234567894-cover.jpg
│   │   └── 1234567895-thumbnail.png
│   └── kinh-dien-phat-giao/
│       ├── 1234567896-cover.jpg
│       └── 1234567897-thumbnail.png
└── pdfs/
    ├── niem-phat-phap/
    │   └── 1234567898-book.pdf
    └── kinh-dien-phat-giao/
        └── 1234567899-guide.pdf
```

## 🔧 **Cách hoạt động**

### **1. API Endpoint Logic**
```typescript
// Cấu trúc file path: folder/slug/filename
let filePath = fileName;
if (folder && slug) {
  filePath = `${folder}/${slug}/${fileName}`;
} else if (folder) {
  filePath = `${folder}/${fileName}`;
} else if (slug) {
  filePath = `${slug}/${fileName}`;
}
```

### **2. Component Usage**
```typescript
// AudioUploaderR2 với slug
<AudioUploaderR2
  slug="niem-phat-phap"
  onUploadSuccess={handleUpload}
/>

// Kết quả: audio/niem-phat-phap/1234567890-chapter-1.mp3
```

### **3. URL Examples**
```
# Audio files
https://cdn.niemadidaphat.com/audio/niem-phat-phap/1234567890-chapter-1.mp3
https://cdn.niemadidaphat.com/audio/kinh-dien-phat-giao/1234567891-chapter-1.mp3

# Image files  
https://cdn.niemadidaphat.com/images/niem-phat-phap/1234567892-cover.jpg
https://cdn.niemadidaphat.com/images/kinh-dien-phat-giao/1234567893-cover.jpg

# PDF files
https://cdn.niemadidaphat.com/pdfs/niem-phat-phap/1234567894-book.pdf
https://cdn.niemadidaphat.com/pdfs/kinh-dien-phat-giao/1234567895-guide.pdf
```

## 📋 **Components đã được cập nhật**

### **1. R2Uploader**
- ✅ Thêm prop `slug?: string`
- ✅ Truyền slug trong FormData
- ✅ Hỗ trợ cấu trúc thư mục linh hoạt

### **2. Specialized Uploaders**
- ✅ `AudioUploaderR2` - hỗ trợ slug
- ✅ `ImageUploaderR2` - hỗ trợ slug  
- ✅ `PDFUploaderR2` - hỗ trợ slug

### **3. ChapterManager**
- ✅ Truyền `productSlug` cho AudioUploaderR2
- ✅ Tổ chức audio files theo product

### **4. Admin Page**
- ✅ Sử dụng R2 uploaders với slug
- ✅ Tự động generate slug từ title

## 🎯 **Lợi ích**

### **1. Tổ chức tốt hơn**
- Files được nhóm theo sản phẩm
- Dễ dàng quản lý và tìm kiếm
- Cấu trúc thư mục rõ ràng

### **2. Tránh conflict**
- Mỗi sản phẩm có thư mục riêng
- Không bị trùng tên file
- Dễ dàng backup/restore

### **3. SEO Friendly**
- URLs có cấu trúc logic
- Dễ dàng cache và CDN
- Tối ưu cho search engines

### **4. Scalability**
- Dễ dàng mở rộng
- Hỗ trợ nhiều sản phẩm
- Quản lý storage hiệu quả

## 🔄 **Migration**

### **Files cũ:**
- Vẫn hoạt động bình thường
- Không cần migrate ngay lập tức
- Có thể migrate dần dần

### **Files mới:**
- Tự động sử dụng cấu trúc mới
- Slug-based organization
- Tối ưu cho tương lai

## 🛠️ **Usage Examples**

### **1. Upload Audio cho Product**
```typescript
<AudioUploaderR2
  slug="niem-phat-phap"
  onUploadSuccess={(url, filePath) => {
    console.log('Uploaded to:', url);
    console.log('File path:', filePath);
    // filePath: audio/niem-phat-phap/1234567890-chapter-1.mp3
  }}
/>
```

### **2. Upload Cover Image**
```typescript
<ImageUploaderR2
  slug="kinh-dien-phat-giao"
  onUploadSuccess={(url, filePath) => {
    // filePath: images/kinh-dien-phat-giao/1234567891-cover.jpg
  }}
/>
```

### **3. Upload PDF**
```typescript
<PDFUploaderR2
  slug="phat-phap-nhiem-mau"
  onUploadSuccess={(url, filePath) => {
    // filePath: pdfs/phat-phap-nhiem-mau/1234567892-book.pdf
  }}
/>
```

## 📊 **File Path Patterns**

| Component | Folder | Slug | Result |
|-----------|--------|------|--------|
| AudioUploaderR2 | `audio` | `niem-phat-phap` | `audio/niem-phat-phap/filename.mp3` |
| ImageUploaderR2 | `images` | `kinh-dien-phat-giao` | `images/kinh-dien-phat-giao/filename.jpg` |
| PDFUploaderR2 | `pdfs` | `phat-phap-nhiem-mau` | `pdfs/phat-phap-nhiem-mau/filename.pdf` |
| R2Uploader | `custom` | `my-product` | `custom/my-product/filename.ext` |

## 🚀 **Next Steps**

1. **Test upload** với slug organization
2. **Verify file paths** trong storage
3. **Update existing components** để sử dụng slug
4. **Monitor storage usage** và performance
5. **Consider migration** cho files cũ (optional)
