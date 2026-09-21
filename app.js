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


/* =========================================================
   FIREBASE
========================================================= */

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


/* =========================================================
   GAME SETTINGS
========================================================= */

const STARTING_BUDGET = 200000000;

const FIXED_FORMATION = "4-3-3";

const AUCTION_TIME = 15;

const BID_INCREMENT = 1000000;


/* =========================================================
   STATE
========================================================= */

let UID = null;

let MATCH_ID = null;

let searching = false;

let waitingListener = null;

let matchListener = null;

let auctionTimer = null;

let myBudget = STARTING_BUDGET;


/* =========================================================
   PLAYER DATABASE
========================================================= */

const players = [

  /* GK */

  {
    id: "gk01",
    name: "Manuel Neuer",
    category: "GK",
    position: "GK",
    overall: 89
  },

  {
    id: "gk02",
    name: "Thibaut Courtois",
    category: "GK",
    position: "GK",
    overall: 90
  },

  {
    id: "gk03",
    name: "Alisson",
    category: "GK",
    position: "GK",
    overall: 89
  },

  {
    id: "gk04",
    name: "Ederson",
    category: "GK",
    position: "GK",
    overall: 88
  },

  {
    id: "gk05",
    name: "Donnarumma",
    category: "GK",
    position: "GK",
    overall: 89
  },


  /* DEF */

  {
    id: "df01",
    name: "Virgil van Dijk",
    category: "DEF",
    position: "CB",
    overall: 90
  },

  {
    id: "df02",
    name: "Rúben Dias",
    category: "DEF",
    position: "CB",
    overall: 89
  },

  {
    id: "df03",
    name: "William Saliba",
    category: "DEF",
    position: "CB",
    overall: 88
  },

  {
    id: "df04",
    name: "Antonio Rüdiger",
    category: "DEF",
    position: "CB",
    overall: 88
  },

  {
    id: "df05",
    name: "Achraf Hakimi",
    category: "DEF",
    position: "RB",
    overall: 88
  },

  {
    id: "df06",
    name: "Trent Alexander-Arnold",
    category: "DEF",
    position: "RB",
    overall: 87
  },

  {
    id: "df07",
    name: "Alphonso Davies",
    category: "DEF",
    position: "LB",
    overall: 87
  },


  /* MID */

  {
    id: "md01",
    name: "Kevin De Bruyne",
    category: "MID",
    position: "CM",
    overall: 91
  },

  {
    id: "md02",
    name: "Rodri",
    category: "MID",
    position: "CM",
    overall: 91
  },

  {
    id: "md03",
    name: "Jude Bellingham",
    category: "MID",
    position: "CM",
    overall: 90
  },

  {
    id: "md04",
    name: "Pedri",
    category: "MID",
    position: "CM",
    overall: 88
  },

  {
    id: "md05",
    name: "Luka Modrić",
    category: "MID",
    position: "CM",
    overall: 87
  },

  {
    id: "md06",
    name: "Toni Kroos",
    category: "MID",
    position: "CM",
    overall: 87
  },


  /* WING */

  {
    id: "wg01",
    name: "Mohamed Salah",
    category: "WING",
    position: "RW",
    overall: 90
  },

  {
    id: "wg02",
    name: "Vinícius Jr.",
    category: "WING",
    position: "LW",
    overall: 90
  },

  {
    id: "wg03",
    name: "Bukayo Saka",
    category: "WING",
    position: "RW",
    overall: 87
  },

  {
    id: "wg04",
    name: "Lamine Yamal",
    category: "WING",
    position: "RW",
    overall: 89
  },

  {
    id: "wg05",
    name: "Rafael Leão",
    category: "WING",
    position: "LW",
    overall: 86
  },


  /* ST */

  {
    id: "st01",
    name: "Erling Haaland",
    category: "ST",
    position: "ST",
    overall: 91
  },

  {
    id: "st02",
    name: "Kylian Mbappé",
    category: "ST",
    position: "ST",
    overall: 91
  },

  {
    id: "st03",
    name: "Harry Kane",
    category: "ST",
    position: "ST",
    overall: 90
  },

  {
    id: "st04",
    name: "Robert Lewandowski",
    category: "ST",
    position: "ST",
    overall: 89
  },

  {
    id: "st05",
    name: "Victor Osimhen",
    category: "ST",
    position: "ST",
    overall: 87
  }

];


/* =========================================================
   HELPERS
========================================================= */

function money(value) {

  return Number(value || 0).toLocaleString("en-US") + " $";

}


function show(html) {

  document.getElementById("root").innerHTML = html;

}


function escapeHtml(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   HOME
========================================================= */

function showHome() {

  show(`

    <div class="app">

      <div class="home">

        <div class="home-box">

          <div class="brand">
            MZAD
          </div>

          <div class="brand-subtitle">
            مزاد كرة القدم
          </div>

          <div class="card">

            <h2 class="card-title">
              جاهز للمزاد؟
            </h2>

            <p class="card-subtitle">
              العب ضد لاعب حقيقي أونلاين
            </p>

            <div class="budget">
              الميزانية:
              ${money(myBudget)}
            </div>

            <br>

            <button
              class="btn btn-primary"
              id="findMatch">

              ابحث عن لاعب

            </button>

          </div>

        </div>

      </div>

    </div>

  `);


  document
    .getElementById("findMatch")
    .onclick = startMatchmaking;

}


/* =========================================================
   SEARCH SCREEN
========================================================= */

function showSearching() {

  show(`

    <div class="app">

      <div class="matchmaking">

        <div class="container">

          <div class="card">

            <div class="loader"></div>

            <h2 class="card-title">
              بندور على لاعب...
            </h2>

            <p class="card-subtitle">
              جاري البحث عن خصم حقيقي أونلاين
            </p>

            <div class="budget">
              الميزانية:
              ${money(myBudget)}
            </div>

            <br>

            <button
              class="btn"
              id="cancelSearch">

              إلغاء البحث

            </button>

          </div>

        </div>

      </div>

    </div>

  `);


  document
    .getElementById("cancelSearch")
    .onclick = cancelMatchmaking;

}


/* =========================================================
   MATCH FOUND
========================================================= */

function showMatchFound() {

  show(`

    <div class="app">

      <div class="screen">

        <div class="container">

          <div
            class="card"
            style="text-align:center">

            <div class="loader"></div>

            <h2 class="card-title">
              تم العثور على الخصم!
            </h2>

            <p class="card-subtitle">
              جاري تجهيز المباراة...
            </p>

            <div class="budget">
              التشكيلة: 4-3-3
            </div>

          </div>

        </div>

      </div>

    </div>

  `);

}


/* =========================================================
   START MATCHMAKING
========================================================= */

async function startMatchmaking() {

  if (!UID || searching) return;

  searching = true;

  showSearching();


  try {

    const waitingRef =
      ref(db, "matchmaking/waiting");


    /*
      كل لاعب يكتب نفسه في قائمة الانتظار.
    */

    await set(
      ref(
        db,
        `matchmaking/waiting/${UID}`
      ),
      {

        uid: UID,

        createdAt: Date.now(),

        online: true

      }
    );


    /*
      لو خرج من الصفحة،
      Firebase يحذف اللاعب تلقائيًا.
    */

    onDisconnect(
      ref(
        db,
        `matchmaking/waiting/${UID}`
      )
    ).remove();


    /*
      نراقب قائمة الانتظار.
    */

    if (waitingListener) {

      waitingListener();

      waitingListener = null;

    }


    waitingListener = onValue(

      waitingRef,

      async snapshot => {

        if (!snapshot.exists()) return;


        const data = snapshot.val();


        const ids =
          Object.keys(data)
            .filter(
              id => data[id] && data[id].online !== false
            )
            .sort();


        /*
          لازم لاعبين على الأقل.
        */

        if (ids.length < 2) return;


        /*
          نختار أول لاعبين.
          ترتيب UID يمنع حدوث مباراتين
          مختلفتين في نفس اللحظة.
        */

        const playerA = ids[0];

        const playerB = ids[1];


        if (
          UID !== playerA &&
          UID !== playerB
        ) {

          return;

        }


        /*
          ID المباراة ثابت للطرفين.
        */

        const matchId =
          "match_" +
          playerA +
          "_" +
          playerB;


        const matchRef =
          ref(
            db,
            `matches/${matchId}`
          );


        /*
          نشوف هل المباراة موجودة بالفعل.
        */

        const existing =
          await get(matchRef);


        /*
          اللاعب الأول فقط ينشئ المباراة.
        */

        if (
          !existing.exists() &&
          UID === playerA
        ) {

          await set(
            matchRef,
            {

              status: "auction",

              createdAt: Date.now(),

              formation: FIXED_FORMATION,

              auction: {

                active: true,

                playerId: null,

                currentBid: 1000000,

                highestBidder: null,

                startedAt: null,

                endsAt: null

              },

              players: {

                [playerA]: {

                  uid: playerA,

                  budget: STARTING_BUDGET,

                  formation: FIXED_FORMATION,

                  ready: true,

                  squad: {}

                },

                [playerB]: {

                  uid: playerB,

                  budget: STARTING_BUDGET,

                  formation: FIXED_FORMATION,

                  ready: true,

                  squad: {}

                }

              }

            }
          );

        }


        /*
          نتأكد أن المباراة أصبحت موجودة.
        */

        const finalMatch =
          await get(matchRef);


        if (!finalMatch.exists()) return;


        MATCH_ID = matchId;

        searching = false;


        /*
          نحذفنا من الانتظار.
        */

        await remove(
          ref(
            db,
            `matchmaking/waiting/${UID}`
          )
        );


        if (waitingListener) {

          waitingListener();

          waitingListener = null;

        }


        showMatchFound();


        /*
          نبدأ متابعة المباراة.
        */

        listenToMatch();

      }

    );

  }

  catch (error) {

    console.error(error);

    searching = false;

    show(`

      <div class="screen">

        <div class="container">

          <div class="card">

            <h2 class="card-title">
              حصلت مشكلة
            </h2>

            <p class="card-subtitle">
              ${escapeHtml(error.message)}
            </p>

            <button
              class="btn btn-primary"
              onclick="location.reload()">

              إعادة المحاولة

            </button>

          </div>

        </div>

      </div>

    `);

  }

}


/* =========================================================
   CANCEL SEARCH
========================================================= */

async function cancelMatchmaking() {

  searching = false;


  if (waitingListener) {

    waitingListener();

    waitingListener = null;

  }


  if (UID) {

    await remove(
      ref(
        db,
        `matchmaking/waiting/${UID}`
      )
    );

  }


  showHome();

}


/* =========================================================
   MATCH LISTENER
========================================================= */

function listenToMatch() {

  if (!MATCH_ID) return;


  if (matchListener) {

    matchListener();

    matchListener = null;

  }


  const matchRef =
    ref(
      db,
      `matches/${MATCH_ID}`
    );


  matchListener = onValue(

    matchRef,

    async snapshot => {

      if (!snapshot.exists()) return;


      const match =
        snapshot.val();


      /*
        لو المباراة في المزاد
        نعرض المزاد مباشرة.
      */

      if (
        match.status === "auction"
      ) {

        /*
          لو مفيش لاعب حالي،
          اللاعب الأول ينشئ الجولة.
        */

        if (
          !match.auction ||
          !match.auction.playerId
        ) {

          const player =
            players[
              Math.floor(
                Math.random() *
                players.length
              )
            ];


          /*
            اللاعب الذي UID بتاعه
            أصغر هو المسؤول عن
            إنشاء أول لاعب.
          */

          const ids =
            Object.keys(
              match.players || {}
            ).sort();


          if (
            ids.length === 2 &&
            UID === ids[0]
          ) {

            await update(
              ref(
                db,
                `matches/${MATCH_ID}/auction`
              ),
              {

                active: true,

                playerId: player.id,

                currentBid: 1000000,

                highestBidder: null,

                startedAt: Date.now(),

                endsAt:
                  Date.now() +
                  AUCTION_TIME * 1000

              }
            );

          }

          return;

        }


        showAuction(match);

      }

    }

  );

}


/* =========================================================
   AUCTION SCREEN
========================================================= */

function showAuction(match) {

  const auction =
    match.auction;


  if (!auction || !auction.playerId) {
    return;
  }


  const player =
    players.find(
      p => p.id === auction.playerId
    );


  if (!player) return;


  const currentBid =
    Number(
      auction.currentBid || 1000000
    );


  let remaining =
    Math.max(
      0,
      Math.ceil(
        (
          Number(auction.endsAt) -
          Date.now()
        ) / 1000
      )
    );


  show(`

    <div class="app">

      <div class="screen">

        <div class="container">

          <div class="header">

            <div class="logo">
              MZAD <span>⚽</span>
            </div>

            <div class="budget">
              ${money(myBudget)}
            </div>

          </div>


          <div class="auction-layout">

            <div class="card auction-player">

              <div class="player-position">
                ${player.position}
              </div>

              <div class="player-name">
                ${escapeHtml(player.name)}
              </div>

              <div class="player-rating">
                ${player.overall}
              </div>

              <div
                class="auction-timer"
                id="auctionTimer">

                ${remaining}

              </div>

              <div
                class="current-bid"
                id="currentBid">

                ${money(currentBid)}

              </div>

              <button
                class="bid-button"
                id="bidButton">

                زايد +1M

              </button>

            </div>


            <div class="card">

              <h2 class="card-title">
                مزاد مباشر
              </h2>

              <p class="card-subtitle">
                التشكيلة التلقائية:
                4-3-3
              </p>

              <div class="budget">
                ميزانيتك:
                ${money(myBudget)}
              </div>

              <br>

              <div class="card-subtitle">
                اللاعب:
                ${escapeHtml(player.name)}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  `);


  const bidButton =
    document.getElementById(
      "bidButton"
    );


  if (bidButton) {

    bidButton.onclick = () => {

      placeBid();

    };

  }


  startAuctionTimer(match);

}


/* =========================================================
   AUCTION TIMER
========================================================= */

function startAuctionTimer(match) {

  if (auctionTimer) {

    clearInterval(auctionTimer);

    auctionTimer = null;

  }


  auctionTimer =
    setInterval(

      async () => {

        const timer =
          document.getElementById(
            "auctionTimer"
          );


        const current =
          document.getElementById(
            "currentBid"
          );


        const button =
          document.getElementById(
            "bidButton"
          );


        const auction =
          match.auction;


        if (!auction) {

          clearInterval(auctionTimer);

          return;

        }


        const seconds =
          Math.max(
            0,
            Math.ceil(
              (
                Number(auction.endsAt) -
                Date.now()
              ) / 1000
            )
          );


        if (timer) {

          timer.textContent =
            seconds;

        }


        if (
          seconds <= 0
        ) {

          clearInterval(
            auctionTimer
          );

          if (button) {

            button.disabled = true;

          }

          return;

        }


        /*
          تحديث قيمة المزايدة
          على الشاشة من Firebase.
        */

        const live =
          await get(
            ref(
              db,
              `matches/${MATCH_ID}/auction`
            )
          );


        if (!live.exists()) return;


        const liveAuction =
          live.val();


        if (current) {

          current.textContent =
            money(
              liveAuction.currentBid
            );

        }

      },

      1000

    );

}


/* =========================================================
   PLACE BID
========================================================= */

async function placeBid() {

  if (!MATCH_ID || !UID) return;


  const auctionSnapshot =
    await get(
      ref(
        db,
        `matches/${MATCH_ID}/auction`
      )
    );


  if (!auctionSnapshot.exists()) {
    return;
  }


  const auction =
    auctionSnapshot.val();


  /*
    المزاد انتهى.
  */

  if (
    Date.now() >=
    Number(auction.endsAt)
  ) {

    return;

  }


  const newBid =
    Number(
      auction.currentBid || 1000000
    ) + BID_INCREMENT;


  if (
    newBid > myBudget
  ) {

    alert(
      "الميزانية مش كفاية"
    );

    return;

  }


  await update(
    ref(
      db,
      `matches/${MATCH_ID}/auction`
    ),
    {

      currentBid: newBid,

      highestBidder: UID,

      lastBidAt: Date.now()

    }
  );

}


/* =========================================================
   AUTH
==
