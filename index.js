import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

// @inisialisasi GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const MODELS = {
  flashLite31: "gemini-3.1-flash-lite-preview",
  flash3: "gemini-3.1-pro-preview",
  flash25: "gemini-2.5-flash-lite",
  gemma3: "gemma-3-27b-it",
};
const CHAT_WELCOME_MESSAGE = [
  "Halo! Saya Coinfest AI, asisten resmi Coinfest Asia Networking.",
  "Saya bisa bantu menemukan koneksi relevan, menjelajahi Discover, dan menjadwalkan Meetings.",
  "Ada yang bisa saya bantu hari ini?",
].join(" ");

const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHAT_SYSTEM_INSTRUCTION = [
  "System Prompt: Coinfest Asia Networking Assistant.",
  "Peran: Kamu adalah Coinfest AI, asisten virtual resmi platform Coinfest Asia Networking.",
  "Tugas: Bantu peserta memaksimalkan networking, menemukan koneksi relevan, dan memandu fitur website.",
  "Nada: Profesional, modern, energik, ramah, dan relevan dengan kultur Web3/Crypto.",
  "Gaya: Singkat dan padat, maksimal 2-3 paragraf pendek dalam chatbox kecil.",
  "Bahasa: Bilingual adaptif, gunakan Bahasa Indonesia atau Inggris sesuai bahasa pengguna.",
  "Pengetahuan: Coinfest Asia adalah festival Web3 immersif terbesar di Asia.",
  "Tracks: Builders (Founder, developer, infra partner, investor).",
  "Tracks: Traders (Market maker, exchange, penyedia tools, komunitas alpha).",
  "Tracks: Institutions (Partner strategis, kustodian, regulator, enterprise adopter).",
  "Featured speakers: Yat Siu (Animoca Brands), Arthur Hayes (Maelstrom), Rene Reinsberg (Celo), Sandeep Nailwal (Polygon).",
  "Fitur: Profile (data diri, track, tags), Discover (filter nama/track/negara), Connections (permintaan koneksi), Meetings (jadwal & pesan).",
  "Batasan: Tolak sopan pertanyaan di luar konteks Coinfest Asia, networking, Web3/Crypto, pembicara, atau bantuan teknis platform.",
  "Navigasi: Selalu arahkan pengguna ke fitur yang tepat.",
  "Status data: Platform MVP, data disimpan aman secara lokal di browser (localStorage).",
  "Jika detail event tidak diketahui, arahkan cek halaman Agenda atau FAQ di website utama.",
].join(" ");

// @create-upload-folders
const UPLOADS_DIR = path.join(__dirname, "uploads");
await fs.mkdir(UPLOADS_DIR, { recursive: true });

// @configuration-multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// @inisialisasi Express dan Multer, CORS
const app = express();
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// @set(mime-type)
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeMap = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".aac": "audio/aac",
    ".flac": "audio/flac",
    ".ogg": "audio/ogg",
    ".webm": "audio/webm",
    ".m4a": "audio/mp4",
  };
  return mimeMap[ext] || "application/octet-stream";
};

// @read-uploaded-file-as-base64
async function readUploadedFileAsBase64(file) {
  if (!file) {
    throw new Error("File upload tidak ditemukan.");
  }

  if (Buffer.isBuffer(file.buffer)) {
    return file.buffer.toString("base64");
  }

  if (typeof file.path === "string" && file.path.length > 0) {
    const fileBuffer = await fs.readFile(file.path);
    return fileBuffer.toString("base64");
  }

  throw new Error("Konten file upload tidak tersedia.");
}

// @get-conversation-from-body
function getConversationFromBody(body) {
  const { messages, conversation } = body ?? {};
  const userConversation = Array.isArray(conversation)
    ? conversation
    : messages;

  if (!Array.isArray(userConversation)) {
    throw new Error("conversation/messages must be an array");
  }

  return userConversation;
}

// @validate-conversation
function validateConversation(conversation) {
  for (const item of conversation) {
    const { role, text } = item ?? {};

    // satpam 3a -- cek role sama text, sama-sama string atau nggak
    if (typeof role !== "string" || typeof text !== "string") {
      return "Tolong sertakan percakapan yang proper!";
    }

    // satpam 3b -- cek role-nya, isinya itu 'user' atau 'model', atau nggak
    if (!["user", "model"].includes(role)) {
      return "Tolong sertakan percakapan yang proper!";
    }
  }

  return null;
}

// @to-gemini-contents
function toGeminiContents(conversation) {
  return conversation.map(({ role, text }) => ({
    role,
    parts: [{ text }],
  }));
}

// @generate-text
app.post("/generate", async (request, response) => {
  const body = request.body;
  if (!body.message) {
    return response.status(400).json("belum ada pesan!");
  }
  if (typeof body.message !== "string") {
    return response.status(400).json("pesannya harus teks ya!");
  }
  try {
    const aiResponse = await ai.models.generateContent({
      model: MODELS.flash25,
      contents: body.message,
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
    });

    return response.status(200).json({
      message: aiResponse.text,
      metadata: aiResponse.usageMetadata,
    });
  } catch (error) {
    console.log(error.status);
    if (error.status === 429) {
      return response.status(500).json("Maaf, admin sedang mendengkur.");
    }

    return response.status(500).json(error.message);
  }
});

// @generate-text-from-image
app.post(
  "/generate/text-from-image",
  upload.single("image"),
  async (request, response) => {
    const body = request.body;
    if (!body.message || !request.file) {
      return response.status(400).json("File dan pesan harus lengkap!");
    }
    if (typeof body.message !== "string") {
      return response.status(400).json("pesannya harus teks ya!");
    }

    const text = body.message;
    const file = request.file;
    const fileType = file.mimetype;
    if (typeof fileType !== "string" || !fileType.startsWith("image/")) {
      return response.status(400).json("File harus berupa gambar.");
    }

    try {
      const base64Image = await readUploadedFileAsBase64(file);
      const aiResponse = await ai.models.generateContent({
        model: MODELS.flash25,
        contents: [
          { text, type: "text" },
          { inlineData: { data: base64Image, mimeType: fileType } },
        ],
        config: {
          temperature: 1,
          systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        },
      });

      return response.status(200).json({
        message: aiResponse.text,
        metadata: aiResponse.usageMetadata,
      });
    } catch (error) {
      console.log(error);

      return response.status(500).json(error.message);
    }
  },
);

// @generate-text-from-document
app.post(
  "/generate/text-from-document",
  upload.single("document"),
  async (request, response) => {
    if (!request.file) {
      return response.status(400).json("File dan pesan harus lengkap!");
    }
    const body = request.body;

    // guard clause 2 -- satpam tipe data
    if (body.message && typeof body.message !== "string") {
      return response.status(400).json("pesannya harus teks ya!");
    }

    const text =
      body.message || "Tolong terjemahkan bahasa ini ke bahasa Mandarin";
    const file = request.file;
    const fileType = file.mimetype;

    try {
      const base64Document = await readUploadedFileAsBase64(file);
      const aiResponse = await ai.models.generateContent({
        model: MODELS.flash25,
        contents: [
          { text, type: "text" },
          { inlineData: { data: base64Document, mimeType: fileType } },
        ],
        config: {
          temperature: 1,
          systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        },
      });

      return response.status(200).json({
        message: aiResponse.text,
        metadata: aiResponse.usageMetadata,
      });
    } catch (error) {
      console.log(error);

      return response.status(500).json(error.message);
    }
  },
);

// @chat
app.post("/api/chat", async (req, res) => {
  try {
    const userConversation = getConversationFromBody(req.body);
    const validationError = validateConversation(userConversation);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    const contents = toGeminiContents(userConversation);

    const response = await ai.models.generateContent({
      model: MODELS.flash25,
      contents,
      config: {
        temperature: 1,
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
    });

    res.status(200).json({ result: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// @chat-welcome
app.get("/api/chat/welcome", (req, res) => {
  res.status(200).json({ message: CHAT_WELCOME_MESSAGE });
});

app.listen(PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
});

// async function main() {
//   const response = await ai.models.generateContent({
//     model: MODELS.flash3,
//     contents: "Explain how AI works in a few words",
//     config: {
//       systemInstruction: ""
//     }
//   });
//   const anotherResponse = await ai.models.generateContent({
//     model: MODELS.flashLite31,
//     contents: response.text,
//   });
//   console.log(anotherResponse.text);
// }

// await main();
