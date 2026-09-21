// ==========================================
// MZAD - REAL FIREBASE MATCHMAKING
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
  set,
  get,
  onValue,
  onDisconnect,
  runTransaction
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
// FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


// ==========================================
// GAME STATE
// ==========================================

const GAME = {

  uid: null,

  matchId: null,

  selectedFormation: null,

  matchmakingStarted: false,

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

    <main class="mzad-page">

      <section class="mzad-box">

        <div class="mzad-logo">
          MZAD
        </div>

        <div class="mzad-subtitle">
          مزاد كرة القدم
        </div>

        <div class="budget-card">

          <div class="budget-label">
            الميزانية
          </div>

          <div class="budget-value">
            200,000,000
          </div>

          <div class="budget-note">
            فلوس افتراضية
          </div>

        </div>

        <button
          id="startGame"
          class="main-button"
        >
          🎮 ابدأ مباراة
        </button>

      </section>

    </main>

  `;


  document
    .getElementById("startGame")
    .addEventListener(
      "click",
      startMatchmaking
    );

}


// ==========================================
// MATCHMAKING SCREEN
// ==========================================

function showSearching() {

  root().innerHTML = `

    <main class="mzad-page">

      <section class="mzad-box">

        <div class="football">
          ⚽
        </div>

        <h1>
          بندور على لاعب...
        </h1>

        <p class="muted">
          جاري البحث عن خصم حقيقي أونلاين
        </p>

        <div class="loader"></div>

        <div id="matchStatus"
             class="status">
          جاري الاتصال بغرفة اللاعبين...
        </div>

      </section>

    </main>

  `;

}


// ==========================================
// MATCH FOUND SCREEN
// ==========================================

function showMatchFound(match) {

  root().innerHTML = `

    <main class="mzad-page">

      <section class="mzad-box">

        <div class="football">
          ⚽
        </div>

        <h1>
          🎯 تم العثور على خصم!
        </h1>

        <p class="muted">
          المباراة جاهزة
        </p>

        <div class="match-card">

          <div>
            أنت
          </div>

          <div class="vs">
            VS
          </div>

          <div>
            لاعب آخر
          </div>

        </div>

        <button
          id="formationButton"
          class="main-button"
        >
          اختيار التشكيلة
        </button>

      </section>

    </main>

  `;


  document
    .getElementById("formationButton")
    .addEventListener(
      "click",
      () => showFormation(match)
    );

}


// ==========================================
// START MATCHMAKING
// ==========================================

async function startMatchmaking() {

  if (
    GAME.matchmakingStarted
  ) {

    return;

  }


  GAME.matchmakingStarted =
    true;


  showSearching();


  const waitingRef =
    ref(
      db,
      "matchmaking/waiting"
    );


  try {

    // --------------------------------------
    // Make sure our connection exists
    // --------------------------------------

    const playerRef =
      ref(
        db,
        "players/" + GAME.uid
      );


    await set(
      playerRef,
      {

        uid: GAME.uid,

        name: "Player",

        budget: 200000000,

        squad: [],

        online: true,

        lastSeen: Date.now()

      }
    );


    // --------------------------------------
    // If browser closes/disconnects
    // --------------------------------------

    onDisconnect(playerRef)
      .update({

        online: false,

        lastSeen: Date.now()

      });


    // --------------------------------------
    // Watch waiting room
    // --------------------------------------

    watchWaitingRoom(
      waitingRef
    );


    // --------------------------------------
    // Atomic matchmaking
    // --------------------------------------

    const result =
      await runTransaction(
        waitingRef,
        current => {

          // No player waiting
          if (
            current === null
          ) {

            return {

              status: "waiting",

              uid: GAME.uid,

              createdAt: Date.now()

            };

          }


          // Don't match with yourself
          if (
            current.uid === GAME.uid
          ) {

            return;

          }


          // Already matched
          if (
            current.status ===
            "matched"
          ) {

            return;

          }


          // --------------------------------
          // FOUND PLAYER
          // --------------------------------

          const opponentUid =
            current.uid;


          const matchId =
            "match_" +
            Date.now() +
            "_" +
            Math.random()
              .toString(36)
              .substring(2, 9);


          return {

            status: "matched",

            matchId: matchId,

            createdAt:
              current.createdAt,

            matchedAt:
              Date.now(),

            players: {

              [opponentUid]: {

                uid: opponentUid,

                ready: false,

                formation: null

              },

              [GAME.uid]: {

                uid: GAME.uid,

                ready: false,

                formation: null

              }

            }

          };

        }
      );


    if (
      !result.committed
    ) {

      updateStatus(
        "فيه لاعب بيتعمله Match دلوقتي..."
      );

      return;

    }


    const waitingData =
      result.snapshot.val();


    // --------------------------------------
    // If WE created the waiting room
    // --------------------------------------

    if (
      waitingData &&
      waitingData.status ===
      "waiting"
    ) {

      updateStatus(
        "مستني لاعب تاني يدخل..."
      );

      return;

    }


    // --------------------------------------
    // If WE created the match
    // --------------------------------------

    if (
      waitingData &&
      waitingData.status ===
      "matched"
    ) {

      GAME.matchId =
        waitingData.matchId;


      await createMatch(
        waitingData
      );

      listenToMatch(
        GAME.matchId
      );

    }

  }

  catch (error) {

    console.error(
      "MATCHMAKING ERROR:",
      error
    );


    GAME.matchmakingStarted =
      false;


    showError(
      "حصل خطأ في الـMatchmaking",
      error.message
    );

  }

}


// ==========================================
// WATCH WAITING ROOM
// ==========================================

function watchWaitingRoom(
  waitingRef
) {

  onValue(
    waitingRef,
    async snapshot => {

      if (
        !snapshot.exists()
      ) {

        return;

      }


      const data =
        snapshot.val();


      // ------------------------------------
      // A match was created
      // ------------------------------------

      if (
        data.status ===
        "matched"
      ) {

        if (
          !data.matchId
        ) {

          return;

        }


        // Make sure we are one
        // of the players
        // --------------------------------

        if (
          !data.players ||
          !data.players[GAME.uid]
        ) {

          return;

        }


        GAME.matchId =
          data.matchId;


        await createMatch(
          data
        );


        listenToMatch(
          GAME.matchId
        );

      }

    }
  );

}


// ==========================================
// CREATE MATCH
// ==========================================

async function createMatch(
  waitingData
) {

  const matchRef =
    ref(
      db,
      "matches/" +
      waitingData.matchId
    );


  const existing =
    await get(matchRef);


  if (
    existing.exists()
  ) {

    return;

  }


  await set(
    matchRef,
    {

      matchId:
        waitingData.matchId,

      status:
        "formation",

      createdAt:
        Date.now(),

      players:
        waitingData.players

    }
  );

}


// ==========================================
// LISTEN TO MATCH
// ==========================================

function listenToMatch(
  matchId
) {

  const matchRef =
    ref(
      db,
      "matches/" +
      matchId
    );


  onValue(
    matchRef,
    snapshot => {

      if (
        !snapshot.exists()
      ) {

        return;

      }


      const match =
        snapshot.val();


      // ------------------------------------
      // Match found
      // ------------------------------------

      if (
        match.status ===
        "formation"
      ) {

        showMatchFound(
          match
        );

      }


      // ------------------------------------
      // Both players ready
      // ------------------------------------

      if (
        match.status ===
        "auction"
      ) {

        showAuctionWaiting();

      }

    }
  );

}


// ==========================================
// FORMATION SCREEN
// ==========================================

function showFormation(
  match
) {

  const buttons =
    GAME.formations
      .map(
        formation => `

          <button
            class="formation-button"
            data-formation="${formation}"
          >
            ${formation}
          </button>

        `
      )
      .join("");


  root().innerHTML = `

    <main class="mzad-page">

      <section class="formation-box">

        <h1>
          اختر تشكيلتك
        </h1>

        <p class="muted">
          اختار التشكيلة اللي هتلعب بيها
        </p>

        <div class="formation-grid">

          ${buttons}

        </div>

      </section>

    </main>

  `;


  document
    .querySelectorAll(
      ".formation-button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          chooseFormation(
            button.dataset.formation
          );

        }
      );

    });

}


// ==========================================
// CHOOSE FORMATION
// ==========================================

async function chooseFormation(
  formation
) {

  GAME.selectedFormation =
    formation;


  const playerRef =
    ref(
      db,
      "matches/" +
      GAME.matchId +
      "/players/" +
      GAME.uid
    );


  await set(
    playerRef,
    {

      uid: GAME.uid,

      ready: true,

      formation: formation

    }
  );


  root().innerHTML = `

    <main class="mzad-page">

      <section class="mzad-box">

        <div class="football">
          ⚽
        </div>

        <h1>
          تم اختيار التشكيلة
        </h1>

        <div class="selected-formation">
          ${formation}
        </div>

        <p class="muted">
          مستني الخصم يختار تشكيلته...
        </p>

        <div class="loader"></div>

      </section>

    </main>

  `;


  checkBothPlayersReady();

}


// ==========================================
// CHECK BOTH PLAYERS
// ==========================================

function checkBothPlayersReady() {

  const playersRef =
    ref(
      db,
      "matches/" +
      GAME.matchId +
      "/players"
    );


  onValue(
    playersRef,
    async snapshot => {

      if (
        !snapshot.exists()
      ) {

        return;

      }


      const players =
        snapshot.val();


      const ids =
        Object.keys(players);


      if (
        ids.length !== 2
      ) {

        return;

      }


      const ready =
        ids.every(
          id =>
            players[id].ready === true
        );


      if (
        !ready
      ) {

        return;

      }


      // ------------------------------------
      // Both ready
      // ------------------------------------

      const matchRef =
        ref(
          db,
          "matches/" +
          GAME.matchId
        );


      await runTransaction(
        matchRef,
        current => {

          if (
            current === null
          ) {

            return;

          }


          if (
            current.status ===
            "formation"
          ) {

            current.status =
              "auction";

          }


          return current;

        }
      );

    }
  );

}


// ==========================================
// AUCTION WAITING
// ==========================================

function showAuctionWaiting() {

  root().innerHTML = `

    <main class="mzad-page">

      <section class="mzad-box">

        <div class="football">
          🔨
        </div>

        <h1>
          المباراة جاهزة!
        </h1>

        <p class="muted">
          تم اختيار التشكيلة من اللاعبين.
        </p>

        <div class="selected-formation">
          المزاد قادم
        </div>

        <p class="muted">
          هنبدأ نظام المزاد في الخطوة التالية.
        </p>

      </section>

    </main>

  `;

}


// ==========================================
// STATUS
// ==========================================

function updateStatus(
  text
) {

  const element =
    document.getElementById(
      "matchStatus"
    );


  if (
    element
  ) {

    element.textContent =
      text;

  }

}


// ==========================================
// ERROR
// ==========================================

function showError(
  title,
  details
) {

  root().innerHTML = `

    <main class="mzad-page">

      <section class="mzad-box">

        <div class="football">
          ⚠️
        </div>

        <h1>
          ${title}
        </h1>

        <p class="muted">
          ${details}
        </p>

        <button
          id="retry"
          class="main-button"
        >
          🔄 حاول تاني
        </button>

      </section>

    </main>

  `;


  document
    .getElementById("retry")
    .addEventListener(
      "click",
      () => {

        GAME.matchmakingStarted =
          false;

        showHome();

      }
    );

}


// ==========================================
// FIREBASE AUTH
// ==========================================

async function startFirebase() {

  try {

    await signInAnonymously(
      auth
    );

  }

  catch (error) {

    console.error(
      "AUTH ERROR:",
      error
    );


    showError(
      "مشكلة في تسجيل الدخول",
      "تأكد أن Anonymous Authentication مفعّل في Firebase."
    );

  }

}


// ==========================================
// AUTH STATE
// ==========================================

onAuthStateChanged(
  auth,
  async user => {

    if (
      !user
    ) {

      return;

    }


    GAME.uid =
      user.uid;


    console.log(
      "MZAD PLAYER UID:",
      GAME.uid
    );


    try {

      const playerRef =
        ref(
          db,
          "players/" +
          GAME.uid
        );


      await set(
        playerRef,
        {

          uid:
            GAME.uid,

          name:
            "Player",

          budget:
            200000000,

          squad: [],

          online:
            true,

          connectedAt:
            Date.now()

        }
      );


      onDisconnect(
        playerRef
      ).update({

        online: false,

        lastSeen:
          Date.now()

      });


      console.log(
        "Firebase + Database: OK"
      );


      showHome();

    }

    catch (error) {

      console.error(
        "DATABASE ERROR:",
        error
      );


      showError(
        "مشكلة في قاعدة البيانات",
        error.message
      );

    }

  }
);


// ==========================================
// CSS
// ==========================================

const style =
document.createElement("style");

style.textContent = `

  * {
    box-sizing:border-box;
  }

  body {
    margin:0;
    background:#07111f;
    font-family:Arial,sans-serif;
  }

  .mzad-page {
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:20px;
    background:
      radial-gradient(
        circle at top,
        #12365c 0%,
        #07111f 55%
      );
    color:white;
    direction:rtl;
  }

  .mzad-box {
    width:100%;
    max-width:520px;
    text-align:center;
  }

  .formation-box {
    width:100%;
    max-width:650px;
    text-align:center;
  }

  .mzad-logo {
    font-size:65px;
    font-weight:900;
    letter-spacing:4px;
  }

  .mzad-subtitle {
    font-size:22px;
    opacity:.7;
    margin-bottom:35px;
  }

  .football {
    font-size:70px;
    margin-bottom:20px;
  }

  .budget-card,
  .match-card {
    padding:25px;
    margin:20px 0;
    border-radius:20px;
    background:#101d2e;
    border:1px solid rgba(255,255,255,.08);
  }

  .budget-label {
    opacity:.6;
  }

  .budget-value {
    margin-top:8px;
    font-size:30px;
    font-weight:900;
  }

  .budget-note {
    margin-top:5px;
    opacity:.4;
    font-size:13px;
  }

  .main-button {
    width:100%;
    padding:18px;
    border:0;
    border-radius:15px;
    background:#19d36b;
    color:#04110a;
    font-size:19px;
    font-weight:900;
    cursor:pointer;
  }

  .main-button:active {
    transform:scale(.98);
  }

  .muted {
    color:#91a2b5;
    line-height:1.8;
  }

  .status {
    margin-top:20px;
    color:#19d36b;
    font-size:14px;
  }

  .loader {
    width:55px;
    height:55px;
    margin:28px auto;
    border:5px solid rgba(255,255,255,.1);
    border-top-color:#19d36b;
    border-radius:50%;
    animation:mzadSpin 1s linear infinite;
  }

  .match-card {
    display:flex;
    align-items:center;
    justify-content:space-around;
    font-weight:900;
  }

  .vs {
    color:#19d36b;
    font-size:22px;
  }

  .formation-grid {
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:12px;
    margin-top:25px;
  }

  .formation-button {
    min-height:60px;
    border:1px solid #26384d;
    border-radius:14px;
    background:#101d2e;
    color:white;
    font-size:17px;
    font-weight:900;
    cursor:pointer;
  }

  .formation-button:hover {
    border-color:#19d36b;
  }

  .selected-formation {
    display:inline-block;
    margin:20px 0;
    padding:15px 25px;
    border-radius:15px;
    background:#19d36b;
    color:#04110a;
    font-size:30px;
    font-weight:900;
  }

  @keyframes mzadSpin {

    to {
      transform:rotate(360deg);
    }

  }

  @media (max-width:420px) {

    .mzad-logo {
      font-size:55px;
    }

    .formation-grid {
      gap:8px;
    }

  }

`;

document.head.appendChild(style);


// ==========================================
// START
// ==========================================

console.log(
  "MZAD starting..."
);

startFirebase();
