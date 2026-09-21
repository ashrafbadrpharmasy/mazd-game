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


// ======================================================
// FIREBASE
// ======================================================

const firebaseConfig = {
  apiKey: "AIzaSyAPEPcsqW4b_UiE9iv3nmC5EufdkJ7-xK0",
  authDomain: "mzad-game-45174.firebaseapp.com",
  projectId: "mzad-game-45174",
  storageBucket: "mzad-game-45174.firebasestorage.app",
  messagingSenderId: "111631595997",
  appId: "1:111631595997:web:233d623bf2af5fe51ede34"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(
  app,
  "https://mzad-game-45174-default-rtdb.firebaseio.com/"
);


// ======================================================
// SETTINGS
// ======================================================

const FORMATION = "4-3-3";

const STARTING_BUDGET = 200000000;

const AUCTION_SECONDS = 15;

const BID_INCREMENT = 1000000;


// ======================================================
// PLAYERS
// ======================================================

const PLAYERS = [

  { id:"gk1", name:"Alisson", pos:"GK", rating:89, cat:"GK" },
  { id:"gk2", name:"Courtois", pos:"GK", rating:90, cat:"GK" },
  { id:"gk3", name:"Neuer", pos:"GK", rating:89, cat:"GK" },

  { id:"d1", name:"Van Dijk", pos:"DEF", rating:90, cat:"DEF" },
  { id:"d2", name:"Rúben Dias", pos:"DEF", rating:89, cat:"DEF" },
  { id:"d3", name:"Rüdiger", pos:"DEF", rating:88, cat:"DEF" },
  { id:"d4", name:"Hakimi", pos:"DEF", rating:88, cat:"DEF" },
  { id:"d5", name:"Theo Hernández", pos:"DEF", rating:87, cat:"DEF" },

  { id:"m1", name:"Rodri", pos:"MID", rating:91, cat:"MID" },
  { id:"m2", name:"De Bruyne", pos:"MID", rating:91, cat:"MID" },
  { id:"m3", name:"Bellingham", pos:"MID", rating:90, cat:"MID" },
  { id:"m4", name:"Modrić", pos:"MID", rating:88, cat:"MID" },
  { id:"m5", name:"Pedri", pos:"MID", rating:87, cat:"MID" },

  { id:"w1", name:"Salah", pos:"WING", rating:90, cat:"WING" },
  { id:"w2", name:"Vinícius Jr.", pos:"WING", rating:90, cat:"WING" },
  { id:"w3", name:"Saka", pos:"WING", rating:87, cat:"WING" },
  { id:"w4", name:"Son", pos:"WING", rating:88, cat:"WING" },

  { id:"s1", name:"Haaland", pos:"ST", rating:91, cat:"ST" },
  { id:"s2", name:"Mbappé", pos:"ST", rating:91, cat:"ST" },
  { id:"s3", name:"Kane", pos:"ST", rating:90, cat:"ST" },
  { id:"s4", name:"Lewandowski", pos:"ST", rating:89, cat:"ST" }

];


// ======================================================
// STATE
// ======================================================

let user = null;

let matchId = null;

let match = null;

let unsubscribeMatch = null;

let unsubscribeWaiting = null;

let timer = null;

let finishing = false;


// ======================================================
// ROOT
// ======================================================

const root = document.getElementById("root");


// ======================================================
// BASIC UI
// ======================================================

function appHTML(content) {

  return `
    <div class="app">
      <section class="screen">
        <div class="container">
          ${content}
        </div>
      </section>
    </div>
  `;

}


function money(number) {

  return Number(number || 0)
    .toLocaleString("en-US");

}


function playerById(id) {

  return PLAYERS.find(
    player => player.id === id
  );

}


// ======================================================
// HOME
// ======================================================

function home() {

  stopTimer();

  root.innerHTML = appHTML(`

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
          ⚽ MZAD
        </h2>

        <p>
          العب مزاد كرة القدم ضد لاعب حقيقي أونلاين
        </p>

        <div class="budget">

          الميزانية

          <strong>
            ${money(STARTING_BUDGET)}
          </strong>

        </div>

        <div style="
          margin-top:18px;
          padding:15px;
          background:rgba(255,255,255,.05);
          border-radius:12px;
          text-align:center;
        ">

          التشكيل التلقائي

          <strong style="
            display:block;
            margin-top:5px;
            font-size:22px;
          ">
            4-3-3
          </strong>

        </div>

        <button
          id="start"
          class="btn btn-primary"
          style="width:100%;margin-top:20px"
        >
          ابدأ مباراة
        </button>

      </div>

    </div>

  `);

  document
    .getElementById("start")
    ?.addEventListener(
      "click",
      startSearching
    );

}


// ======================================================
// SEARCHING
// ======================================================

async function startSearching() {

  if (!user) {

    alert("لسه بنسجل دخولك، حاول مرة ثانية.");

    return;

  }

  showSearching();

  const myWaitingRef =
    ref(
      db,
      `matchmaking/waiting/${user.uid}`
    );

  try {

    await set(
      myWaitingRef,
      {
        uid:user.uid,
        createdAt:Date.now()
      }
    );

    await onDisconnect(
      myWaitingRef
    ).remove();

    findOpponent();

  } catch(error) {

    console.error(error);

    alert(
      "حصل خطأ في الاتصال بـ Firebase."
    );

    home();

  }

}


function showSearching() {

  root.innerHTML = appHTML(`

    <div class="card" style="
      text-align:center;
      margin-top:50px;
    ">

      <div class="loader"></div>

      <h2>
        بندور على لاعب...
      </h2>

      <p>
        جاري البحث عن خصم حقيقي أونلاين
      </p>

      <p>
        التشكيل:
        <strong>4-3-3</strong>
      </p>

      <button
        id="cancel"
        class="btn"
        style="margin-top:20px"
      >
        إلغاء البحث
      </button>

    </div>

  `);

  document
    .getElementById("cancel")
    ?.addEventListener(
      "click",
      cancelSearching
    );

}


async function cancelSearching() {

  if (unsubscribeWaiting) {

    unsubscribeWaiting();

    unsubscribeWaiting = null;

  }

  if (user) {

    await remove(
      ref(
        db,
        `matchmaking/waiting/${user.uid}`
      )
    );

  }

  home();

}


// ======================================================
// FIND OPPONENT
// ======================================================

function findOpponent() {

  const waitingRef =
    ref(
      db,
      "matchmaking/waiting"
    );

  if (unsubscribeWaiting) {

    unsubscribeWaiting();

  }

  unsubscribeWaiting =
    onValue(
      waitingRef,
      async snapshot => {

        const data =
          snapshot.val();

        if (!data) return;

        const waitingPlayers =
          Object.values(data)
            .filter(
              p =>
                p &&
                p.uid &&
                p.uid !== user.uid
            )
            .sort(
              (a,b) =>
                Number(a.createdAt || 0) -
                Number(b.createdAt || 0)
            );

        if (
          waitingPlayers.length === 0
        ) {

          return;

        }

        const opponent =
          waitingPlayers[0];

        const ids = [
          user.uid,
          opponent.uid
        ].sort();

        const firstPlayer =
          ids[0];

        const secondPlayer =
          ids[1];

        const newMatchId =
          `match_${firstPlayer}_${secondPlayer}`;

        const matchRef =
          ref(
            db,
            `matches/${newMatchId}`
          );

        const existing =
          await get(matchRef);

        if (!existing.exists()) {

          if (
            user.uid !== firstPlayer
          ) {

            return;

          }

          await createMatch(
            newMatchId,
            firstPlayer,
            secondPlayer
          );

        }

        await remove(
          ref(
            db,
            `matchmaking/waiting/${firstPlayer}`
          )
        );

        await remove(
          ref(
            db,
            `matchmaking/waiting/${secondPlayer}`
          )
        );

        enterMatch(
          newMatchId
        );

      }
    );

}


// ======================================================
// CREATE MATCH
// ======================================================

async function createMatch(
  id,
  playerA,
  playerB
) {

  const firstPlayer =
    PLAYERS[
      Math.floor(
        Math.random() *
        PLAYERS.length
      )
    ];

  const matchData = {

    status:"match_found",

    formation:FORMATION,

    createdAt:Date.now(),

    players:{

      [playerA]:{

        uid:playerA,

        budget:STARTING_BUDGET,

        squad:[],

        formation:FORMATION

      },

      [playerB]:{

        uid:playerB,

        budget:STARTING_BUDGET,

        squad:[],

        formation:FORMATION

      }

    },

    auction:{

      playerId:firstPlayer.id,

      currentBid:0,

      highestBidder:null,

      endsAt:0,

      finished:false,

      round:1

    }

  };

  await set(
    ref(
      db,
      `matches/${id}`
    ),
    matchData
  );

}


// ======================================================
// ENTER MATCH
// ======================================================

function enterMatch(id) {

  matchId = id;

  showFound();

  if (unsubscribeMatch) {

    unsubscribeMatch();

  }

  unsubscribeMatch =
    onValue(
      ref(
        db,
        `matches/${id}`
      ),
      snapshot => {

        if (!snapshot.exists()) {

          home();

          return;

        }

        match =
          snapshot.val();

        processMatch();

      }
    );

}


function showFound() {

  root.innerHTML = appHTML(`

    <div class="card" style="
      text-align:center;
      margin-top:50px;
    ">

      <div style="
        font-size:60px;
      ">
        ⚽
      </div>

      <h2>
        تم العثور على خصم!
      </h2>

      <p>
        جاري تجهيز المباراة...
      </p>

      <div class="budget">
        التشكيل
        <strong>
          4-3-3
        </strong>
      </div>

    </div>

  `);

}


// ======================================================
// PROCESS MATCH
// ======================================================

async function processMatch() {

  if (!match) return;

  if (
    match.status ===
    "match_found"
  ) {

    setTimeout(
      startAuction,
      1000
    );

    return;

  }

  if (
    match.status ===
    "auction"
  ) {

    showAuction();

    return;

  }

  if (
    match.status ===
    "finished"
  ) {

    showResult();

  }

}


// ======================================================
// START AUCTION
// ======================================================

async function startAuction() {

  const matchRef =
    ref(
      db,
      `matches/${matchId}`
    );

  const snapshot =
    await get(matchRef);

  if (!snapshot.exists()) return;

  const data =
    snapshot.val();

  if (
    data.status ===
    "auction"
  ) {

    return;

  }

  const end =
    Date.now() +
    AUCTION_SECONDS * 1000;

  await update(
    matchRef,
    {

      status:"auction",

      formation:FORMATION,

      "auction/endsAt":
        end,

      "auction/currentBid":
        0,

      "auction/highestBidder":
        null,

      "auction/finished":
        false

    }
  );

}


// ======================================================
// AUCTION
// ======================================================

function showAuction() {

  stopTimer();

  const auction =
    match.auction;

  const player =
    playerById(
      auction.playerId
    );

  if (!player) return;

  const me =
    match.players[user.uid];

  const opponentId =
    Object.keys(
      match.players
    ).find(
      id =>
        id !== user.uid
    );

  const opponent =
    match.players[opponentId];

  const bid =
    Number(
      auction.currentBid || 0
    );

  const nextBid =
    bid + BID_INCREMENT;

  const canBid =
    nextBid <=
    Number(me.budget || 0);

  root.innerHTML = appHTML(`

    <div class="header">

      <div class="logo">
        MZAD
      </div>

      <div class="budget">
        💰 ${money(me.budget)}
      </div>

    </div>


    <div class="card auction-player">

      <div class="player-position">
        ${player.pos}
      </div>

      <div class="player-name">
        ${player.name}
      </div>

      <div class="player-rating">
        ${player.rating}
      </div>

    </div>


    <div class="card" style="
      text-align:center;
      margin-top:15px;
    ">

      <div class="auction-timer">

        <span id="timer">
          ${secondsLeft(auction.endsAt)}
        </span>

      </div>

      <div class="current-bid">

        <small>
          أعلى مزايدة
        </small>

        <strong>
          ${money(bid)}
        </strong>

      </div>

      <p>

        ${
          auction.highestBidder === user.uid
            ? "أنت أعلى مزايد حاليًا"
            : auction.highestBidder
              ? "الخصم أعلى مزايد حاليًا"
              : "لا توجد مزايدة حتى الآن"
        }

      </p>

      <button
        id="bid"
        class="btn btn-primary bid-button"
        ${canBid ? "" : "disabled"}
      >

        زايد +${money(BID_INCREMENT)}

      </button>

    </div>


    <div class="card" style="margin-top:15px">

      <h3>
        فريقك
      </h3>

      <p>
        التشكيل:
        <strong>4-3-3</strong>
      </p>

      <p>
        عدد اللاعبين:
        ${me.squad?.length || 0}
      </p>

      <p>
        الميزانية:
        ${money(me.budget)}
      </p>

    </div>


    <div class="card" style="margin-top:15px">

      <h3>
        الخصم
      </h3>

      <p>
        عدد اللاعبين:
        ${opponent?.squad?.length || 0}
      </p>

      <p>
        الميزانية:
        ${money(opponent?.budget || 0)}
      </p>

    </div>

  `);

  document
    .getElementById("bid")
    ?.addEventListener(
      "click",
      bidPlayer
    );

  startTimer();

}


// ======================================================
// BID
// ======================================================

async function bidPlayer() {

  if (!match) return;

  const auction =
    match.auction;

  if (
    auction.finished
  ) return;

  if (
    Date.now() >=
    Number(auction.endsAt)
  ) return;

  const me =
    match.players[user.uid];

  const current =
    Number(
      auction.currentBid || 0
    );

  const next =
    current +
    BID_INCREMENT;

  if (
    next >
    Number(me.budget || 0)
  ) {

    alert(
      "الميزانية لا تكفي."
    );

    return;

  }

  await update(
    ref(
      db,
      `matches/${matchId}`
    ),
    {

      "auction/currentBid":
        next,

      "auction/highestBidder":
        user.uid

    }
  );

}


// ======================================================
// TIMER
// ======================================================

function secondsLeft(end) {

  return Math.max(
    0,
    Math.ceil(
      (
        Number(end) -
        Date.now()
      ) / 1000
    )
  );

}


function startTimer() {

  stopTimer();

  timer =
    setInterval(
      () => {

        if (!match) return;

        const left =
          secondsLeft(
            match.auction.endsAt
          );

        const element =
          document.getElementById(
            "timer"
          );

        if (element) {

          element.textContent =
            left;

        }

        if (
          left <= 0
        ) {

          stopTimer();

          finishAuction();

        }

      },
      250
    );

}


function stopTimer() {

  if (timer) {

    clearInterval(timer);

    timer = null;

  }

}


// ======================================================
// FINISH AUCTION
// ======================================================

async function finishAuction() {

  if (finishing) return;

  finishing = true;

  const snapshot =
    await get(
      ref(
        db,
        `matches/${matchId}`
      )
    );

  if (!snapshot.exists()) {

    finishing = false;

    return;

  }

  const data =
    snapshot.val();

  if (
    data.auction.finished
  ) {

    finishing = false;

    return;

  }

  const winner =
    data.auction.highestBidder;

  const playerId =
    data.auction.playerId;

  const player =
    playerById(playerId);

  if (!player) {

    finishing = false;

    return;

  }


  // --------------------------------------------------
  // NO BID
  // --------------------------------------------------

  if (!winner) {

    await update(
      ref(
        db,
        `matches/${matchId}/auction`
      ),
      {

        finished:true,

        result:"no_bid"

      }
    );

    finishing = false;

    setTimeout(
      nextAuction,
      1500
    );

    return;

  }


  // --------------------------------------------------
  // WINNER
  // --------------------------------------------------

  const winnerData =
    data.players[winner];

  const price =
    Number(
      data.auction.currentBid
    );

  const newBudget =
    Number(
      winnerData.budget
    ) - price;

  const squad =
    Array.isArray(
      winnerData.squad
    )
      ? winnerData.squad
      : [];

  const newSquad =
    [
      ...squad,
      player.id
    ];


  const updates = {};

  updates[
    `players/${winner}/budget`
  ] =
    newBudget;

  updates[
    `players/${winner}/squad`
  ] =
    newSquad;

  updates[
    "auction/finished"
  ] =
    true;

  updates[
    "auction/winner"
  ] =
    winner;

  updates[
    "auction/result"
  ] =
    "sold";


  await update(
    ref(
      db,
      `matches/${matchId}`
    ),
    updates
  );


  finishing = false;


  setTimeout(
    () => {

      showSold(
        player,
        winner,
        price
      );

    },
    800
  );

}


// ======================================================
// SOLD
// ======================================================

function showSold(
  player,
  winner,
  price
) {

  const mine =
    winner === user.uid;

  root.innerHTML =
    appHTML(`

      <div class="card" style="
        text-align:center;
        margin-top:50px;
      ">

        <div style="
          font-size:55px;
        ">
          ${mine ? "🏆" : "⚽"}
        </div>

        <h2>

          ${
            mine
              ? "كسبت اللاعب!"
              : "الخصم كسب اللاعب"
          }

        </h2>

        <h3>
          ${player.name}
        </h3>

        <p>
          السعر:
          <strong>
            ${money(price)}
          </strong>
        </p>

      </div>

    `);

  setTimeout(
    nextAuction,
    1800
  );

}


// ======================================================
// NEXT AUCTION
// ======================================================

async function nextAuction() {

  const snapshot =
    await get(
      ref(
        db,
        `matches/${matchId}`
      )
    );

  if (!snapshot.exists()) return;

  const data =
    snapshot.val();

  const ids =
    Object.keys(
      data.players || {}
    );

  const enough =
    ids.every(
      id =>
        (
          data.players[id].squad ||
          []
        ).length >= 11
    );

  if (enough) {

    await update(
      ref(
        db,
        `matches/${matchId}`
      ),
      {
        status:"finished"
      }
    );

    return;

  }


  const used = new Set();

  ids.forEach(
    id => {

      (
        data.players[id].squad ||
        []
      ).forEach(
        playerId =>
          used.add(playerId)
      );

    }
  );


  const available
