import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MI6 AI Backend is running");
});

function safeJsonParse(text) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

app.post("/api/analyze-chart", upload.single("image"), async (req, res) => {
  try {
    const direction = req.body.direction || "BUY";
    const symbol = req.body.symbol || "";
    const timeframe = req.body.timeframe || "";
    const imageBase64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/png";

    const prompt = `
You are MI6 Trading Chart Analyzer.

User selected direction: ${direction}
Symbol: ${symbol || "unknown"}
Timeframe: ${timeframe || "unknown"}

Analyze the uploaded trading chart image.

Return ONLY valid JSON. No markdown.

Use this exact JSON structure:
{
  "success": true,
  "image_analysis": {
    "trend": "up | down | sideways",
    "structure_summary": "short summary",
    "pattern_detected": "short pattern name",
    "notes": "short notes"
  },
  "mi6": {
    "candlestick": 0,
    "chartpattern": 0,
    "wave": 0,
    "ma": 0,
    "bb": 0,
    "fibo": 0
  },
  "filters": {
    "structural": "yes | no",
    "isolated": "yes | no",
    "session": "asia | london | newyork | overlap",
    "atr": "low | normal | high"
  },
  "audit": {
    "trigger": "yes | no",
    "keyzone": "yes | no",
    "trapzone": "yes | no"
  },
  "analysis_text": "Chinese explanation for user",
  "suggested_result": "STRONG TRADE | TRADE | WATCH | NO TRADE | BLOCK"
}

MI6 scoring rules:
1. Candlestick Pattern = clear candle trigger.
2. Chart Pattern = clear channel, triangle, breakout, support/resistance, reversal or continuation structure.
3. Wave = visible wave structure aligned with user direction.
4. MA = moving average supports user direction.
5. Bollinger Band = price position supports user direction.
6. Fibo = price near meaningful fibo zone or fibo extension/retracement supports user direction.

Important:
- Be conservative.
- If chart is unclear, set uncertain items to 0.
- If selected direction conflicts with trend, structural = "no".
- If no clear trigger, audit.trigger = "no".
- If price is too close to obvious trap/resistance/support against the selected direction, trapzone = "yes".
- analysis_text must be in Chinese, concise, practical, and explain why.
`;

    const response = await client.responses.create({
      model: "gpt-5.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${imageBase64}`
            }
          ]
        }
      ]
    });

  const text = response.output_text;

console.log("AI RAW RESPONSE:", text);

let data;

try {
  data = safeJsonParse(text);
} catch (err) {
  console.error("JSON parse failed:", text);

  return res.json({
    success: true,
    fallback: true,
    analysis_text: "AI返回格式异常，使用保底结果",
    mi6: {
      candlestick: 0,
      chartpattern: 0,
      wave: 0,
      ma: 0,
      bb: 0,
      fibo: 0
    },
    suggested_result: "NO TRADE"
  });
}

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "AI chart analysis failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MI6 AI backend running on port ${PORT}`);
});
