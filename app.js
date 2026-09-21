// ============================================================
// MZAD - FOOTBALL AUCTION MULTIPLAYER
// Complete app.js
// Fixed formation: 4-3-3
// ============================================================

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
  update,
  remove,
  onValue,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


// ============================================================
// FIREBASE
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyAPEPcsqW4b_UiE9iv3nmC5EufdkJ7-xK0",
  authDomain: "mzad-game-45174.firebaseapp.com",
  projectId: "mzad-game-45174",
  storageBucket: "mzad-game-45174.firebasestorage.app",
  messagingSenderId: "111631595997",
  appId: "1:111631595997:web:233d623bf2af5fe51ede34"
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const db = getDatabase(
  firebaseApp,
  "https://mzad-game-45174-default-rtdb.firebaseio.com/"
);


// ============================================================
// GAME SETTINGS
// ============================================================

const STARTING_BUDGET = 200000000;

const FIXED_FORMATION = "4-3-3";

const AUCTION_TIME = 15;

const BID_INCREMENT = 1000000;


// ============================================================
// PLAYERS
// ============================================================

const PLAYERS = [

  // GK
  {
    id: "gk_001",
    name: "Manuel Neuer",
    position: "GK",
    rating: 89,
    category: "GK"
  },
  {
    id: "gk_002",
    name: "Alisson",
    position: "GK",
    rating: 89,
    category: "GK"
  },
  {
    id: "gk_003",
    name: "Thibaut Courtois",
    position: "GK",
    rating: 90,
    category: "GK"
  },
  {
    id: "gk_004",
    name: "Ederson",
    position: "GK",
    rating: 88,
    category: "GK"
  },
  {
    id: "gk_005",
    name: "Donnarumma",
    position: "GK",
    rating: 89,
    category: "GK"
  },

  // DEF
  {
    id: "def_001",
    name: "Virgil van Dijk",
    position: "DEF",
    rating: 90,
    category: "DEF"
  },
  {
    id: "def_002",
    name: "Rúben Dias",
    position: "DEF",
    rating: 89,
    category: "DEF"
  },
  {
    id: "def_003",
    name: "Antonio Rüdiger",
    position: "DEF",
    rating: 88,
    category: "DEF"
  },
  {
    id: "def_004",
    name: "William Saliba",
    position: "DEF",
    rating: 87,
    category: "DEF"
  },
  {
    id: "def_005",
    name: "Trent Alexander-Arnold",
    position: "DEF",
    rating: 86,
    category: "DEF"
  },
  {
    id: "def_006",
    name: "Achraf Hakimi",
    position: "DEF",
    rating: 88,
    category: "DEF"
  },
  {
    id: "def_007",
    name: "Theo Hernández",
    position: "DEF",
    rating: 87,
    category: "DEF"
  },

  // MID
  {
    id: "mid_001",
    name: "Kevin De Bruyne",
    position: "MID",
    rating: 91,
    category: "MID"
  },
  {
    id: "mid_002",
    name: "Rodri",
    position: "MID",
    rating: 91,
    category: "MID"
  },
  {
    id: "mid_003",
    name: "Jude Bellingham",
    position: "MID",
    rating: 90,
    category: "MID"
  },
  {
    id: "mid_004",
    name: "Pedri",
    position: "MID",
    rating: 87,
    category: "MID"
  },
  {
    id: "mid_005",
    name: "Luka Modrić",
    position: "MID",
    rating: 88,
    category: "MID"
  },
  {
    id: "mid_006",
    name: "Toni Kroos",
    position: "MID",
    rating: 88,
    category: "MID"
  },

  // WING
  {
    id: "wing_001",
    name: "Mohamed Salah",
    position: "WING",
    rating: 90,
    category: "WING"
  },
  {
    id: "wing_002",
    name: "Vinícius Jr.",
    position: "WING",
    rating: 90,
    category: "WING"
  },
  {
    id: "wing_003",
    name: "Bukayo Saka",
    position: "WING",
    rating: 87,
    category: "WING"
  },
  {
    id: "wing_004",
    name: "Lamine Yamal",
    position: "WING",
    rating: 86,
    category: "WING"
  },
  {
    id: "wing_005",
    name: "Son Heung-min",
    position: "WING",
    rating: 88,
    category: "WING"
  },

  // ST
  {
    id: "st_001",
    name: "Erling Haaland",
    position: "ST",
    rating: 91,
    category: "ST"
  },
  {
    id: "st_002",
    name: "Kylian Mbappé",
    position: "ST",
    rating: 91,
    category: "ST"
  },
  {
    id: "st_003",
    name: "Harry Kane",
    position: "ST",
    rating: 90,
    category: "ST"
  },
  {
    id: "st_004",
    name: "Robert Lewandowski",
    position: "ST",
    rating: 89,
    category: "ST"
  },
  {
    id: "st_005",
    name: "Victor Osimhen",
    position: "ST",
    rating: 88,
    category: "ST"
  }

];


// ============================================================
// STATE
// ============================================================

let currentUser = null;

let currentMatchId = null;

let currentMatch = null;

let matchListener = null;

let waitingListener = null;

let timerInterval = null;

let isSearching = false;

let isAuctionFinished = false;


// ============================================================
// ROOT
// ============================================================

const root = document.getElementById("root");


// ============================================================
// HELPERS
// ============================================================

function money(value) {

  return Number(value || 0).toLocaleString("en-US");

}


function escapeHTML(text) {

  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function getPlayer(id) {

  return PLAYERS.find(p => p.id === id);

}


function getMyPlayerData() {

  if (!currentMatch || !currentUser) return null;

  return currentMatch.players?.[currentUser.uid] || null;

}


function getOpponentData() {

  if (!currentMatch || !currentUser) return null;

  const ids = Object.keys(currentMatch.players || {});

  const opponentId = ids.find(id => id !== currentUser.uid);

  if (!opponentId) return null;

  return currentMatch.players[opponentId];

}


function getOpponentId() {

  if (!currentMatch || !currentUser) return null;

  const ids = Object.keys(currentMatch.players || {});

  return ids.find(id => id !== currentUser.uid) || null;

}


function showError(message) {

  root.innerHTML = `
    <div class="app">
      <section class="screen">
        <div class="container">
          <div class="card">
            <h2>حدث خطأ</h2>
            <p>${escapeHTML(message)}</p>
            <button class="btn btn-primary" id="retryBtn">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </section>
    </div>
  `;

  document.getElementById("retryBtn")?.addEventListener("click", () => {
    showHome();
  });

}


// ============================================================
// HOME
// ============================================================

function showHome() {

  stopTimer();

  isSearching = false;

  isAuctionFinished = false;

  currentMatchId = null;

  currentMatch = null;

  root.innerHTML = `
    <div class="app">

      <section class="screen home">

        <div class="container">

          <div class="home-box">

            <div class="brand">

              <div class="logo">
                MZAD
              </div>

              <div class="brand-subtitle">
                مزاد كرة القدم
              </div>

            </div>

            <div class="card">

              <h2>
                مزاد كرة القدم Multiplayer
              </h2>

              <p>
                العب ضد لاعب حقيقي أونلاين
              </p>

              <div class="budget">
                ميزانيتك
                <strong>
                  ${money(STARTING_BUDGET)}
                </strong>
              </div>

              <div style="margin-top:20px">

                <div style="
                  padding:14px;
                  border-radius:12px;
                  background:rgba(255,255,255,.04);
                  margin-bottom:14px;
                ">
                  التشكيل تلقائي
                  <strong style="display:block;margin-top:5px">
                    4-3-3
                  </strong>
                </div>

                <button
                  id="startBtn"
                  class="btn btn-primary"
                  style="width:100%"
                >
                  ابدأ مباراة
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  `;

  document
    .getElementById("startBtn")
    ?.addEventListener("click", startMatchmaking);

}


// ============================================================
// MATCHMAKING
// ============================================================

async function startMatchmaking() {

  if (!currentUser) return;

  if (isSearching) return;

  isSearching = true;

  showSearching();

  const uid = currentUser.uid;

  const waitingRef = ref(
    db,
    `matchmaking/waiting/${uid}`
  );

  try {

    await set(waitingRef, {
      uid: uid,
      createdAt: Date.now(),
      formation: FIXED_FORMATION
    });

    onDisconnect(waitingRef).remove();

    listenForOpponent();

  } catch (error) {

    console.error(error);

    isSearching = false;

    showError(
      "تعذر الاتصال بقاعدة البيانات."
    );

  }

}


function showSearching() {

  root.innerHTML = `
    <div class="app">

      <section class="screen">

        <div class="container">

          <div class="header">

            <div class="logo">
              MZAD
            </div>

            <div class="budget">
              ${money(STARTING_BUDGET)}
            </div>

          </div>

          <div class="matchmaking">

            <div class="card">

              <div class="loader"></div>

              <h2>
                بنـدور على لاعب...
              </h2>

              <p>
                جاري البحث عن خصم حقيقي أونلاين
              </p>

              <p style="margin-top:20px">
                التشكيل:
                <strong>4-3-3</strong>
              </p>

              <button
                id="cancelSearch"
                class="btn"
                style="margin-top:20px"
              >
                إلغاء
              </button>

            </div>

          </div>

        </div>

      </section>

    </div>
  `;

  document
    .getElementById("cancelSearch")
    ?.addEventListener("click", cancelMatchmaking);

}


async function cancelMatchmaking() {

  if (!currentUser) return;

  isSearching = false;

  if (waitingListener) {

    waitingListener();

    waitingListener = null;

  }

  try {

    await remove(
      ref(
        db,
        `matchmaking/waiting/${currentUser.uid}`
      )
    );

  } catch (error) {

    console.error(error);

  }

  showHome();

}


// ============================================================
// FIND OPPONENT
// ============================================================

function listenForOpponent() {

  if (waitingListener) {

    waitingListener();

    waitingListener = null;

  }

  const waitingRef = ref(
    db,
    "matchmaking/waiting"
  );

  waitingListener = onValue(
    waitingRef,
    async snapshot => {

      if (!isSearching) return;

      const data = snapshot.val();

      if (!data) return;

      const players = Object.values(data)

        .filter(player =>
          player &&
          player.uid &&
          player.uid !== currentUser.uid
        )

        .sort(
          (a, b) =>
            Number(a.createdAt || 0) -
            Number(b.createdAt || 0)
        );

      if (players.length === 0) return;

      const opponent = players[0];

      const ids = [
        currentUser.uid,
        opponent.uid
      ].sort();

      const playerA = ids[0];

      const playerB = ids[1];

      const matchId =
        `match_${playerA}_${playerB}`;

      const matchRef = ref(
        db,
        `matches/${matchId}`
      );

      const existing = await get(matchRef);

      if (!existing.exists()) {

        if (currentUser.uid !== playerA) {

          return;

        }

        await createMatch(
          matchId,
          playerA,
          playerB
        );

      }

      await remove(
        ref(
          db,
          `matchmaking/waiting/${playerA}`
        )
      );

      await remove(
        ref(
          db,
          `matchmaking/waiting/${playerB}`
        )
      );

      openMatch(
        matchId
      );

    }
  );

}


// ============================================================
// CREATE MATCH
// ============================================================

async function createMatch(
  matchId,
  playerA,
  playerB
) {

  const matchRef = ref(
    db,
    `matches/${matchId}`
  );

  const randomPlayer =
    PLAYERS[
      Math.floor(
        Math.random() * PLAYERS.length
      )
    ];

  const now = Date.now();

  const matchData = {

    id: matchId,

    status: "match_found",

    createdAt: now,

    formation: FIXED_FORMATION,

    players: {

      [playerA]: {

        uid: playerA,

        budget: STARTING_BUDGET,

        squad: [],

        ready: true,

        formation: FIXED_FORMATION

      },

      [playerB]: {

        uid: playerB,

        budget: STARTING_BUDGET,

        squad: [],

        ready: true,

        formation: FIXED_FORMATION

      }

    },

    auction: {

      playerId: randomPlayer.id,

      currentBid: 0,

      highestBidder: null,

      endsAt: 0,

      round: 1,

      finished: false

    }

  };

  await set(
    matchRef,
    matchData
  );

}


// ============================================================
// OPEN MATCH
// ============================================================

function openMatch(matchId) {

  if (!currentUser) return;

  isSearching = false;

  currentMatchId = matchId;

  if (waitingListener) {

    waitingListener();

    waitingListener = null;

  }

  showMatchFound();

  const matchRef = ref(
    db,
    `matches/${matchId}`
  );

  if (matchListener) {

    matchListener();

    matchListener = null;

  }

  matchListener = onValue(
    matchRef,
    snapshot => {

      if (!snapshot.exists()) {

        showHome();

        return;

      }

      currentMatch =
        snapshot.val();

      handleMatchUpdate();

    }
  );

}


// ============================================================
// MATCH FOUND
// ============================================================

function showMatchFound() {

  root.innerHTML = `
    <div class="app">

      <section class="screen">

        <div class="container">

          <div class="card">

            <div style="
              font-size:48px;
              text-align:center;
              margin-bottom:10px;
            ">
              ⚽
            </div>

            <h2 style="text-align:center">
              تم العثور على خصم!
            </h2>

            <p style="text-align:center">
              جاري تجهيز المباراة...
            </p>

            <div style="
              margin-top:20px;
              text-align:center;
            ">

              <div class="budget">
                التشكيل
                <strong>
                  4-3-3
                </strong>
              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  `;

}


// ============================================================
// MATCH STATE
// ============================================================

function handleMatchUpdate() {

  if (!currentMatch) return;

  if (currentMatch.status === "match_found") {

    showMatchFound();

    setTimeout(
      () => {

        if (
          currentMatch &&
          currentMatch.status === "match_found"
        ) {

          startAuction();

        }

      },
      1200
    );

    return;

  }

  if (currentMatch.status === "auction") {

    showAuction();

    return;

  }

  if (currentMatch.status === "finished") {

    showFinalResult();

    return;

  }

}


// ============================================================
// START AUCTION
// ============================================================

async function startAuction() {

  if (!currentMatchId) return;

  const matchRef = ref(
    db,
    `matches/${currentMatchId}`
  );

  const snapshot =
    await get(matchRef);

  if (!snapshot.exists()) return;

  const match =
    snapshot.val();

  if (
    match.status === "auction"
  ) {

    return;

  }

  if (match.auction?.finished) {

    return;

  }

  const playerId =
    match.auction?.playerId ||
    PLAYERS[
      Math.floor(
        Math.random() * PLAYERS.length
      )
    ].id;

  const endsAt =
    Date.now() + AUCTION_TIME * 1000;

  await update(
    matchRef,
    {

      status: "auction",

      formation: FIXED_FORMATION,

      "auction/playerId":
        playerId,

      "auction/currentBid":
        0,

      "auction/highestBidder":
        null,

      "auction/endsAt":
        endsAt,

      "auction/finished":
        false

    }
  );

}


// ============================================================
// AUCTION UI
// ============================================================

function showAuction() {

  if (!currentMatch) return;

  const auction =
    currentMatch.auction;

  const player =
    getPlayer(
      auction?.playerId
    );

  if (!player) {

    return;

  }

  const myData =
    getMyPlayerData();

  const opponentData =
    getOpponentData();

  const currentBid =
    Number(
      auction.currentBid || 0
    );

  const myBudget =
    Number(
      myData?.budget ||
      STARTING_BUDGET
    );

  const opponentBudget =
    Number(
      opponentData?.budget ||
      STARTING_BUDGET
    );

  const canBid =
    currentBid + BID_INCREMENT <=
    myBudget;

  const highestBidder =
    auction.highestBidder;

  let bidderText =
    "لا يوجد مزايد حتى الآن";

  if (highestBidder) {

    if (
      highestBidder ===
      currentUser.uid
    ) {

      bidderText =
        "أنت صاحب أعلى مزايدة";

    } else {

      bidderText =
        "الخصم صاحب أعلى مزايدة";

    }

  }

  root.innerHTML = `
    <div class="app">

      <section class="screen">

        <div class="container">

          <div class="header">

            <div class="logo">
              MZAD
            </div>

            <div class="budget">
              💰 ${money(myBudget)}
            </div>

          </div>


          <div class="auction-layout">


            <div class="card auction-player">

              <div class="player-position">
                ${escapeHTML(player.position)}
              </div>

              <div class="player-name">
                ${escapeHTML(player.name)}
              </div>

              <div class="player-rating">
                ${player.rating}
              </div>

              <div style="
                margin-top:8px;
                color:#91a2b5;
              ">
                ${escapeHTML(player.category)}
              </div>

            </div>


            <div class="card">

              <div class="auction-timer">

                <span id="timer">
                  ${getRemainingSeconds(
                    auction.endsAt
                  )}
                </span>

              </div>


              <div class="current-bid">

                <small>
                  أعلى مزايدة
                </small>

                <strong>
                  ${money(currentBid)}
                </strong>

              </div>


              <p style="
                text-align:center;
                color:#91a2b5;
              ">
                ${escapeHTML(bidderText)}
              </p>


              <button
                id="bidBtn"
                class="btn btn-primary bid-button"
                ${canBid ? "" : "disabled"}
              >
                زايد +${money(BID_INCREMENT)}
              </button>


              <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:10px;
                margin-top:15px;
              ">

                <div class="card">

                  <small>
                    ميزانيتك
                  </small>

                  <strong>
                    ${money(myBudget)}
                  </strong>

                </div>


                <div class="card">

                  <small>
                    ميزانية الخصم
                  </small>

                  <strong>
                    ${money(opponentBudget)}
                  </strong>

                </div>

              </div>

            </div>


            <div class="card">

              <h3>
                التشكيل
              </h3>

              <div class="pitch">

                <div class="player-token">
                  ST
                </div>

                <div style="
                  display:flex;
                  justify-content:center;
                  gap:20px;
                  flex-wrap:wrap;
                ">

                  <div class="player-token">
                    LW
                  </div>

                  <div class="player-token">
                    RW
                  </div>

                </div>

                <div style="
                  display:flex;
                  justify-content:center;
                  gap:15px;
                  margin-top:20px;
                  flex-wrap:wrap;
                ">

                  <div class="player-token">
                    CM
                  </div>

                  <div class="player-token">
                    CM
                  </div>

                  <div class="player-token">
                    CM
                  </div>

                </div>

                <div style="
                  display:flex;
                  justify-content:center;
                  gap:15px;
                  margin-top:20px;
                  flex-wrap:wrap;
                ">

                  <div class="player-token">
                    LB
                  </div>

                  <div class="player-token">
                    CB
                  </div>

                  <div class="player-token">
                    CB
                  </div>

                  <div class="player-token">
                    RB
                  </div>

                </div>

                <div style="
                  display:flex;
                  justify-content:center;
                  margin-top:20px;
                ">

                  <div class="player-token">
                    GK
                  </div>

                </div>

              </div>

            </div>


          </div>

        </div>

      </section>

    </div>
  `;


  document
    .getElementById("bidBtn")
    ?.addEventListener(
      "click",
      placeBid
    );


  startTimer();

}


// ============================================================
// TIMER
// ============================================================

function getRemainingSeconds(endsAt) {

  const remaining =
    Math.max(
      0,
      Number(endsAt || 0) - Date.now()
    );

  return Math.ceil(
    remaining / 1000
  );

}


function startTimer() {

  stopTimer();

  timerInterval =
    setInterval(
      async () => {

        if (!currentMatch) {

          stopTimer();

          return;

        }

        const endsAt =
          Number(
            currentMatch.auction?.endsAt ||
            0
          );

        const seconds =
          getRemainingSeconds(
            endsAt
          );

        const timer =
          document.getElementById(
            "timer"
          );

        if (timer) {

          timer.textContent =
            seconds;

        }

        if (seconds <= 0) {

          stopTimer();

          await finishAuction();

        }

      },
      250
    );

}


function stopTimer() {

  if (timerInterval) {

    clearInterval(
      timerInterval
    );

    timerInterval = null;

  }

}


// ============================================================
// BID
// ============================================================

async function placeBid() {

  if (
    !currentUser ||
    !currentMatchId ||
    !currentMatch
  ) {

    return;

  }

  const auction =
    currentMatch.auction;

  if (
    auction?.finished
  ) {

    return;

  }

  if (
    Date.now() >=
    Number(auction?.endsAt || 0)
  ) {

    return;

  }

  const myData =
    getMyPlayerData();

  const budget =
    Number(
      myData?.budget ||
      STARTING_BUDGET
    );

  const oldBid =
    Number(
      auction.currentBid || 0
    );

  const newBid =
    oldBid + BID_INCREMENT;

  if (
    newBid > budget
  ) {

    alert(
      "ميزانيتك لا تكفي لهذه المزايدة."
    );

    return;

  }

  const matchRef =
    ref(
      db,
      `matches/${currentMatchId}`
    );

  try {

    await update(
      matchRef,
      {

        "auction/currentBid":
          newBid,

        "auction/highestBidder":
          currentUser.uid

      }
    );

  } catch (error) {

    console.error(error);

  }

}


// ============================================================
// FINISH AUCTION
// ============================================================

async function finishAuction() {

  if (
    !currentMatchId ||
    !currentMatch
  ) {

    return;

  }

  if (
    isAuctionFinished
  ) {

    return;

  }

  isAuctionFinished = true;

  const auction =
    currentMatch.auction;

  if (
    auction?.finished
  ) {

    return;

  }

  const winner =
    auction.highestBidder;

  const playerId =
    auction.playerId;

  const player =
    getPlayer(playerId);

  if (!player) return;

  const bid =
    Number(
      auction.currentBid || 0
    );

  const matchRef =
    ref(
      db,
      `matches/${currentMatchId}`
    );

  const freshSnapshot =
    await get(matchRef);

  if (!freshSnapshot.exists()) {

    return;

  }

  const freshMatch =
    freshSnapshot.val();

  if (
    freshMatch.auction?.finished
  ) {

    return;

  }

  // ----------------------------------------------------------
  // NO BIDS
  // ----------------------------------------------------------

  if (!winner) {

    await update(
      matchRef,
      {

        "auction/finished":
          true,

        "auction/result":
          "no_bid",

        "auction/winner":
          null

      }
    );

    setTimeout(
      () => {

        if (
          currentMatchId
        ) {

          nextAuction();

        }

      },
      1800
    );

    return;

  }


  // ----------------------------------------------------------
  // WINNER
  // ----------------------------------------------------------

  const winnerData =
    freshMatch.players?.[winner];

  if (!winnerData) return;

  const newBudget =
    Math.max(
      0,
      Number(
        winnerData.budget ||
        0
      ) - bid
    );

  const currentSquad =
    Array.isArray(
      winnerData.squad
    )
      ? winnerData.squad
      : [];

  const newSquad = [
    ...currentSquad,
    playerId
  ];

  const updates = {};

  updates[
    `players/${winner}/budget`
  ] = newBudget;

  updates[
    `players/${winner}/squad`
  ] = newSquad;

  updates[
    "auction/finished"
  ] = true;

  updates[
    "auction/winner"
  ] = winner;

  updates[
    "auction/result"
  ] = "sold";

  await update(
    matchRef,
    updates
  );

  setTimeout(
    () => {

      if (
        currentMatchId
      ) {

        showAuctionResult(
          player,
          winner,
          bid
        );

      }

    },
    800
  );

}


// ============================================================
// AUCTION RESULT
// ============================================================

function showAuctionResult(
  player,
  winner,
  bid
) {

  const wonByMe =
    winner ===
    currentUser.uid;

  root.innerHTML = `
    <div class="app">

      <section class="screen">

        <div class="container">

          <div class="result card">

            <div style="
              font-size:52px;
              text-align:center;
            ">
              ${wonByMe ? "🏆" : "⚽"}
            </div>

            <h2 style="text-align:center">

              ${
                wonByMe
                  ? "كسبت اللاعب!"
                  : "الخصم كسب اللاعب"
              }

            </h2>

            <div class="player-card">

              <strong>
                ${escapeHTML(player.name)}
              </strong>

              <span>
                ${player.position}
              </span>

              <span>
                ${player.rating}
              </span>

            </div>

            <div style="
              text-align:center;
              margin-top:15px;
            ">

              ${
                wonByMe
                  ? `دفعت ${money(bid)}`
                  : `سعر البيع ${money(bid)}`
              }

            </div>

          </div>

        </div>

      </section>

    </div>
  `;

  setTimeout(
    () => {

      nextAuction();

    },
    2000
  );

}


// ============================================================
// NEXT AUCTION
// ============================================================

async function nextAuction() {

  if (!currentMatchId) return;

  const matchRef =
    ref(
      db,
      `matches/${currentMatchId}`
    );

  const snapshot =
    await get(matchRef);

  if (!snapshot.exists()) return;

  const match =
    snapshot.val();

  const players =
    Object.keys(
      match.players || {}
    );

  const allHaveEnough =
    players.every(
      uid =>
        (
          match.players?.[uid]?.squad
            ?.length || 0
        ) >= 11
    );

  if (allHaveEnough) {

    await update(
      matchRef,
      {
        status: "finished"
      }
    );

    return;

  }

  const used =
    new Set();

  players.forEach(
    uid => {

      (
        match.players?.[uid]?.squad ||
        []
      ).forEach(
        id =>
          used.add(id)
      );

    }
  );

  const available =
    PLAYERS.filter(
      p =>
        !used.has(p.id)
    );

  if (available.length === 0) {

    await update(
      matchRef,
      {
        status: "finished"
      }
    );

    return;

  }

  const nextPlayer =
    available[
      Math.floor(
        Math.random() *
        available.length
      )
    ];

  const round =
    Number(
      match.auction?.round || 1
    ) + 1;

  await update(
    matchRef,
    {

      status: "auction",

      "auction/playerId":
        nextPlayer.id,

      "auction/currentBid":
        0,

      "auction/highestBidder":
        null,

      "auction/endsAt":
        Date.now() +
        AUCTION_TIME * 1000,

      "auction/round":
        round,

      "auction/finished":
        false,

      "auction/winner":
        null,

      "auction/result":
        null

    }
  );

  isAuctionFinished = false;

}


// ============================================================
// FINAL RESULT
// ============================================================

function calculateTeamRating(
  squad
) {

  if (
    !Array.isArray(squad) ||
    squad.length === 0
  ) {

    return 0;

  }

  const players =
    squad
      .map(id => getPlayer(id))
      .filter(Boolean);

  if (
    players.length === 0
  ) {

    return 0;

  }

  const total =
    players.reduce(
      (sum, player) =>
        sum + Number(
          player.rating || 0
        ),
      0
    );

  return Math.round(
    total / players.length
  );

}


function showFinalResult() {

  stopTimer();

  if (!currentMatch) return;

  const ids =
    Object.keys(
      currentMatch.players || {}
    );

  const myId =
    currentUser.uid;

  const opponentId =
    ids.find(
      id =>
        id !== myId
    );

  const myData =
    currentMatch.players?.[myId];

  const opponentData =
    currentMatch.players?.[opponentId];

  const myRating =
    calculateTeamRating(
      myData?.squad || []
    );

  const opponentRating =
    calculateTeamRating(
      opponentData?.squad || []
    );

  let title =
    "تعادل";

  if (
    myRating >
    opponentRating
  ) {

    title =
      "أنت الفائز!";

  }

  if (
    myRating <
    opponentRating
  ) {

    title =
      "الخصم فاز";

  }

  root.innerHTML = `
    <div class="app">

      <section class="screen">

        <div class="container">

          <div class="result card">

            <div style="
              font-size:55px;
              text-align:center;
            ">
              ${
                title === "أنت الفائز!"
                  ? "🏆"
                  : title === "تعادل"
                    ? "🤝"
                    : "⚽"
              }
            </div>

            <h1 style="text-align:center">
              ${title}
            </h1>

            <div class="team-comparison">

              <div class="card">

                <h3>
                  فريقك
                </h3>

                <div class="player-rating">
                  ${myRating}
                </div>

                <p>
                  التشكيل 4-3-3
                </p>

              </div>


              <div class="card">

                <h3>
                  الخصم
                </h3>

                <div class="player-rating">
                  ${opponentRating}
                </div>

                <p>
                  التشكيل 4-3-3
                </p>

              </div>

            </div>


            <button
              id="backHome"
              class="btn btn-primary"
              style="
                width:100%;
                margin-top:20px;
              "
            >
              العودة للرئيسية
            </button>

          </div>

        </div>

      </section>

    </div>
  `;

  document
    .getElementById("backHome")
    ?.addEventListener(
      "click",
      () => {

        if (matchListener) {

          matchListener();

          matchListener = null;

        }

        currentMatchId = null;

        currentMatch = null;

        isAuctionFinished = false;

        showHome();

      }
    );

}


// ============================================================
// AUTH
// ============================================================

async function startAuth() {

  try {

    await signInAnonymously(
      auth
    );

  } catch (error) {

    console.error(
      "Anonymous Auth Error:",
      error
    );

    showError(
      "فشل تسجيل الدخول المجهول في Firebase."
    );

  }

}


onAuthStateChanged(
  auth,
  user => {

    if (!user) return;

    currentUser = user;

    console.log(
      "MZAD User:",
      user.uid
    );

    showHome();

  }
);


// ============================================================
// START
// ============================================================

startAuth();
