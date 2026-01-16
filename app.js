const OWNER = "TUO_USERNAME";
const REPO = "TUO_REPO";
const WORKFLOW = "save-command.yml";

let lastCommand = "";

async function loadHistory() {
  const res = await fetch("./history.json");
  const data = await res.json();
  const ul = document.getElementById("history");
  ul.innerHTML = "";
  data.slice(-5).reverse().forEach(h => {
    const li = document.createElement("li");
    li.textContent = `${h.timestamp} → ${h.command}`;
    ul.appendChild(li);
  });
}

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

async function save() {
  if (!lastCommand) return alert("Nessun comando");

  await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": "Bearer " + prompt("Inserisci token GitHub"),
    },
    body: JSON.stringify({
      ref: "main",
      inputs: {
        command: lastCommand
      }
    })
  });

  alert("Comando salvato");
}

loadHistory();
