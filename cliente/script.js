const BASE_URL = "";

let datos;
let respostesUsuari = Array(10).fill(null);

gestionarNom();
carregarPartida();

function gestionarNom() {
    let nom = sessionStorage.getItem("nombre");
    if (!nom || !nom.trim()) {
        nom = prompt("Introdueix el teu nom / Introduce tu nombre:");
        if (!nom || !nom.trim()) {
            nom = "Jugador";
        }
        sessionStorage.setItem("nombre", nom.trim());
    }
    mostrarNom();
}

function mostrarNom() {
    const nom = sessionStorage.getItem("nombre") || "Jugador";
    const el = document.getElementById("nomUsuariText");
    if (el) {
        el.textContent = nom;
    }
}

function canviarNom() {
    const nomActual = sessionStorage.getItem("nombre") || "";
    const nouNom = prompt("Introdueix el nou nom / Introduce el nuevo nombre:", nomActual);
    if (nouNom !== null && nouNom.trim() !== "") {
        sessionStorage.setItem("nombre", nouNom.trim());
        mostrarNom();
    }
}

function carregarPartida() {
    respostesUsuari = Array(10).fill(null);

    document.getElementById("progres").value = 0;
    document.getElementById("progresText").textContent = "Preguntes respostes: 0 de 10";
    document.getElementById("enviarResultats").disabled = true;
    document.getElementById("panellResultat").classList.add("hidden");
    document.getElementById("partida").innerHTML = "";

    fetch(`${BASE_URL}/preguntas`)
        .then(res => res.json())
        .then(data => {
            datos = data;
            mostrarPreguntes();
        });
}

function mostrarPreguntes() {
    let html = "";

    datos.preguntes.forEach((pregunta, index) => {
        html += `
            <div class="pregunta">
                <h2>${index + 1}. ${pregunta.pregunta}</h2>
                <img src="${pregunta.imatge}" alt="Bandera" width="200">
        `;

        pregunta.respostes.forEach((resposta, opcio) => {
            html += `
                <label class="opcio">
                    <input
                        type="radio"
                        name="pregunta${index}"
                        onchange="responder(${index}, ${opcio})"
                    >
                    ${resposta}
                </label>
            `;
        });

        html += "</div>";
    });

    document.getElementById("partida").innerHTML = html;
}

function responder(index, opcio) {
    respostesUsuari[index] = opcio;

    let contestades = respostesUsuari.filter(r => r !== null).length;

    document.getElementById("progres").value = contestades;
    document.getElementById("progresText").textContent =
        `Preguntes respostes: ${contestades} de 10`;

    document.getElementById("enviarResultats").disabled =
        contestades !== 10;
}

function enviar() {
    fetch(`${BASE_URL}/respostas?sessionId=${datos.sessionId}`)
        .then(res => res.json())
        .then(data => {
            let encerts = 0;

            datos.preguntes.forEach((pregunta, index) => {
                let correcta = data.respostes.find(
                    resposta => resposta.id === pregunta.id
                );
                if (respostesUsuari[index] === correcta.resposta_correcta) {
                    encerts++;
                }
            });

            mostrarAnimacio(encerts);
        });
}

function mostrarAnimacio(encerts) {
    const panell = document.getElementById("panellResultat");
    const emoji  = document.getElementById("animacioEmoji");
    const missatge = document.getElementById("missatgeResultat");
    const nom = sessionStorage.getItem("nombre") || "Jugador";

    panell.className = "hidden";

    if (encerts <= 3) {
        emoji.textContent = "😢";
        missatge.textContent = `${nom}, has encertat ${encerts} de 10. No et rendeixis!`;
        panell.dataset.nivell = "dolent";
    } else if (encerts <= 6) {
        emoji.textContent = "😊";
        missatge.textContent = `${nom}, has encertat ${encerts} de 10. No esta malament!`;
        panell.dataset.nivell = "regular";
    } else if (encerts <= 9) {
        emoji.textContent = "🎉";
        missatge.textContent = `${nom}, has encertat ${encerts} de 10. Molt be!`;
        panell.dataset.nivell = "be";
    } else {
        emoji.textContent = "🏆";
        missatge.textContent = `Molt bé, ${nom}! Has encertat 10 de 10. Perfecte!`;
        panell.dataset.nivell = "perfecte";
    }

    // Petita pausa per reiniciar l'animacio si ja estava visible
    setTimeout(() => {
        panell.classList.remove("hidden");
    }, 50);
}

function reiniciar() {
    carregarPartida();
}

function tornarJugar() {
    carregarPartida();
}