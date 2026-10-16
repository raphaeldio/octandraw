/* ==========================================================
   CONFIG — ubah semua isi website dari sini.
   Ganti URL foto dengan file kamu sendiri, misal "assets/photos/1.jpg"
   ========================================================== */
const P = (file) => `assets/photos/${file}`;

window.CONFIG = {
  recipient: "Andraw",
  sender: "Octav",
  anniversary: "Hi, apa kabar?", // kalimat pembuka surat
  albumTitle: "Our Story",
  albumSubtitle: "2024 — Forever",

  // 3 foto bingkai scallop (section "Inside")
  framePhotos: [P("IMG-20251218-WA0010.jpg"), P("IMG-20260214-WA0008.jpg"), P("IMG-20260116-WA0013.jpg")],

  // Lagu favorit. Isi `src` dengan file mp3 kamu (misal "assets/song.mp3").
  // Kalau kosong, website memainkan melodi music-box yang dibuat langsung oleh Web Audio.
  song: {
    src: "assets/song.mp3",
    title: "Keep Me",
    artist: "Novo Amor",
    cover: P("IMG-20250817-WA0029.jpg"),
  },

  story: {
    photo: P("IMG-20250315-WA0084.jpg"),
    paragraphs: [
      "Waktu itu, semuanya berjalan begitu tenang, hingga beberapa kali aku menyadari sepasang mata yang diam-diam kerap tertuju ke arahku. Tatapan yang sederhana, tetapi cukup untuk menumbuhkan tanya di benakku. Sampai akhirnya, pada suatu hari, ia datang mendekat, membuka percakapan, dan perlahan menjadi seseorang yang kehadirannya mulai kunanti.",
      "Entah sejak kapan, ada sesuatu dalam diriku yang berubah. Tanpa kusadari, rasa itu tumbuh di antara percakapan-percakapan sederhana, hingga akhirnya aku memilih untuk membalas perasaan yang ia bawa.",
      "Andraw, kala itu, begitu manis. Ia memberiku begitu banyak hal, bukan hanya melalui kata-kata, tetapi juga lewat perhatian-perhatian kecil yang membuatku merasa istimewa. Ia hadir dengan segala kehangatannya, membuatku percaya bahwa kali ini, aku telah menemukan seseorang yang bukan sekadar singgah, melainkan seseorang yang benar-benar ingin tinggal.",
    ],
  },

  // Foto-foto perjalanan di dalam album 3D + grid "Our Special Moment"
  moments: [
    { src: P("IMG-20250316-WA0006.jpg"), caption: "Lilin & doa", date: "16.03.2025" },
    { src: P("IMG-20250621-WA0101.jpg"), caption: "Hari kemenangan", date: "21.06.2025" },
    { src: P("IMG-20251212-WA0036.jpg"), caption: "Hadiah kecil", date: "12.12.2025" },
    { src: P("IMG-20260124-WA0230.jpg"), caption: "Seragam yang sama", date: "24.01.2026" },
    { src: P("IMG-20260201-WA0007.jpg"), caption: "Salam dari kita", date: "01.02.2026" },
    { src: P("IMG-20260207-WA0024.jpg"), caption: "Pramuka", date: "07.02.2026" },
    { src: P("IMG-20260207-WA0025.jpg"), caption: "Senyum yang sama", date: "07.02.2026" },
    { src: P("IMG_20260207_144301_592.jpg"), caption: "Piknik & gitar", date: "07.02.2026" },
    { src: P("IMG_20260207_144301_635.jpg"), caption: "Bayangan di dinding", date: "07.02.2026" },
    { src: P("IMG_20260207_144301_705.jpg"), caption: "Petak umpet", date: "07.02.2026" },
    { src: P("IMG_20260207_144301_782.jpg"), caption: "Buku & bola basket", date: "07.02.2026" },
    { src: P("IMG-20260215-WA0100.jpg"), caption: "Di luar sekolah", date: "15.02.2026" },
    { src: P("webcam-toy-photo72.jpg"), caption: "Photobox", date: "" },
    { src: P("webcam-toy-photo79.jpg"), caption: "Warna-warni", date: "" },
    { src: P("webcam-toy-photo98.jpg"), caption: "Empat ekspresi", date: "" },
  ],

  letter: [
    "Pasti terkejut, ya, lihat aku menulis surat seperti ini. Mungkin kamu bertanya-tanya kenapa aku masih ingin menyampaikan sesuatu, setelah sekian banyak hal yang terjadi di antara kita. Tapi, kali ini, tolong baca sampai selesai, ya. Baca dengan hati yang sedikit lebih lapang, seolah-olah kamu sedang mendengarkan seseorang yang sudah terlalu lama menyimpan kata-kata di dalam diamnya.",
    "Andraw, tahu nggak, apa yang paling menyakitkan dari beberapa bulan ini? Bukan cuma kenyataan bahwa kita sudah berpisah, tetapi menyadari bahwa kamu perlahan menjadi seseorang yang nyaris tidak kukenal. Perubahan mu besar sekali, dan aku gabisa bilang apa-apa.",
    "Jujur, aku rindu. Rindu setengah mati. Tapi, bukan Andraw yang sekarang yang kurindukan. Aku rindu Andraw yang dahulu menatapku dengan mata berbinar, mencintaiku dengan hangat, dan membuatku merasa berarti. Aku rindu seseorang yang kini berdiri begitu dekat, tetapi terasa begitu jauh.",
    "Terkadang aku bertanya, apa kamu masih ingat perempuan yang dahulu kamu suka? Yang kamu sayang sesabar itu?",
    "Tiga bulan ini, kamu memilih menjauh, dan aku belajar untuk diam. Bukan karena rasa sayangku sudah hilang, melainkan karena aku lelah berharap pada sesuatu yang tak lagi sama. Bohong kalau aku bilang aku sudah tidak sayang. Tapi, sungguh, aku tidak marah. Aku hanya merindukan seseorang yang mungkin sudah tidak ada lagi.",
    "Andraw, semoga Tuhan melancarkan perjalananmu mengejar cita-cita. Semoga setiap lelahmu berbuah indah dan langkahmu selalu dijaga-Nya. Walaupun kini tidak ada aku di sisimu, namamu masih kusebut dalam doa-doa malamku.",
    "Jika semesta mempertemukan kita kembali di hari yang lebih baik, semoga kita bisa tersenyum tanpa dendam. Namun, jika tidak, biarlah kita menjadi dua orang yang pernah berarti, lalu belajar berjalan ke arah masing-masing.",
    "Di usiaku yang ketujuh belas ini, aku berharap bisa benar-benar lupain andraw.",
    "Terima kasih pernah menjadi bagian dari hidupku, Andraw. Aku tidak menyesal pernah mengenalmu.",
    "Jaga dirimu baik-baik, ya. Hati-hati dalam setiap langkahmu. Dan kalau boleh meminta satu hal kecil, sesekali lihatlah ke arahku. Bukan agar kamu kembali, tetapi agar aku tidak merasa seperti seseorang yang tak pernah ada.",
    "Berbahagialah, Andraw. Jadi laki-laki yang lebih baik ya. Kejar cita-citamu, dan biarlah Tuhan menyertaimu, bahkan ketika namaku tak lagi ada dalam cerita yang kamu tulis.",
    "i love you, as always.",
  ],
};
