const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql2/promise");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = Number(process.argv[2]) || 30200;

app.use(cors());
app.use(express.json());
const sessions = {};

const conexion = mysql.createPool({
    host: "localhost",
    user: "a22jorrocdom_a22jorrocdom",
    password: "+Q0}!N6qYD2UBiFG",
    database: "a22jorrocdom_tr0daw",
});

const publicFolder = fs.existsSync(path.join(__dirname, "..", "public_html"))
    ? path.join(__dirname, "..", "public_html")
    : path.join(__dirname, "..", "cliente");

app.use(express.static(publicFolder));

app.get("/preguntas", async (req, res) => {

    const [filas] = await conexion.query(`
        SELECT p.id, p.pregunta, p.imatge,
               o.posicio, o.text, o.es_correcta
        FROM (SELECT id FROM preguntes ORDER BY RAND() LIMIT 10) AS aleatori
        JOIN preguntes p ON p.id = aleatori.id
        JOIN opcions   o ON o.pregunta_id = p.id
        ORDER BY RAND(), o.posicio
    `);

    const preguntas = {};
    for (const fila of filas) {
        if (!preguntas[fila.id]) {
            preguntas[fila.id] = {
                id: fila.id,
                pregunta: fila.pregunta,
                imatge: fila.imatge,
                opcions: [],
                resposta_correcta: null,
            };
        }
        preguntas[fila.id].opcions.push(fila.text);
        if (fila.es_correcta) {
            preguntas[fila.id].resposta_correcta = preguntas[fila.id].opcions.length - 1;
        }
    }

    const seleccio = Object.values(preguntas);

    const sessionId = uuidv4();
    sessions[sessionId] = seleccio;

    const preguntesClient = [];
    for (const p of seleccio) {
        preguntesClient.push({
            id: p.id,
            pregunta: p.pregunta,
            imatge: p.imatge,
            respostes: p.opcions,
        });
    }

    res.json({ sessionId, preguntes: preguntesClient });
});

app.get("/respostas", (req, res) => {

    const sessionId = req.query.sessionId;
    const partida = sessions[sessionId];

    if (!partida) {
        res.status(404).json({ error: "Sessio no trobada" });
        return;
    }

    const respostes = [];
    for (const p of partida) {
        respostes.push({
            id: p.id,
            resposta_correcta: p.resposta_correcta,
        });
    }

    res.json({ respostes });
});

app.get("/pregunta/list", async (req, res) => {
    const [preguntes] = await conexion.query("SELECT * FROM preguntes ORDER BY id");
    const [opcions] = await conexion.query("SELECT * FROM opcions ORDER BY pregunta_id, posicio");

    for (const p of preguntes) {
        p.opcions = opcions.filter(o => o.pregunta_id === p.id);
    }

    res.json({ preguntes });
});

app.post("/pregunta/create", async (req, res) => {
    const { pregunta, imatge } = req.body;
    const [result] = await conexion.query(
        "INSERT INTO preguntes (pregunta, imatge) VALUES (?, ?)",
        [pregunta, imatge]
    );
    res.json({ id: result.insertId });
});

app.put("/pregunta/update", async (req, res) => {
    const { id, pregunta, imatge } = req.body;
    await conexion.query(
        "UPDATE preguntes SET pregunta = ?, imatge = ? WHERE id = ?",
        [pregunta, imatge, id]
    );
    res.json({ ok: true });
});

app.delete("/pregunta/delete", async (req, res) => {
    const { id } = req.body;
    await conexion.query("DELETE FROM preguntes WHERE id = ?", [id]);
    res.json({ ok: true });
});

// ── CRUD opcions ──────────────────────────────────────────────────────────────

app.post("/opcio/create", async (req, res) => {
    const { pregunta_id, posicio, text, es_correcta } = req.body;
    const [result] = await conexion.query(
        "INSERT INTO opcions (pregunta_id, posicio, text, es_correcta) VALUES (?, ?, ?, ?)",
        [pregunta_id, posicio, text, es_correcta ? 1 : 0]
    );
    res.json({ id: result.insertId });
});

app.put("/opcio/update", async (req, res) => {
    const { id, text, es_correcta } = req.body;
    await conexion.query(
        "UPDATE opcions SET text = ?, es_correcta = ? WHERE id = ?",
        [text, es_correcta ? 1 : 0, id]
    );
    res.json({ ok: true });
});

app.delete("/opcio/delete", async (req, res) => {
    const { id } = req.body;
    await conexion.query("DELETE FROM opcions WHERE id = ?", [id]);
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log("Servidor arrancat al port " + PORT);
});