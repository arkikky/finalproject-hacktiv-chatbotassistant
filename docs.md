/Users/icn/Documents/Projects/glowing-waffle/public/assets/hacktiv8.png

curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{"message": "halo saya Dicky, bagaimana hari ini ?"}'


curl -X POST http://localhost:3000/generate/text-from-image \
  -F "image=@/Users/icn/Documents/Projects/glowing-waffle/public/assets/hacktiv8.png" \
  -F "message=jelaskan gambar ini dengan singkat?"

  curl -X POST http://localhost:3000/generate/text-from-document \
  -F "image=@/Users/icn/Documents/Projects/glowing-waffle/public/assets/guide.pdf" \
  -F "message=Apa judul dari dokumen ini?"

  curl -X POST http://localhost:3000/generate/text-from-document \
  -F "document=@/Users/icn/Documents/Projects/glowing-waffle/public/assets/guide.pdf" \
  -F "message=Apa judul dari dokumen ini?"
