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
  set,
  get,
  remove,
  onValue,
  onDisconnect
} from
  "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


// ==========================================
// FIREBASE
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyAPEPcsqW4b_UiE9iv3nmC5EufdkJ7-xK0",
  authDomain: "mzad-game-45174.firebaseapp.com",
  databaseURL:
    "https://mzad-game-45174-default-rtdb.firebaseio.com/",
  projectId: "mzad-game-45174",
  storageBucket:
    "mzad-game-45174.firebasestorage.app",
  messagingSenderId: "111631595997",
  appId:
    "1:111631595997:web:233d623bf2af5fe51ede34"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


// ==========================================
// GAME
// ==========================================

const GAME = {

  uid: null,

  matchId: null,

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
// ROOT
// ==========================================

function root() {
  return document.getElementById("root");
}


// ==========================================
// HOME
// ==========================================

function showHome() {

  root().innerHTML = `

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
    ">

      <section style="
        width:100%;
        max-width:500px;
        text-align:center;
      ">

        <div style="
          font-size:65px;
          font-weight:900;
          letter-spacing:3px;
        ">
          MZAD
        </div>

        <div style="
          font-size:22px;
          opacity:.7;
          margin-bottom:35px;
        ">
          مزاد كرة القدم
        </div>

        <div style="
          padding:25px;
          margin-bottom:20px;
          background:#101d2e;
          border-radius:20px;
        ">

          <div style="opacity:.6;">
            الميزانية
          </div>

          <div style="
            margin-top:8px;
            font-size:30px;
            font-weight:900;
          ">
            200,000,000
          </div>

          <div style="
            margin-top:5px;
            opacity:.4;
            font-size:13px;
          ">
            فلوس افتراضية
          </div>

        </div>

        <button
          id="play"
          style="
            width:100%;
            padding:18px;
            border:0;
            border-radius:15px;
            background:#19d36b;
            color:#04110a;
            font-size:20px;
            font-weight:900;
          "
        >
          🎮 ابدأ مباراة
        </button>

      </section>

    </main>
  `;


  document
    .getElementById("play")
    .onclick = startMatchmaking;

}


// ==========================================
// MATCHMAKING
// ==========================================

async function startMatchmaking() {

  root().innerHTML = `

    <main style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#07111f;
      color:white;
      direction:rtl;
      text-align:center;
      font-family:Arial,sans-serif;
    ">

      <section>

        <div style="font-size:65px;">
          ⚽
        </div>

        <h1>
          بندور على لاعب...
        </h1>

        <p style="opacity:.6;">
          مستني لاعب تاني يدخل
        </p>

        <div style="
          width:55px;
          height:55
