// ==========================================
// MZAD - Football Auction Game
// app.js
// ==========================================

const MZAD = {
  player: {
    name: "Player",
    budget: 200000000,
    squad: []
  },

  opponent: {
    name: "Searching...",
    budget: 200000000,
    squad: []
  },

  selectedFormation: null,

  formations: [
    "4-3-3",
    "4-4-2",
    "4-2-3-1",
    "4-3-1-2",
    "3-5-2",
    "3-4-3",
    "5-3-2",
    "5-2-3",
    "4-1-4-1",
    "4-4-1-1"
  ]
};


// ==========================================
// Helpers
// ==========================================

function money(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getRoot() {
  return document.getElementById("root");
}

function clearScreen() {
  getRoot().innerHTML = "";
}


// ==========================================
// HOME SCREEN
// ==========================================

function showHome() {
  clearScreen();

  getRoot().innerHTML = `
    <main style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
      color:white;
      background:
        radial-gradient(circle at top, #12365c 0%, #07111f 55%);
    ">

      <section style="
        width:100%;
        max-width:500px;
        text-align:center;
      ">

        <div style="
          font-size:64px;
          font-weight:900;
          letter-spacing:3px;
          margin-bottom:8px;
        ">
          MZAD
        </div>

        <div style="
          font-size:22px;
          opacity:.8;
          margin-bottom:35px;
        ">
          مزاد كرة القدم
        </div>

        <div style="
          background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.1);
          border-radius:20px;
          padding:24px;
          margin-bottom:20px;
        ">

          <div style="
            font-size:14px;
            opacity:.7;
            margin-bottom:8px;
          ">
            الميزانية
          </div>

          <div style="
            font-size:30px;
            font-weight:800;
          ">
            ${money(MZAD.player.budget)}
          </div>

          <div style="
            font-size:13px;
            opacity:.5;
            margin-top:5px;
          ">
            فلوس افتراضية
          </div>

        </div>

        <button
          onclick="startMatchmaking()"
          style="
            width:100%;
            padding:18px;
            border:0;
            border-radius:14px;
            background:#19d36b;
            color:#04110a;
            font-size:20px;
            font-weight:900;
            cursor:pointer;
          "
        >
          🎮 ابدأ مباراة
        </button>

      </section>

    </main>
  `;
}


// ==========================================
// MATCHMAKING
// ==========================================

function startMatchmaking() {
  clearScreen();

  getRoot().innerHTML = `
    <main style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      color:white;
      background:#07111f;
      text-align:center;
      padding:24px;
    ">

      <section>

        <div style="
          font-size:60px;
          margin-bottom:20px;
        ">
          ⚽
        </div>

        <h1>
          بندور على لاعب...
        </h1>

        <p style="opacity:.6;">
          جاري البحث عن خصم حقيقي أونلاين
        </p>

        <div style="
          margin:30px auto;
          width:50px;
          height:50px;
          border:5px solid rgba(255,255,255,.15);
          border-top-color:#19d36b;
          border-radius:50%;
          animation:spin 1s linear infinite;
        "></div>

      </section>

    </main>

    <style>
      @keyframes spin {
        from { transform:rotate(0deg); }
        to { transform:rotate(360deg); }
      }
    </style>
  `;

  /*
    مهم:
    ده مؤقت في المرحلة الأولى.

    بعد ربط Firebase:
    startMatchmaking()
    هتبحث فعليًا عن لاعب حقيقي
    بدل الانتظار الوهمي.
  */

  setTimeout(showFormationSelection, 1800);
}


// ==========================================
// FORMATION SELECTION
// ==========================================

function showFormationSelection() {
  clearScreen();

  const formationButtons = MZAD.formations
    .map(
      formation => `
        <button
          onclick="selectFormation('${formation}')"
          style="
            padding:18px 10px;
            border:1px solid rgba(255,255,255,.1);
            border-radius:14px;
            background:#101d2e;
            color:white;
            font-size:17px;
            font-weight:700;
            cursor:pointer;
          "
        >
          ${formation}
        </button>
      `
    )
    .join("");

  getRoot().innerHTML = `
    <main style="
      min-height:100vh;
      background:#07111f;
      color:white;
      padding:30px 18px;
    ">

      <section style="
        max-width:600px;
        margin:auto;
      ">

        <h1 style="
          text-align:center;
          margin-bottom:8px;
        ">
          اختر تشكيلتك
        </h1>

        <p style="
          text-align:center;
          opacity:.6;
          margin-bottom:30px;
        ">
          اختار التشكيلة اللي هتلعب بيها
        </p>

        <div style="
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:12px;
        ">
          ${formationButtons}
        </div>

      </section>

    </main>
  `;
}


// ==========================================
// SELECT FORMATION
// ==========================================

function selectFormation(formation) {

  MZAD.selectedFormation = formation;

  console.log(
    "Selected formation:",
    formation
  );

  startAuctionPreview();
}


// ==========================================
// AUCTION PREVIEW
// ==========================================

function startAuctionPreview() {
  clearScreen();

  getRoot().innerHTML = `
    <main style="
      min-height:100vh;
      background:#07111f;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      text-align:center;
    ">

      <section style="
        width:100%;
        max-width:500px;
      ">

        <div style="
          font-size:18px;
          opacity:.6;
        ">
          تشكيلتك
        </div>

        <div style="
          font-size:40px;
          font-weight:900;
          margin:10px 0 35px;
        ">
          ${MZAD.selectedFormation}
        </div>

        <div style="
          background:#101d2e;
          border-radius:20px;
          padding:25px;
        ">

          <div style="
            font-size:14px;
            opacity:.6;
          ">
            المزاد
          </div>

          <div style="
            font-size:50px;
            margin:15px 0;
          ">
            🔨
          </div>

          <div style="
            font-size:20px;
            font-weight:800;
          ">
            تجهيز المزاد...
          </div>

          <div style="
            font-size:13px;
            opacity:.5;
            margin-top:10px;
          ">
            سيتم ربط المزاد الحقيقي بالسيرفر في الخطوة القادمة
          </div>

        </div>

      </section>

    </main>
  `;

  /*
    في المرحلة القادمة:
    Firebase + Multiplayer + Auction Server
    هيحلوا مكان الشاشة دي.
  */
}


// ==========================================
// START GAME
// ==========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    console.log("MZAD loaded");

    showHome();

  }
);
