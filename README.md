# finalproject-hacktiv-chatbotassistant

Coinfest Asia Networking AI Assistant - Chatbot asisten virtual resmi untuk platform networking Coinfest Asia menggunakan Google Gemini AI.

## 📋 Deskripsi

Project ini adalah chatbot assistant yang dibangun untuk Coinfest Asia Networking, sebuah platform networking untuk festival Web3 terbesar di Asia. Chatbot ini membantu peserta dalam:

- Menemukan koneksi relevan
- Menjelajahi fitur Discover
- Menjadwalkan Meetings
- Memberikan informasi tentang event, speakers, dan tracks

Chatbot ini didukung oleh **Google Gemini AI** (model gemini-2.5-flash-lite) dengan sistem instruksi khusus untuk konteks Coinfest Asia.

## ✨ Fitur Utama

### 1. **Text Generation** (`/generate`)
Generate respons teks berdasarkan input pesan pengguna dengan konteks Coinfest Asia.

### 2. **Image Analysis** (`/generate/text-from-image`)
Analisis gambar dan generate deskripsi atau jawaban berdasarkan gambar yang diupload.

### 3. **Document Analysis** (`/generate/text-from-document`)
Proses dokumen (PDF, dll) dan generate respons berdasarkan konten dokumen.

### 4. **Chat API** (`/api/chat`)
Endpoint chat dengan dukungan conversation history untuk percakapan multi-turn.

### 5. **Welcome Message** (`/api/chat/welcome`)
Endpoint untuk mendapatkan pesan selamat datang dari chatbot.

## 🛠️ Tech Stack

- **Backend**: Node.js dengan Express.js
- **AI Model**: Google Gemini AI (@google/genai)
- **Frontend**: HTML, CSS (TailwindCSS), JavaScript Vanilla
- **File Upload**: Multer
- **CORS**: CORS middleware
- **Environment**: dotenv
- **Development**: Nodemon

## 📦 Instalasi

### Prerequisites

- Node.js (versi 18 atau lebih baru)
- npm atau yarn
- Google Gemini API Key

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd finalproject-hacktiv-chatbotassistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Setup environment variables**
   
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edit file `.env` dan tambahkan API key Anda:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   PORT=3000
   ```

4. **Jalankan aplikasi**
   ```bash
   npm start
   # atau
   yarn start
   ```

   Server akan berjalan di `http://localhost:3000`

## 📡 API Endpoints

### 1. Generate Text
```bash
POST /generate
Content-Type: application/json

{
  "message": "Halo, bagaimana cara menggunakan fitur Discover?"
}
```

**Response:**
```json
{
  "message": "Halo! Untuk menggunakan fitur Discover...",
  "metadata": { ... }
}
```

### 2. Generate Text from Image
```bash
POST /generate/text-from-image
Content-Type: multipart/form-data

Form Data:
- image: [file gambar]
- message: "Jelaskan gambar ini"
```

**Contoh cURL:**
```bash
curl -X POST http://localhost:3000/generate/text-from-image \
  -F "image=@path/to/image.png" \
  -F "message=Jelaskan gambar ini dengan singkat"
```

### 3. Generate Text from Document
```bash
POST /generate/text-from-document
Content-Type: multipart/form-data

Form Data:
- document: [file dokumen]
- message: "Apa isi dokumen ini?"
```

**Contoh cURL:**
```bash
curl -X POST http://localhost:3000/generate/text-from-document \
  -F "document=@path/to/document.pdf" \
  -F "message=Apa judul dari dokumen ini?"
```

### 4. Chat API
```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "text": "Halo" },
    { "role": "model", "text": "Halo! Ada yang bisa saya bantu?" },
    { "role": "user", "text": "Bagaimana cara connect dengan peserta lain?" }
  ]
}
```

**Response:**
```json
{
  "result": "Untuk connect dengan peserta lain..."
}
```

### 5. Welcome Message
```bash
GET /api/chat/welcome
```

**Response:**
```json
{
  "message": "Halo! Saya Coinfest AI, asisten resmi Coinfest Asia Networking..."
}
```

## 🎨 Frontend

Aplikasi ini dilengkapi dengan frontend yang modern menggunakan:

- **TailwindCSS** untuk styling
- **Phosphor Icons** untuk icon
- **Glassmorphism design** untuk tampilan modern
- **Responsive design** untuk mobile dan desktop

### Fitur Frontend:

- Navigation dengan multiple views (Home, Discover, Connections, Meetings, Profile)
- Chat widget floating dengan attachment support (gambar & dokumen)
- Dark theme dengan gradient accents
- Smooth animations dan transitions

Akses frontend di: `http://localhost:3000`

## 🤖 AI Configuration

### Models yang Tersedia:
```javascript
const MODELS = {
  flashLite31: "gemini-3.1-flash-lite-preview",
  flash3: "gemini-3.1-pro-preview",
  flash25: "gemini-2.5-flash-lite", // Default
  gemma3: "gemma-3-27b-it",
};
```

### System Instruction:
Chatbot dikonfigurasi dengan persona khusus:
- **Nama**: Coinfest AI
- **Nada**: Profesional, modern, energik, ramah
- **Bahasa**: Bilingual (Indonesia/Inggris adaptif)
- **Konteks**: Web3/Crypto, Coinfest Asia Networking
- **Batasan**: Hanya menjawab pertanyaan terkait Coinfest Asia dan networking

## 📁 Struktur Folder

```
finalproject-hacktiv-chatbotassistant/
├── public/
│   ├── assets/          # Static assets
│   ├── index.html       # Main HTML file
│   ├── style.css        # Custom styles
│   └── script.js        # Frontend JavaScript
├── uploads/             # Uploaded files storage
├── .env.example         # Environment variables template
├── index.js             # Main server file
├── package.json         # Dependencies
├── README.md            # Documentation
└── docs.md              # Additional documentation
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API Key | Required |
| `PORT` | Server port | 3000 |

## 🧪 Testing

### Test dengan cURL:

```bash
# Test text generation
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "Halo, siapa kamu?"}'

# Test welcome message
curl http://localhost:3000/api/chat/welcome
```

## 📝 License

MIT License - Copyright (c) 2026 Ark Ikky

Lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

## 👥 Author

**Ark Ikky**

## 🙏 Acknowledgments

- Hacktiv8 untuk bootcamp dan panduan
- Google Gemini AI untuk model AI
- Coinfest Asia untuk konteks event
- TailwindCSS dan Phosphor Icons untuk UI components

## 📞 Support

Untuk pertanyaan atau issue, silakan buat issue di repository ini atau hubungi developer.

---

**Happy Coding! 🚀**