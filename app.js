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
   VARIABLES
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

  {id:"gk01",name:"Manuel Neuer",category:"GK",position:"GK",overall:89},
  {id:"gk02",name:"Thibaut Courtois",category:"GK",position:"GK",overall:90},
  {id:"gk03",name:"Alisson",category:"GK",position:"GK",overall:89},
  {id:"gk04",name:"Ederson",category:"GK",position:"GK",overall:88},
  {id:"gk05",name:"Donnarumma",category:"GK",position:"GK",overall:89},

  {id:"df01",name:"Virgil van Dijk",category:"DEF",position:"CB",overall:90},
  {id:"df02",name:"Rúben Dias",category:"DEF",position:"CB",overall:89},
  {id:"df03",name:"William Saliba",category:"DEF",position:"CB",overall:88},
  {id:"df04",name:"Antonio Rüdiger",category:"DEF",position:"CB",overall:88},
  {id:"df05",name:"Achraf Hakimi",category:"DEF",position:"RB",overall:88},
  {id:"df06",name:"Trent Alexander-Arnold",category:"DEF",position:"RB",overall:87},
  {id:"df07",name:"Alphonso Davies",category:"DEF",position:"LB",overall:87},

  {id:"md01",name:"Kevin De Bruyne",category:"MID",position:"CM",overall:91},
  {id:"md02",name:"Rodri",category:"MID",position:"CM",overall:91},
  {id:"md03",name:"Jude Bellingham",category:"MID",position:"CM",overall:90},
  {id:"md04",name:"Pedri",category:"MID",position:"CM",overall:88},
  {id:"md05",name:"Luka Modrić",category:"MID",position:"CM",overall:87},
  {id:"md06",name:"Toni Kroos",category:"MID",position:"CM",overall:87},

  {id:"wg01",name:"Mohamed Salah",category:"WING",position:"RW",overall:90},
  {id:"wg02",name:"Vinícius Jr.",category:"WING",position:"LW",overall:90},
  {id:"wg03",name:"Bukayo Saka",category:"WING",position:"RW",overall:87},
  {id:"wg04",name:"Lamine Yamal",category:"WING",position:"RW",overall:89},
  {id:"wg05",name:"Rafael Leão",category:"WING",position:"LW",overall:86},

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

  return Number(value || 0)
    .toLocaleString("en-US") + " $";

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
              الميزانية:
              ${money(myBudget)}
            </div>

            <br>

            <button
              class="btn btn-primary"
              id="findMatchBtn">

              ابحث عن لاعب

            </button>

          </div>

        </div>

      </div>

    </div>
  `);


  document
    .getElementById("findMatchBtn")
    .addEventListener(
      "click",
      startMatchmaking
    );

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
              الميزانية:
              ${money(myBudget)}
            </div>

            <br>

            <button
              class="btn"
              id="cancelSearchBtn">

              إلغاء البحث

            </button>

          </div>

        </div>

      </div>

    </div>
  `);


  document
    .getElementById("cancelSearchBtn")
    .addEventListener(
      "click",
      cancelMatchmaking
    );

}


/* =========================================
   LOGIN
========================================= */

signInAnonymously(auth)

  .then(() => {

    onAuthStateChanged(
      auth,
      async user => {

        if (!user) return;

        UID = user.uid;

        await set(
          ref(db, `players/${UID}`),
          {
            uid: UID,
            budget: 200000000,
            online: true,
            updatedAt: Date.now()
          }
        );


        onDisconnect(
          ref(db, `players/${UID}/online`)
        ).set(false);


        showHome();

      }
    );

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

            <button
              class="btn btn-primary"
              onclick="location.reload()">

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


  try {

    const waitingRef =
      ref(db, "matchmaking/waiting");


    const snapshot =
      await get(waitingRef);


    let opponentUID = null;


    if (snapshot.exists()) {

      const waiting =
        snapshot.val();


      for (const id of Object.keys(waiting)) {

        if (id !== UID) {

          opponentUID = id;

          break;

        }

      }

    }


    /*
      لو فيه لاعب مستني بالفعل
    */

    if (opponentUID) {

      MATCH_ID =
        "match_" +
        Date.now() +
        "_" +
        Math.random()
          .toString(36)
          .slice(2, 8);


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


      await remove(
        ref(
          db,
          `matchmaking/waiting/${opponentUID}`
        )
      );


      await remove(
        ref(
          db,
          `matchmaking/waiting/${UID}`
        )
      );


      searching = false;

      showFormation();

      listenToMatch();

      return;

    }


    /*
      مفيش خصم:
      ندخل الانتظار
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


    onDisconnect(
      ref(
        db,
        `matchmaking/waiting/${UID}`
      )
    ).remove();


    if (waitingListener) {

      waitingListener();

      waitingListener = null;

    }


    waitingListener = onValue(

      waitingRef,

      async snap => {

        if (!snap.exists()) return;


        const waiting =
          snap.val();


        let opponent = null;


        for (
          const id of Object.keys(waiting)
        ) {

          if (id !== UID) {

            opponent = id;

            break;

          }

        }


        if (!opponent) return;


        /*
          نمنع الاتنين من إنشاء
          مباراتين في نفس الوقت
        */

        const opponentRef =
          ref(
            db,
            `matchmaking/waiting/${opponent}`
          );


        const transaction =
          await runTransaction(
            opponentRef,
            current => {

              if (!current) {
                return;
              }


              if (current.matchedBy) {
                return;
              }


              return {
                ...current,
                matchedBy: UID
              };

            }
          );


        if (!transaction.committed) {
          return;
        }


        const check =
          await get(opponentRef);


        if (!check.exists()) {
          return;
        }


        const opponentData =
          check.val();


        if (
          opponentData.matchedBy !== UID
        ) {

          return;

        }


        MATCH_ID =
          "match_" +
          Date.now() +
          "_" +
          Math.random()
            .toString(36)
            .slice(2, 8);


        await set(
          ref(
            db,
            `matches/${MATCH_ID}`
          ),
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

              [opponent]: {

                uid: opponent,

                budget: 200000000,

                formation: null,

                ready: false,

                squad: {}

              }

            }

          }
        );


        await remove(
          ref(
            db,
            `matchmaking/waiting/${UID}`
          )
        );


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
              حصلت مشكلة
            </h2>

            <p class="card-subtitle">
              ${escapeHtml(error.message)}
            </p>

            <button
              class="btn btn-primary"
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
   CANCEL
========================================= */

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


/* =========================================
   FORMATION
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
              اختار التشكيلة اللي هتلعب بيها
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
   CHOOSE FORMATION - FIXED
========================================= */

async function chooseFormation(formation) {

  if (!MATCH_ID || !UID) {

    alert("المباراة لسه مش جاهزة");

    return;

  }


  myFormation = formation;


  try {

    /*
      تسجيل التشكيلة
    */

    await update(
      ref(
        db,
        `matches/${MATCH_ID}/players/${UID}`
      ),
      {

        uid: UID,

        formation: formation,

        ready: true

      }
    );


    /*
      إظهار الانتظار
    */

    show(`
      <div class="app">

        <div class="screen">

          <div class="container">

            <div
              class="card"
              style="text-align:center">

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


    /*
      نبدأ المراقبة
    */

    waitForPlayers();

  }

  catch (error) {

    console.error(error);

    alert(
      "مشكلة في حفظ التشكيلة:\n" +
      error.message
    );

  }

}


/* =========================================
   WAIT FOR BOTH PLAYERS - FIXED
========================================= */

function waitForPlayers() {

  if (!MATCH_ID) return;


  if (matchListener) {

    matchListener();

    matchListener = null;

  }


  matchListener = onValue(

    ref(
      db,
      `matches/${MATCH_ID}`
    ),

    async snapshot => {

      if (!snapshot.exists()) {
        return;
      }


      const match =
        snapshot.val();


      const matchPlayers =
        match.players || {};


      const ids =
        Object.keys(matchPlayers);


      /*
        لازم يكون فيه لاعبين
      */

      if (ids.length !== 2) {
        return;
      }


      const p1 =
        matchPlayers[ids[0]];


      const p2 =
        matchPlayers[ids[1]];


      /*
        التحقق من التشكيلتين
      */

      const p1Ready =
        p1 &&
        p1.ready === true &&
        typeof p1.formation === "string" &&
        p1.formation.length > 0;


      const p2Ready =
        p2 &&
        p2.ready === true &&
        typeof p2.formation === "string" &&
        p2.formation.length > 0;


      /*
        واحد لسه ما اختارش
      */

      if (!p1Ready || !p2Ready) {

        return;

      }


      /*
        الاثنين اختاروا.
        نستخدم Transaction لمنع
        إنشاء حالة مختلفة عند الطرفين.
      */

      const statusRef =
        ref(
          db,
          `matches/${MATCH_ID}/status`
        );


      const result =
        await runTransaction(
          statusRef,
          currentStatus => {

            if (currentStatus === "auction") {

              return currentStatus;

            }


            if (
              currentStatus !== "formation"
            ) {

              return;

            }


            return "auction";

          }
        );


      if (
        !result.committed &&
        result.snapshot.val() !== "auction"
      ) {

        return;

      }


      /*
        نقرأ المباراة مرة أخيرة
      */

      const finalSnapshot =
        await get(
          ref(
            db,
            `matches/${MATCH_ID}`
          )
        );


      if (!finalSnapshot.exists()) {
        return;
      }


      const finalMatch =
        finalSnapshot.val();


      /*
        لو أصبحت Auction
        نفتح المزاد.
      */

      if (
        finalMatch.status === "auction"
      ) {

        if (matchListener) {

          matchListener();

          matchListener = null;

        }


        showAuction(finalMatch);

      }

    }

  );

}


/* =========================================
   AUCTION
========================================= */

function showAuction(match) {

  let auction =
    match.auction;


  /*
    أول مرة فقط:
    إنشاء لاعب للمزاد
  */

  if (!auction) {

    auction = {

      active: true,

      player: players[
        Math.floor(
          Math.random() * players.length
        )
      ],

      currentBid: 1000000,

      highestBidder: null,

      startedAt: Date.now(),

      endsAt: Date.now() + 15000

    };

  }


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

              <p
