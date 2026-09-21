// ==========================================
// MZAD - Firebase Connection
// Football Multiplayer Auction Game
// ==========================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  set
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

  apiKey: "AIzaSyAPEPcsqW4b_UiE9iv3nmC5EufdkJ7-xK0",

  authDomain:
    "mzad-game-45174.firebaseapp.com",

  databaseURL:
    "https://mzad-game-45174-default-rtdb.firebaseio.com/",

  projectId:
    "mzad-game-45174",

  storageBucket:
    "mzad-game-45174.firebasestorage.app",

  messagingSenderId:
    "111631595997",

  appId:
    "1:111631595997:web:233d623bf2af5fe51ede34"
};


// ==========================================
// START FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);


// ==========================================
// GAME DATA
// ==========================================

const MZAD = {

  player: {

    uid: null,

    name: "Player",

    budget: 200000000,

    squad: []

  },

  opponent: {

    uid: null,

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
// HELPERS
// ==========================================

function money(value) {

  return new Intl.NumberFormat("en-US")
    .format(value);

}


function getRoot() {

  return document.getElementById("root");

}


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(title, message) {

  getRoot().innerHTML = `

    <main style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:#07111f;
      color:white;
      font-family:Arial, sans-serif;
      direction:rtl;
    ">

      <section style="
        width:100%;
        max-width:500px;
        padding:30px;
        text-align:center;
        background:#101d2e;
        border-radius:22px;
        border:1px solid rgba(255,255,255,.08);
      ">

        <div style="
          font-size:55px;
          margin-bottom:15px;
        ">
          ⚽
        </div>

        <h1>
          ${title}
        </h1>

        <p style="
          opacity:.7;
          line-height:1.8;
        ">
          ${message}
        </p>

      </section>

    </main>

  `;

}


// ==========================================
// HOME SCREEN
// ==========================================

function showHome() {

  getRoot().innerHTML = `

    <main style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      color:white;
      background:
        radial-gradient(
          circle at top,
          #12365c 0%,
          #07111f 55%
        );
      direction:rtl;
      font-family:Arial, sans-serif;
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
          margin-bottom:5px;
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
          ">
            الميزانية
          </div>

          <div style="
            font-size:30px;
            font-weight:800;
            margin-top:8px;
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
          id="startButton"
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


        <div style="
          margin-top:18px;
          font-size:11px;
          opacity:.35;
          direction:ltr;
          word-break:break-all;
        ">
          UID:
          ${MZAD.player.uid || "connecting..."}
        </div>

      </section>

    </main>

  `;


  document
    .getElementById("startButton")
    .addEventListener(
      "click",
      startMatchmaking
    );

}


// ==========================================
// MATCHMAKING
// ==========================================

function startMatchmaking() {

  getRoot().innerHTML = `

    <main style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:#07111f;
      color:white;
      direction:rtl;
      font-family:Arial,sans-serif;
      text-align:center;
    ">

      <section>

        <div style="
          font-size:65px;
          margin-bottom:20px;
        ">
          ⚽
        </div>

        <h1>
          بندور على لاعب...
        </h1>

        <p style="
          opacity:.6;
        ">
          جاري البحث عن خصم حقيقي أونلاين
        </p>

        <div style="
          margin:30px auto;
          width:55px;
          height:55px;
          border:5px solid rgba(255,255,255,.12);
          border-top-color:#19d36b;
          border-radius:50%;
          animation:mzadSpin 1s linear infinite;
        ">
        </div>

      </section>

    </main>


    <style>

      @keyframes mzadSpin {

        from {
          transform:rotate(0deg);
        }

        to {
          transform:rotate(360deg);
        }

      }

    </style>

  `;

}


// ==========================================
// FIREBASE AUTH
// ==========================================

async function startFirebase() {

  try {

    await signInAnonymously(auth);

  }

  catch (error) {

    console.error(
      "Firebase Auth Error:",
      error
    );

    showMessage(
      "حصل خطأ",
      "مش قادرين نسجل دخول اللاعب في Firebase. تأكد إن Anonymous Authentication مفعّل."
    );

  }

}


// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      return;

    }


    console.log(
      "Firebase user connected:",
      user.uid
    );


    MZAD.player.uid =
      user.uid;


    try {

      const playerRef =
        ref(
          database,
          "players/" + user.uid
        );


      await set(
        playerRef,
        {

          uid: user.uid,

          name: "Player",

          budget: 200000000,

          squad: [],

          connectedAt:
            Date.now()

        }
      );


      console.log(
        "Realtime Database connection: OK"
      );


      showHome();

    }

    catch (error) {

      console.error(
        "Realtime Database Error:",
        error
      );


      showMessage(
        "مشكلة في قاعدة البيانات",
        "Firebase اتصل، لكن حصلت مشكلة أثناء الكتابة في Realtime Database. افتح Console وشوف الخطأ."
      );

    }

  }
);


// ==========================================
// START GAME
// ==========================================

console.log(
  "MZAD starting..."
);


startFirebase();
