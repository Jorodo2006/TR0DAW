function obrirAdmin() {
    document.getElementById("modalOverlay").classList.remove("hidden");
    carregarPreguntes();
}

function tancarAdmin(event) {
    if (event && event.target !== document.getElementById("modalOverlay")) return;
    document.getElementById("modalOverlay").classList.add("hidden");
}

async function carregarPreguntes() {
    const res  = await fetch(`${BASE_URL}/pregunta/list`);
    const data = await res.json();

    const contenidor = document.getElementById("llistaPreguntesAdmin");
    contenidor.innerHTML = "";

    for (const p of data.preguntes) {
        contenidor.innerHTML += construirTarjetaPregunta(p);
    }
}

function construirTarjetaPregunta(p) {
    let opcionsHtml = "";
    for (const o of p.opcions) {
        opcionsHtml += `
            <div class="fila-opcio" id="opcio-${o.id}">
                <input type="text" value="${o.text}" id="textOpcio-${o.id}"
                       onblur="guardarOpcio(${o.id})">
                <label>
                    <input type="radio" name="correcta-${p.id}" id="correctaOpcio-${o.id}"
                           ${o.es_correcta ? "checked" : ""}
                           onchange="guardarOpcio(${o.id})">
                    Correcta
                </label>
                <button onclick="esborrarOpcio(${o.id}, ${p.id})">🗑</button>
            </div>
        `;
    }

    return `
        <div class="targeta-pregunta" id="pregunta-${p.id}">
            <div class="cap-pregunta">
                <input type="text" value="${p.pregunta}" id="textPregunta-${p.id}">
                <input type="text" value="${p.imatge || ""}" id="imatgePregunta-${p.id}" placeholder="URL imatge">
                <button onclick="guardarPregunta(${p.id})">💾</button>
                <button onclick="esborrarPregunta(${p.id})">🗑</button>
            </div>
            <div class="opcions-pregunta">
                ${opcionsHtml}
                <button class="btn-afegir-opcio" onclick="afegirOpcio(${p.id})">+ Opcio</button>
            </div>
        </div>
    `;
}


async function crearPregunta() {
    const pregunta = document.getElementById("inputPregunta").value.trim();
    const imatge   = document.getElementById("inputImatge").value.trim();

    if (!pregunta) return;

    await fetch(`${BASE_URL}/pregunta/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, imatge })
    });

    document.getElementById("inputPregunta").value = "";
    document.getElementById("inputImatge").value   = "";

    carregarPreguntes();
}

async function guardarPregunta(id) {
    const pregunta = document.getElementById(`textPregunta-${id}`).value.trim();
    const imatge   = document.getElementById(`imatgePregunta-${id}`).value.trim();

    await fetch(`${BASE_URL}/pregunta/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pregunta, imatge })
    });
}

async function esborrarPregunta(id) {
    if (!confirm("Segur que vols esborrar aquesta pregunta?")) return;

    await fetch(`${BASE_URL}/pregunta/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });

    carregarPreguntes();
}

async function afegirOpcio(pregunta_id) {

    const contenidor = document.getElementById(`pregunta-${pregunta_id}`);
    const numOpcions = contenidor.querySelectorAll(".fila-opcio").length;

    await fetch(`${BASE_URL}/opcio/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            pregunta_id,
            posicio: numOpcions,
            text: "Nova opcio",
            es_correcta: false
        })
    });

    carregarPreguntes();
}

async function guardarOpcio(id) {
    const text       = document.getElementById(`textOpcio-${id}`).value.trim();
    const es_correcta = document.getElementById(`correctaOpcio-${id}`).checked;

    await fetch(`${BASE_URL}/opcio/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, text, es_correcta })
    });
}

async function esborrarOpcio(id, pregunta_id) {
    await fetch(`${BASE_URL}/opcio/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });

    carregarPreguntes();
}
