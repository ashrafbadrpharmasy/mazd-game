import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  onValue,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


// ===============================
// FIREBASE
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyAPEPcsqW4b_UiE9iv3nmC5EufdkJ7-xK0",
  authDomain: "mzad-game-45174.firebaseapp.com",
  databaseURL: "https://mzad-game-45174-default-rtdb.firebaseio.com/",
  projectId: "mzad-game-45174",
  storageBucket: "mzad-game-45174.firebasestorage.app",
  messagingSenderId: "111631595997",
  appId: "1:111631595997:web:233d623bf2af5fe51ede34"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);


// ===============================
// GAME
// ===============================

let UID = null;
let MATCH_ID = null;
let searching = false;

const formations = [
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
];


// ===============================
// UI
// ===============================

function page(content) {

  document.body.innerHTML = `
    <div class="page">
      ${content}
    </div>
  `;

  addCSS();
}


function addCSS() {

  if (document.getElementById("mzad-css")) return;

  const style = document.createElement("style");

  style.id = "mzad-css";

  style.textContent = `

    * {
      box-sizing:border-box;
    }

    body {
      margin:0;
      background:#07111f;
      color:white;
      font-family:Arial,sans-serif;
    }

    .page {
      min-height:100vh;
      display:flex;
      justify-content:center;
      align-items:center;
      padding:20px;
      direction:rtl;
      background:
      radial-gradient(
        circle at top,
        #12375c,
        #07111f 65%
      );
    }

    .box {
      width:100%;
      max-width:600px;
      text-align:center;
    }

    .logo {
      font-size:65px;
      font-weight:900;
      letter-spacing:4px;
    }

    .sub {
      opacity:.65;
      font-size:22px;
      margin-bottom:30px;
    }

    .budget {
      background:#101d2e;
      border:1px solid #26384d;
      padding:25px;
      border-radius:20px;
      margin-bottom:20px;
    }

    .money {
      font-size:30px;
      font-weight:900;
      margin-top:10px;
    }

    button {
      width:100%;
      padding:18px;
      border:0;
      border-radius:15px;
      background:#19d36b;
      color:#04110a;
      font-size:19px;
      font-weight:900;
      cursor:pointer;
      margin-top:10px;
    }

    button:active {
      transform:scale(.98);
    }

    .loader {
      width:55px;
      height:55px;
      border:5px solid #243447;
      border-top-color:#19d36b;
      border-radius:50%;
      animation:spin 1s linear infinite;
      margin:30px auto;
    }

    .status {
      margin-top:20px;
      color:#19d36b;
      line-height:1.8;
    }

    .error {
      color:#ff7777;
      background:#301b22;
      padding:15px;
      border-radius:12px;
      margin-top:20px;
      word-break:break-word;
    }

    .formations {
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:10px;
      margin-top:25px;
    }

    .formation {
      background:#101d2e;
      color:white;
      border:1px solid #26384d;
    }

    .formation:hover {
      border-color:#19d36b;
    }

    .vs {
      font-size:35px;
      font-weight:900;
      margin:30px;
      color:#19d36b;
    }

    @keyframes spin {
      to {
        transform:rotate(360deg);
      }
    }

  `;

  document.head.appendChild(style);
}


// ===============================
// HOME
// ===============================

function home() {

  page(`

    <div class="box">

      <div class="logo">
        MZAD
      </div>

      <div class="sub">
        مزاد كرة القدم
      </div>

      <div class="budget">

        <div>
          الميزانية
        </div>

        <div class="money">
          200,000,000
        </div>

        <small>
          فلوس افتراضية
        </small>

      </div>

      <button id="start">
        🎮 ابدأ مباراة
      </button>

    </div>

  `);

  document
    .getElementById("start")
    .onclick = startMatchmaking;
}


// ===============================
// SEARCHING
// ===============================

function searchingScreen(message = "جاري البحث عن خصم حقيقي...") {

  page(`

    <div class="box">

      <div style="font-size:70px">
        ⚽
      </div>

      <h1>
        بندور على لاعب...
      </h1>

      <div class="loader"></div>

      <div id="status" class="status">
        ${message}
      </div>

    </div>

  `);
}


// ===============================
// START MATCHMAKING
// ===============================

async function startMatchmaking() {

  if (!UID) {

    alert("لسه Firebase ما خلصش تسجيل الدخول");

    return;
  }

  if (searching) return;

  searching = true;

  searchingScreen(
    "جاري الاتصال بغرفة الانتظار..."
  );


  try {

    // ==================================
    // IMPORTANT:
    // WRITE DIRECTLY TO OUR OWN NODE
    // ==================================

    const myWaitingRef = ref(
      db,
      "matchmaking/waiting/" + UID
    );


    const waitingPlayer = {

      uid: UID,

      name: "Player",

      status: "waiting",

      createdAt: Date.now()

    };


    console.log(
      "Writing waiting player:",
      waitingPlayer
    );


    await set(
      myWaitingRef,
      waitingPlayer
    );


    // ==================================
    // VERIFY THE WRITE
    // ==================================

    const check = await get(
      myWaitingRef
    );


    if (!check.exists()) {

      throw new Error(
        "Firebase لم يؤكد كتابة matchmaking/waiting/" + UID
      );

    }


    console.log(
      "WAITING WRITE SUCCESS:",
      check.val()
    );


    document.getElementById("status").innerHTML = `
      ✅ تم تسجيلك في غرفة الانتظار
      <br>
      <small>
        UID: ${UID}
      </small>
      <br>
      <br>
      مستني لاعب تاني...
    `;


    // Remove waiting entry
    // when browser disconnects

    await onDisconnect(
      myWaitingRef
    ).remove();


    // ==================================
    // LISTEN FOR OTHER PLAYERS
    // ==================================

    listenForPlayers();

  }

  catch (error) {

    console.error(
      "WAITING ERROR:",
      error
    );


    searching = false;


    showError(
      "مشكلة في إنشاء غرفة الانتظار",
      error
    );

  }

}


// ===============================
// LISTEN FOR PLAYERS
// ===============================

function listenForPlayers() {

  const waitingRef = ref(
    db,
    "matchmaking/waiting"
  );


  onValue(
    waitingRef,
    async snapshot => {

      console.log(
        "WAITING ROOM:",
        snapshot.val()
      );


      if (!snapshot.exists()) {

        return;

      }


      const players =
        snapshot.val();


      const ids =
        Object.keys(players);


      // Find someone who isn't us

      const opponentId =
        ids.find(
          id => id !== UID
        );


      if (!opponentId) {

        return;

      }


      console.log(
        "OPPONENT FOUND:",
        opponentId
      );


      await createMatch(
        opponentId
      );

    }
  );

}


// ===============================
// CREATE MATCH
// ===============================

async function createMatch(
  opponentId
) {

  if (MATCH_ID) return;


  // Same ID for both players

  const ids = [
    UID,
    opponentId
  ].sort();


  MATCH_ID =
    "match_" +
    ids[0] +
    "_" +
    ids[1];


  const matchRef = ref(
    db,
    "matches/" + MATCH_ID
  );


  try {

    const existing =
      await get(matchRef);


    if (!existing.exists()) {

      await set(
        matchRef,
        {

          matchId: MATCH_ID,

          status: "formation",

          createdAt: Date.now(),

          players: {

            [UID]: {

              uid: UID,

              ready: false,

              formation: null

            },

            [opponentId]: {

              uid: opponentId,

              ready: false,

              formation: null

            }

          }

        }
      );

    }


    // Remove only our waiting entry

    await remove(
      ref
