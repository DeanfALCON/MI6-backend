import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MI6 AI Backend is running");
});

function fallbackResult(reason = "AI暂时不可用，使用系统保底分析") {
  return {
    success: true,
    fallback: true,
    image_analysis: {
      trend: "sideways",
      structure_summary: "Fallback mode",
      pattern_detected: "unknown",
      notes: reason
    },
    mi6: {
      candlestick: 0,
      chartpattern: 0,
      wave: 0,
      ma: 0,
      bb: 0,
      fibo: 0
    },
    filters: {
      structural: "no",
      isolated: "yes",
      session: "overlap",
      atr: "normal"
    },
    audit: {
      trigger: "no",
      keyzone: "no",
      trapzone: "yes"
    },
    analysis_text: reason,
    suggested_result: "NO TRADE"
  };
}

function safeJsonParse(text) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found");
  }

  const jsonOnly = cleaned.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonOnly);
}

app.post("/api/analyze-chart", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image uploaded"
      });
    }

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

Return ONLY pure JSON.
Do NOT use markdown.
Do NOT add explanation outside JSON.

Use this exact JSON structure:

{
  "success": true,
  "image_analysis": {
    "trend": "up",
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
    "structural": "yes",
    "isolated": "no",
    "session": "overlap",
    "atr": "normal"
  },
  "audit": {
    "trigger": "yes",
    "keyzone": "yes",
    "trapzone": "no"
  },
  "analysis_text": "Chinese explanation for user",
  "suggested_result": "WATCH"
}

Allowed values:
trend: up, down, sideways
mi6 values: 0 or 1 only
structural: yes or no
isolated: yes or no
session: asia, london, newyork, overlap
atr: low, normal, high
trigger: yes or no
keyzone: yes or no
trapzone: yes or no
suggested_result: STRONG TRADE, TRADE, WATCH, NO TRADE, BLOCK

MI6 scoring rules:
1. Candlestick Pattern = clear candle trigger.
2. Chart Pattern = clear channel, triangle, breakout, support/resistance, reversal or continuation structure.
3. Wave = visible wave structure aligned with user direction.
4. MA = moving average supports user direction.
5. Bollinger Band = price position supports user direction.
6. Fibo = price near meaningful fibo zone or fibo extension/retracement supports user direction.

Important:
- Be conservative.
- If chart is unclear, score uncertain items as 0.
- If selected direction conflicts with trend, structural = "no".
- If no clear trigger, audit.trigger = "no".
- If price is close to trap zone, resistance, or support against the selected direction, trapzone = "yes".
- analysis_text must be Chinese, concise, practical, and explain why.
`;

    const response = await client.responses.create({
  model: "gpt-4.1-mini",

  response_format: {
    type: "json_schema",
    json_schema: {
      name: "mi6_result",
      schema: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          image_analysis: {
            type: "object",
            properties: {
              trend: { type: "string" },
              structure_summary: { type: "string" },
              pattern_detected: { type: "string" },
              notes: { type: "string" }
            },
            required: ["trend"]
          },
          mi6: {
            type: "object",
            properties: {
              candlestick: { type: "number" },
              chartpattern: { type: "number" },
              wave: { type: "number" },
              ma: { type: "number" },
              bb: { type: "number" },
              fibo: { type: "number" }
            }
          },
          filters: { type: "object" },
          audit: { type: "object" },
          analysis_text: { type: "string" },
          suggested_result: { type: "string" }
        },
        required: ["success", "mi6"]
      }
    }
  },

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

    let text = "";

    if (response.output_text) {
      text = response.output_text;
    } else if (
      response.output &&
      response.output[0] &&
      response.output[0].content &&
      response.output[0].content[0]
    ) {
      const content = response.output[0].content[0];
      text = content.text || content.text?.value || "";
    }

    if (!text) {
      console.error("AI empty response:", response);
      return res.json(fallbackResult("AI没有返回内容，使用保底分析"));
    }

    console.log("AI RAW RESPONSE:", text);

    let data;

    try {
      data = safeJsonParse(text);
    } catch (err) {
      console.error("JSON parse failed:", text);
      return res.json(fallbackResult("AI返回格式异常，使用保底分析"));
    }

    return res.json(data);
  } catch (error) {
    console.error("AI chart analysis failed:", error);

    if (error.code === "insufficient_quota") {
      return res.json(fallbackResult("AI额度不足，使用系统保底分析"));
    }

    if (error.code === "model_not_found") {
      return res.json(fallbackResult("AI模型不存在，请检查 model 名称"));
    }

    return res.json(fallbackResult("AI请求失败，使用系统保底分析"));
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MI6 AI backend running on port ${PORT}`);
});
