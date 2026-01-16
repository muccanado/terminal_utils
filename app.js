const OWNER = "muccanado";
const REPO = "terminal_utils";
const WORKFLOW = "save-command.yml";

let lastCommand = "";

/* ================= TOKEN ================= */

function getToken() {
  let token = sessionStorage.getItem("gh_token");

  if (!token) {
    token = prompt("Inserisci GitHub Token (scope: workflow)");
    if (!token) return null;
    sessionStorage.setItem("gh_token", token);
  }

  return token;
}

/* ================= HISTORY ================= */

async function loadHistory() {
  const urlsToTry = [
    "./history.json",                          // stesso livello (docs/)
    "../history.json",                         // root repo
    "/terminal_utils/history.json"             // path assoluto Pages
  ];

  let text = null;

  for (const url of urlsToTry) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;

      const t = await res.text();
      if (!t || !t.trim()) continue;

      text = t;
      break;
    } catch {
      // prova il prossimo
    }
  }

  if (!text) {
    console.warn("history.json non trovato o vuoto");
    return;
  }

  let data;
  try {
    data = JSON.parse(text);
    if (!Array.isArray(data)) data = [];
  } catch {
    console.warn("history.json non valido");
    data = [];
  }

  const ul = document.getElementById("history");
  ul.innerHTML = "";

  data.slice(-5).reverse().forEach(h => {
  const li = document.createElement("li");
  li.textContent = `${h.timestamp} → ${h.command} `;

  const btn = document.createElement("button");
  btn.textContent = "❌";
  btn.onclick = () => deleteRecord(h.timestamp);

  li.appendChild(btn);
  ul.appendChild(li);
});

}

/* ================= COMMAND BUILDER ================= */

function build() {
  const type = document.getElementById("type").value;
  const p1 = document.getElementById("p1").value;
  const p2 = document.getElementById("p2").value;

  switch (type) {
    case "wakeonlan":
      lastCommand = `wakeonlan ${p1} -i ${p2}`;
      break;
    case "copy":
      lastCommand = `cp "${p1}" "${p2}"`;
      break;
    case "delete":
      lastCommand = `rm -rf "${p1}"`;
      break;
  }

  document.getElementById("output").textContent = lastCommand;
}

/* ================= SAVE ================= */

async function save() {
  if (!lastCommand) {
    alert("Nessun comando da salvare");
    return;
  }

  const token = getToken();
  if (!token) return;

  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          command: lastCommand
        }
      })
    }
  );

  if (!res.ok) {
    alert("Errore GitHub: " + res.status);
    return;
  }

  alert("Comando salvato");
}

/* ================= INIT ================= */

loadHistory();
