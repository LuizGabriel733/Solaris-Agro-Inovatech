const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let sensorData = {
  sensorConectado: true,
  temperatura: 31,
  umidade: 68,
  uv: 8,
  atualizadoEm: new Date().toISOString()
};

app.get("/sensor", (req, res) => {
  res.json(sensorData);
});

app.post("/sensor", (req, res) => {
  const { sensorConectado, temperatura, umidade, uv } = req.body;

  sensorData = {
    sensorConectado: sensorConectado ?? sensorData.sensorConectado,
    temperatura: temperatura ?? sensorData.temperatura,
    umidade: umidade ?? sensorData.umidade,
    uv: uv ?? sensorData.uv,
    atualizadoEm: new Date().toISOString()
  };

  res.json({
    mensagem: "Dados do sensor atualizados",
    dados: sensorData
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});