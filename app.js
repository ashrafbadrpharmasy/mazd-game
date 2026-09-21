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
  onDisconnect,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


/* =========================================
   FIREBASE
========================================= */

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


/* =========================================
   GAME STATE
========================================= */

let UID = null;
let MATCH_ID = null;
let searching = false;
let waitingListener = null;
let matchListener = null;

let myFormation = null;
let myBudget = 200000000;


/* =========================================
   FORMATIONS
========================================= */

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


/* =========================================
   PLAYERS
========================================= */

const players = [

  // GK
  {id:"gk01",name:"Manuel Neuer",category:"GK",position:"GK",overall:89},
  {id:"gk02",name:"Thibaut Courtois",category:"GK",position:"GK",overall:90},
  {id:"gk03",name:"Alisson",category:"GK",position:"GK",overall:89},
  {id:"gk04",name:"Ederson",category:"GK",position:"GK",overall:88},
  {id:"gk05",name:"Gianluigi Donnarumma",category:"GK",position:"GK",overall:89},

  // DEF
  {id:"df01",name:"Virgil van Dijk",category:"DEF",position:"CB",overall:90},
  {id:"df02",name:"Rúben Dias",category:"DEF",position:"CB",overall:89},
  {id:"df03",name:"William Saliba",category:"DEF",position:"CB",overall:88},
  {id:"df04",name:"Antonio Rüdiger",category:"DEF",position:"CB",overall:88},
  {id:"df05",name:"Achraf Hakimi",category:"DEF",position:"RB",overall:88},
  {id:"df06",name:"Trent Alexander-Arnold",category:"DEF",position:"RB",overall:87},
  {id:"df07",name:"Alphonso Davies",category:"DEF",position:"LB",overall:87},

  // MID
  {id:"md01",name:"Kevin De Bruyne",category:"MID",position:"CM",overall:91},
  {id:"md02",name:"Rodri",category:"MID",position:"CM",overall:91},
  {id:"md03",name:"Jude Bellingham",category:"MID",position:"CM",overall:90},
  {id:"md04",name:"Pedri",category:"MID",position:"CM",overall:88},
  {id:"md05",name:"Luka Modrić",category:"MID",position:"CM",overall:87},
  {id:"md06",name:"Toni Kroos",category:"MID",position:"CM",overall:87},

  // WING
  {id:"wg01",name:"Mohamed Salah",category:"WING",position:"RW",overall:90},
  {id:"wg02",name:"Vinícius Jr.",category:"WING",position:"LW",overall:90},
  {id:"wg03",name:"Bukayo Saka",category:"WING",position:"RW",overall:87},
  {id:"wg04",name:"Lamine Yamal",category:"WING",position:"RW",overall:89},
  {id:"wg05",name:"Rafael Leão",category:"WING",position:"LW",overall:86},

  // ST
  {id:"st01",name:"Erling Haaland",category:"ST",position:"ST",overall:91},
  {id:"st02",name:"Kylian Mbappé",category:"ST",position:"ST",overall:91},
  {id:"st03",name:"Harry Kane",category:"ST",position:"ST",overall:90},
  {id:"st04",name:"Robert Lewandowski",category:"ST",position:"ST",overall:89},
  {id:"st05",name:"Victor Osimhen",category:"ST",position:"ST",overall:87}

];


/* =========================================
   ROOT
========================================= */

const root = document.getElementById("root");


/* =========================================
   HELPERS
========================================= */

function money(value) {
  return Number(value || 0).toLocaleString("en-US") + " $";
}

function show(html) {
  root.innerHTML = html;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================
   HOME
========================================= */

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
              الميزانية: ${money(myBudget)}
            </div>

            <br>

            <button class="btn btn-primary" id="findMatchBtn">
              ابحث عن لاعب
            </button>

          </div>

        </div>

      </div>
    </div>
  `);

  document
    .getElementById("findMatchBtn")
    .addEventListener("click", startMatchmaking);
}


/* =========================================
   SEARCHING
========================================= */

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
              الميزانية: ${money(myBudget)}
            </div>

            <br>

            <button class="btn" id="cancelSearchBtn">
              إلغاء البحث
            </button>

          </div>

        </div>

      </div>
    </div>
  `);

  document
    .getElementById("cancelSearchBtn")
    .addEventListener("click", cancelMatchmaking);
}


/* =========================================
   AUTH
========================================= */

signInAnonymously(auth)
  .then(() => {

    onAuthStateChanged(auth, async user => {

      if (!user) return;

      UID = user.uid;

      await set(ref(db, `players/${UID}`), {
        uid: UID,
        budget: 200000000,
        online: true,
        updatedAt: Date.now()
      });

      onDisconnect(
        ref(db, `players/${UID}/online`)
      ).set(false);

      showHome();

    });

  })
  .catch(error => {

    console.error(error);

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

            <button class="btn btn-primary" onclick="location.reload()">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    `);

  });


/* =========================================
   MATCHMAKING
========================================= */

async function startMatchmaking() {

  if (!UID || searching) return;

  searching = true;

  showSearching();

  const myWaitingRef =
    ref(db, `matchmaking/waiting/${UID}`);

  try {

    /*
      نحاول العثور على لاعب موجود بالفعل.
    */

    const waitingSnapshot =
      await get(ref(db, "matchmaking/waiting"));

    let opponentUID = null;

    if (waitingSnapshot.exists()) {

      const waitingPlayers =
        waitingSnapshot.val();

      for (const id of Object.keys(waitingPlayers)) {

        if (id !== UID) {

          opponentUID = id;
          break;

        }

      }

    }


    /*
      لو لقينا لاعب:
      ننشئ المباراة.
    */

    if (opponentUID) {

      MATCH_ID =
        "match_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .substring(2, 8);

      const matchData = {

        status: "formation",

        createdAt: Date.now(),

        players: {

          [UID]: {
            uid: UID,
            budget: 200000000,
            formation: null,
            ready: false,
            squad: {}
          },

          [opponentUID]: {
            uid: opponentUID,
            budget: 200000000,
            formation: null,
            ready: false,
            squad: {}
          }

        }

      };


      await set(
        ref(db, `matches/${MATCH_ID}`),
        matchData
      );


      await remove(
        ref(db, `matchmaking/waiting/${opponentUID}`)
      );


      await remove(myWaitingRef);

      searching = false;

      showFormation();

      listenToMatch();

      return;

    }


    /*
      مفيش لاعب:
      ندخل قائمة الانتظار.
    */

    await set(myWaitingRef, {

      uid: UID,

      createdAt: Date.now(),

      online: true

    });


    /*
      لو خرج من الصفحة يتم حذف الانتظار.
    */

    onDisconnect(myWaitingRef).remove();


    /*
      نراقب قائمة الانتظار.
    */

    if (waitingListener) {
      waitingListener();
      waitingListener = null;
    }

    waitingListener = onValue(
      ref(db, "matchmaking/waiting"),
      async snapshot => {

        if (!snapshot.exists()) return;

        const data = snapshot.val();

        let opponentUID = null;

        for (const id of Object.keys(data)) {

          if (id !== UID) {

            opponentUID = id;
            break;

          }

        }

        if (!opponentUID) return;

        /*
          نحاول أخذ اللاعب من الانتظار.
        */

        const opponentRef =
          ref(db, `matchmaking/waiting/${opponentUID}`);

        const result =
          await runTransaction(
            opponentRef,
            current => {

              if (current === null) {
                return;
              }

              return {
                ...current,
                matchedBy: UID
              };

            }
          );


        if (!result.committed) return;


        /*
          نتأكد أن لاعبًا واحدًا فقط
          ينشئ المباراة.
        */

        const latest =
          await get(opponentRef);

        if (!latest.exists()) return;

        const latestData =
          latest.val();

        if (latestData.matchedBy !== UID) return;


        MATCH_ID =
          "match_" +
          Date.now() +
          "_" +
          Math.random()
            .toString(36)
            .substring(2, 8);


        await set(
          ref(db, `matches/${MATCH_ID}`),
          {

            status: "formation",

            createdAt: Date.now(),

            players: {

              [UID]: {
                uid: UID,
                budget: 200000000,
                formation: null,
                ready: false,
                squad: {}
              },

              [opponentUID]: {
                uid: opponentUID,
                budget: 200000000,
                formation: null,
                ready: false,
                squad: {}
              }

            }

          }
        );


        await remove(myWaitingRef);

        await remove(opponentRef);

        searching = false;

        if (waitingListener) {
          waitingListener();
          waitingListener = null;
        }

        showFormation();

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
              حصلت مشكلة في البحث
            </h2>

            <p class="card-subtitle">
              ${escapeHtml(error.message)}
            </p>

            <button class="btn btn-primary"
                    onclick="location.reload()">
              حاول تاني
            </button>

          </div>
        </div>
      </div>
    `);

  }

}


/* =========================================
   CANCEL SEARCH
========================================= */

async function cancelMatchmaking() {

  searching = false;

  if (waitingListener) {

    waitingListener();

    waitingListener = null;

  }

  if (UID) {

    await remove(
      ref(db, `matchmaking/waiting/${UID}`)
    );

  }

  showHome();

}


/* =========================================
   FORMATION SCREEN
========================================= */

function showFormation() {

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


          <div class="card">

            <h2 class="card-title">
              اختار التشكيلة
            </h2>

            <p class="card-subtitle">
              اختار التشكيلة اللي هتلعب بيها المباراة
            </p>


            <div class="formation-grid">

              ${formations.map(
                formation => `
                  <button
                    class="formation"
                    data-formation="${formation}">
                    ${formation}
                  </button>
                `
              ).join("")}

            </div>

          </div>

        </div>

      </div>

    </div>
  `);


  document
    .querySelectorAll(".formation")
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


/* =========================================
   CHOOSE FORMATION
========================================= */

async function chooseFormation(formation) {

  if (!MATCH_ID || !UID) return;

  myFormation = formation;


  await update(
    ref(db, `matches/${MATCH_ID}/players/${UID}`),
    {
      formation: formation,
      ready: true
    }
  );


  show(`
    <div class="app">

      <div class="screen">

        <div class="container">

          <div class="card" style="text-align:center">

            <div class="loader"></div>

            <h2 class="card-title">
              تم اختيار ${formation}
            </h2>

            <p class="card-subtitle">
              مستني الخصم يختار تشكيلته...
            </p>

          </div>

        </div>

      </div>

    </div>
  `);


  waitForPlayers();

}


/* =========================================
   WAIT FOR BOTH PLAYERS
========================================= */

function waitForPlayers() {

  if (!MATCH_ID) return;


  if (matchListener) {

    matchListener();

    matchListener = null;

  }


  matchListener = onValue(
    ref(db, `matches/${MATCH_ID}`),
    async snapshot => {

      if (!snapshot.exists()) return;

      const match = snapshot.val();


      const matchPlayers =
        match.players || {};


      const ids =
        Object.keys(matchPlayers);


      if (ids.length !== 2) return;


      const allReady =
        ids.every(
          id =>
            matchPlayers[id].ready === true
        );


      if (!allReady) return;


      /*
        نبدأ المزاد.
      */

      if (match.status !== "auction") {

        await update(
          ref(db, `matches/${MATCH_ID}`),
          {
            status: "auction",

            auction: {
              active: true,
              startedAt: Date.now()
            }
          }
        );

      }


      showAuction(match);

    }
  );

}


/* =========================================
   AUCTION
========================================= */

function showAuction(match) {

  const auction =
    match.auction || {};

  const currentPlayer =
    auction.player || players[0];

  const currentBid =
    auction.currentBid || 1000000;


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
                ${currentPlayer.position}
              </div>

              <div class="player-name">
                ${escapeHtml(currentPlayer.name)}
              </div>

              <div class="player-rating">
                ${currentPlayer.overall}
              </div>

              <div class="auction-timer">
                15
              </div>

              <div class="current-bid">
                ${money(currentBid)}
              </div>

              <button
                class="bid-button"
                id="bidBtn">

                زايد +1M

              </button>

            </div>


            <div class="card">

              <h2 class="card-title">
                المزاد
              </h2>

              <p class="card-subtitle">
                آخر لاعب يزايد قبل انتهاء الوقت يكسب اللاعب.
              </p>

              <div class="budget">
                ميزانيتك
                <br>
                ${money(myBudget)}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  `);


  const bidBtn =
    document.getElementById("bidBtn");


  bidBtn.addEventListener(
    "click",
    () => placeBid(currentBid)
  );

}


/* =========================================
   PLACE BID
========================================= */

async function placeBid(currentBid) {

  if (!MATCH_ID || !UID) return;


  const newBid =
    Number(currentBid) + 1000000;


  if (newBid > myBudget) {

    alert("الميزانية مش كفاية");

    return;

  }


  await update(
    ref(db, `matches/${MATCH_ID}/auction`),
    {
      currentBid: newBid,
      highestBidder: UID,
      lastBidAt: Date.now()
    }
  );

}


/* =========================================
   MATCH LISTENER
========================================= */

function listenToMatch() {

  if (!MATCH_ID) return;


  if (matchListener) {

    matchListener();

    matchListener = null;

  }


  matchListener = onValue(
    ref(db, `matches/${MATCH_ID}`),
    snapshot => {

      if (!snapshot.exists()) return;

      const match = snapshot.val();


      if (match.status === "formation") {

        /*
          لا نغيّر الشاشة لو اللاعب
          لسه بيختار تشكيلته.
        */

        return;

      }


      if (match.status === "auction") {

        showAuction(match);

      }

    }
  );

}
