const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const historicoPath = path.join(__dirname, "sensorHistorico.json");

let sensorData = {
  sensorConectado: true,
  temperatura: 31,
  umidade: 68,
  uv: 8,
  atualizadoEm: new Date().toISOString()
};

let historicoSensor = [];

// Carrega o histórico salvo quando a API iniciar
if (fs.existsSync(historicoPath)) {
  try {
    const dadosSalvos = fs.readFileSync(historicoPath, "utf-8");

    historicoSensor = JSON.parse(dadosSalvos);

    if (historicoSensor.length > 0) {
      sensorData = historicoSensor[historicoSensor.length - 1];
    }
  } catch (error) {
    console.log("Erro ao carregar histórico:", error);
    historicoSensor = [];
  }
}

// Salva o histórico no arquivo JSON
function salvarHistorico() {
  fs.writeFileSync(
    historicoPath,
    JSON.stringify(historicoSensor, null, 2)
  );
}

// Rota inicial para testar a API
app.get("/", (req, res) => {
  res.json({
    mensagem: "API Solaris Agro funcionando",
    rotas: {
      sensorAtual: "GET /sensor",
      atualizarSensor: "POST /sensor",
      historico: "GET /sensor/historico",
      simularHistorico: "POST /sensor/simular",
      limparHistorico: "DELETE /sensor/historico"
    }
  });
});

// Rota para pegar o dado atual do sensor
app.get("/sensor", (req, res) => {
  res.json(sensorData);
});

// Rota para atualizar os dados reais do sensor
app.post("/sensor", (req, res) => {
  const { sensorConectado, temperatura, umidade, uv } = req.body;

  sensorData = {
    sensorConectado: sensorConectado ?? sensorData.sensorConectado,
    temperatura: temperatura ?? sensorData.temperatura,
    umidade: umidade ?? sensorData.umidade,
    uv: uv ?? sensorData.uv,
    atualizadoEm: new Date().toISOString()
  };

  historicoSensor.push(sensorData);

  if (historicoSensor.length > 100) {
    historicoSensor = historicoSensor.slice(-100);
  }

  salvarHistorico();

  res.json({
    mensagem: "Dados do sensor atualizados",
    dados: sensorData
  });
});

// Rota para pegar o histórico completo
app.get("/sensor/historico", (req, res) => {
  res.json({
    total: historicoSensor.length,
    dados: historicoSensor
  });
});

// Rota para limpar o histórico
app.delete("/sensor/historico", (req, res) => {
  historicoSensor = [];
  salvarHistorico();

  res.json({
    mensagem: "Histórico apagado com sucesso"
  });
});

// Rota para gerar dados falsos das 06h até 18h
app.post("/sensor/simular", (req, res) => {
  const hoje = new Date();

  const horariosUv = [
    { hora: 6, uv: 1 },
    { hora: 7, uv: 2 },
    { hora: 8, uv: 4 },
    { hora: 9, uv: 6 },
    { hora: 10, uv: 8 },
    { hora: 11, uv: 10 },
    { hora: 12, uv: 11 },
    { hora: 13, uv: 10 },
    { hora: 14, uv: 8 },
    { hora: 15, uv: 6 },
    { hora: 16, uv: 4 },
    { hora: 17, uv: 2 },
    { hora: 18, uv: 1 }
  ];

  historicoSensor = horariosUv.map((item) => {
    const data = new Date(hoje);
    data.setHours(item.hora, 0, 0, 0);

    const variacao = Math.floor(Math.random() * 3) - 1;
    const uvFinal = Math.max(0, item.uv + variacao);

    return {
      sensorConectado: true,
      temperatura: Math.floor(Math.random() * 6) + 29,
      umidade: Math.floor(Math.random() * 16) + 60,
      uv: uvFinal,
      atualizadoEm: data.toISOString()
    };
  });

  sensorData = historicoSensor[historicoSensor.length - 1];

  salvarHistorico();

  res.json({
    mensagem: "Histórico UV das 06:00 até 18:00 gerado com sucesso",
    total: historicoSensor.length,
    sensorAtual: sensorData,
    historico: historicoSensor
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});