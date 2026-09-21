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
  onValue,
  remove,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


// =====================================
// FIREBASE CONFIG
// =====================================

const firebaseConfig = {
  apiKey: "AIzaSyAPEPcsqW4b_UiE9iv3nmC5EufdkJ7-xK0",
  authDomain: "mzad-game-45174.firebaseapp.com",
  databaseURL: "https://mzad-game-45174-default-rtdb.firebaseio.com/",
  projectId: "mzad-game-45174",
  storageBucket: "mzad-game-45174.firebasestorage.app",
  messagingSenderId: "111631595997",
  appId: "1:111631595997:web:233d623bf2af5fe51ede34"
};


// =====================================
// FIREBASE START
// =====================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);


// =====================================
// GAME DATA
// =====================================

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


// =====================================
// GET ROOT
// =====================================

function getRoot() {
  let root = document.getElementById("root");

  if (!root) {
    root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);
  }

  return root;
}


// =====================================
// BASIC CSS
// =====================================

const css = document.createElement("style");

css.textContent = `

#root {
  min-height:100vh;
  direction:rtl;
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
      #123b63 0%,
      #07111f 60%
    );
  color:white;
  font-family:Arial,sans-serif;
}

.mzad-box {
  width:100%;
  max-width:520px;
  text-align:center;
}

.mzad-logo {
  font-size:64px;
  font-weight:900;
  letter-spacing:5px;
}

.mzad-subtitle {
  font-size:22px;
  opacity:.7;
  margin-top:5px;
  margin-bottom:30px;
}

.mzad-card {
  background:#101d2e;
  border:1px solid #26384d;
  border-radius:20px;
  padding:25px;
  margin-bottom:20px;
}

.mzad-budget-label {
  opacity:.6;
}

.mzad-budget {
  font-size:30px;
  font-weight:900;
  margin-top:8px;
}

.mzad-button {
  width:100%;
  border:0;
  border-radius:15px;
  padding:18px;
  background:#19d36b;
  color:#03130a;
  font-size:19px;
  font-weight:900;
  cursor:pointer;
}

.mzad-button:active {
  transform:scale(.98);
}

.mzad-football {
  font-size:70px;
  margin-bottom:15px;
}

.mzad-muted {
  color:#9aabbd;
  line-height:1.8;
}

.mzad-loader {
  width:55px;
  height:55px;
  border:5px solid #243448;
  border-top-color:#19d36b;
  border-radius:50%;
  margin:25px auto;
  animation:mzadspin 1s linear infinite;
}

.mzad-status {
  color:#19d36b;
  margin-top:20px;
  line-height:1.8;
  word-break:break-word;
}

.mzad-formations {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  margin-top:25px;
}

.mzad-formation {
  background:#101d2e;
  color:white;
  border:1px solid #26384d;
  border-radius:14px;
  padding:18px 10px;
  font-size:17px;
  font-weight:900;
  cursor:pointer;
}

.mzad-error {
  background:#351c25;
  border:1px solid #713344;
  border-radius:12px;
  padding:15px;
  margin-top:20px;
  color:#ff9ba9;
  word-break:break-word;
}

@keyframes mzadspin {
  to {
    transform:rotate(360deg);
  }
}

`;

document.head.appendChild(css);


// =====================================
// HOME SCREEN
// =====================================

function showHome() {

  getRoot().innerHTML = `

    <div class="mzad-page">

      <div class="mzad-box">

        <div class="mzad-logo">
          MZAD
        </div>

        <div class="mzad-subtitle">
          مزاد كرة القدم
        </div>

        <div class="mzad-card">

          <div class="mzad-budget-label">
            الميزانية
          </div>

          <div class="mzad-budget">
            200,000,000
          </div>

          <small>
            فلوس افتراضية
          </small>

        </div>

        <button
          id="startMatch"
          class="mzad-button"
        >
          🎮 ابدأ مباراة
        </button>

      </div>

    </div>

  `;

  document
    .getElementById("startMatch")
    .onclick = startMatchmaking;
}


// =====================================
// SEARCH SCREEN
// =====================================

function showSearching(text) {

  getRoot().innerHTML = `

    <div class="mzad-page">

      <div class="mzad-box">

        <div class="mzad-football">
          ⚽
        </div>

        <h1>
          بندور على لاعب...
        </h1>

        <div class="mzad-loader"></div>

        <div
          id="mzadStatus"
          class="mzad-status"
        >
          ${text}
        </div>

      </div>

    </div>

  `;

}


// =====================================
// ERROR SCREEN
// =====================================

function showError(error) {

  console.error(error);

  const message =
    error && error.message
      ? error.message
      : String(error);

  getRoot().innerHTML = `

    <div class="mzad-page">

      <div class="mzad-box">

        <div class="mzad-football">
          ⚠️
        </div>

        <h2>
          حصل خطأ
        </h2>

        <div class="mzad-error">
          ${message}
        </div>

        <br>

        <button
          class="mzad-button"
          onclick="location.reload()"
        >
          🔄 إعادة المحاولة
        </button>

      </div>

    </div>

  `;
}


// =====================================
// START MATCHMAKING
// =====================================

async function startMatchmaking() {

  if (!UID) {
    alert("لسه الاتصال بـ Firebase ما اكتملش.");
    return;
  }

  if (searching) {
    return;
  }

  searching = true;

  showSearching(
    "جاري الاتصال بغرفة الانتظار..."
  );

  try {

    // مكان انتظار اللاعب الحالي

    const myWaitingRef = ref(
      db,
      "matchmaking/waiting/" + UID
    );


    // كتابة اللاعب في waiting

    await set(
      myWaitingRef,
      {
        uid: UID,
        name: "Player",
        status: "waiting",
        createdAt: Date.now()
      }
    );


    // التأكد أن Firebase كتب البيانات

    const verify = await get(
      myWaitingRef
    );


    if (!verify.exists()) {

      throw new Error(
        "Firebase لم يكتب بيانات waiting."
      );

    }


    console.log(
      "WAITING:",
      verify.val()
    );


    const status =
      document.getElementById(
        "mzadStatus"
      );


    if (status) {

      status.innerHTML =
        "✅ تم تسجيلك في قائمة الانتظار<br>مستني لاعب تاني...";

    }


    // إزالة اللاعب عند قطع الاتصال

    onDisconnect(
      myWaitingRef
    ).remove();


    // مراقبة غرفة الانتظار

    watchWaitingRoom();

  }

  catch (error) {

    searching = false;

    showError(error);

  }

}


// =====================================
// WATCH WAITING ROOM
// =====================================

function watchWaitingRoom() {

  const waitingRef = ref(
    db,
    "matchmaking/waiting"
  );


  onValue(
    waitingRef,
    snapshot => {

      console.log(
        "WAITING DATA:",
        snapshot.val()
      );


      if (!snapshot.exists()) {
        return;
      }


      const waiting =
        snapshot.val();


      const ids =
        Object.keys(waiting);


      const opponent =
        ids.find(
          id => id !== UID
        );


      if (!opponent) {
        return;
      }


      console.log(
        "OPPONENT FOUND:",
        opponent
      );


      createMatch(opponent);

    },

    error => {

      console.error(
        "WAITING LISTENER ERROR:",
        error
      );

      showError(error);

    }
  );

}


// =====================================
// CREATE MATCH
// =====================================

async function createMatch(
  opponentUID
) {

  if (MATCH_ID) {
    return;
  }


  const sorted = [
    UID,
    opponentUID
  ].sort();


  MATCH_ID =
    "match_" +
    sorted[0] +
    "_" +
    sorted[1];


  try {

    const matchRef = ref(
      db,
      "matches/" + MATCH_ID
    );


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

            [opponentUID]: {
              uid: opponentUID,
              ready: false,
              formation: null
            }

          }

        }
      );

    }


    // إزالة اللاعب الحالي فقط

    await remove(
      ref(
        db,
        "matchmaking/waiting/" + UID
      )
    );


    showMatchFound();

  }

  catch (error) {

    showError(error);

  }

}


// =====================================
// MATCH FOUND
// =====================================

function showMatchFound() {

  getRoot().innerHTML = `

    <div class="mzad-page">

      <div class="mzad-box">

        <div class="mzad-football">
          🎯
        </div>

        <h1>
          تم العثور على خصم!
        </h1>

        <p class="mzad-muted">
          تم توصيلك بلاعب حقيقي.
        </p>

        <button
          id="chooseFormation"
          class="mzad-button"
        >
          اختيار التشكيلة
        </button>

      </div>

    </div>

  `;


  document
    .getElementById(
      "chooseFormation"
    )
    .onclick = showFormation;

}


// =====================================
// FORMATION SCREEN
// =====================================

function showFormation() {

  const buttons =
    formations.map(
      formation => `

        <button
          class="mzad-formation"
          data-formation="${formation}"
        >
          ${formation}
        </button>

      `
    ).join("");


  getRoot().innerHTML = `

    <div class="mzad-page">

      <div class="mzad-box">

        <h1>
          اختر التشكيلة
        </h1>

        <p class="mzad-muted">
          اختار التشكيلة اللي هتلعب بيها
        </p>

        <div class="mzad-formations">
          ${buttons}
        </div>

      </div>

    </div>

  `;


  document
    .querySelectorAll(
      ".mzad-formation"
    )
    .forEach(button => {

      button.onclick = function() {

        chooseFormation(
          this.dataset.formation
        );

      };

    });

}


// =====================================
// CHOOSE FORMATION
// =====================================

async function chooseFormation(
  formation
) {

  try {

    await set(
      ref(
        db,
        "matches/" +
        MATCH_ID +
        "/players/" +
        UID
      ),
      {
        uid: UID,
        ready: true,
        formation: formation
      }
    );


    getRoot().innerHTML = `

      <div class="mzad-page">

        <div class="mzad-box">

          <div class="mzad-football">
            ⚽
          </div>

          <h1>
            تم اختيار التشكيلة
          </h1>

          <div class="mzad-status">
            ${formation}
          </div>

          <div class="mzad-loader"></div>

          <p class="mzad-muted">
            مستني الخصم يختار تشكيلته...
          </p>

        </div>

      </div>

    `;


    waitForPlayers();

  }

  catch (error) {

    showError(error);

  }

}


// =====================================
// WAIT FOR BOTH PLAYERS
// =====================================

function waitForPlayers() {

  const playersRef = ref(
    db,
    "matches/" +
    MATCH_ID +
    "/players"
  );


  onValue(
    playersRef,
    async snapshot => {

      if (!snapshot.exists()) {
        return;
      }


      const players =
        snapshot.val();


      const ids =
        Object.keys(players);


      if (ids.length !== 2) {
        return;
      }


      const ready =
        ids.every(
          id =>
            players[id].ready === true
        );


      if (!ready) {
        return;
      }


      await set(
        ref(
          db,
          "matches/" +
          MATCH_ID +
          "/status"
        ),
        "auction"
      );


      showAuction();

    }
  );

}


// =====================================
// AUCTION PLACEHOLDER
// =====================================

function showAuction() {

  getRoot().innerHTML = `

    <div class="mzad-page">

      <div class="mzad-box">

        <div class="mzad-football">
          🔨
        </div>

        <h1>
          المباراة جاهزة!
        </h1>

        <p class="mzad-muted">
          تم تجهيز اللاعبين والتشكيلات.
        </p>

        <div class="mzad-card">
          المزاد هيبدأ هنا في الخطوة التالية.
        </div>

      </div>

    </div>

  `;

}


// =====================================
// FIREBASE AUTH
// =====================================

onAuthStateChanged(
  auth,
  async user => {

    if (!user) {
      return;
    }


    UID = user.uid;


    console.log(
      "UID:",
      UID
    );


    try {

      // كتابة Player

      await set(
        ref(
          db,
          "players/" + UID
        ),
        {
          uid: UID,
          name: "Player",
          budget: 200000000,
          squad: [],
          online: true,
          connectedAt: Date.now()
        }
      );


      console.log(
        "PLAYER WRITE: OK"
      );


      showHome();

    }

    catch (error) {

      showError(error);

    }

  }
);


// =====================================
// LOGIN
// =====================================

signInAnonymously(
  auth
).catch(
  error => {

    showError(error);

  }
);
