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

const mi6Schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    success: { type: "boolean" },
    image_analysis: {
      type: "object",
      additionalProperties: false,
      properties: {
        trend: { type: "string", enum: ["up", "down", "sideways"] },
        structure_summary: { type: "string" },
        pattern_detected: { type: "string" },
        notes: { type: "string" }
      },
      required: ["trend", "structure_summary", "pattern_detected", "notes"]
    },
    mi6: {
      type: "object",
      additionalProperties: false,
      properties: {
        candlestick: { type: "integer", enum: [0, 1] },
        chartpattern: { type: "integer", enum: [0, 1] },
        wave: { type: "integer", enum: [0, 1] },
        ma: { type: "integer", enum: [0, 1] },
        bb: { type: "integer", enum: [0, 1] },
        fibo: { type: "integer", enum: [0, 1] }
      },
      required: ["candlestick", "chartpattern", "wave", "ma", "bb", "fibo"]
    },
    filters: {
      type: "object",
      additionalProperties: false,
      properties: {
        structural: { type: "string", enum: ["yes", "no"] },
        isolated: { type: "string", enum: ["yes", "no"] },
        session: { type: "string", enum: ["asia", "london", "newyork", "overlap"] },
        atr: { type: "string", enum: ["low", "normal", "high"] }
      },
      required: ["structural", "isolated", "session", "atr"]
    },
    audit: {
      type: "object",
      additionalProperties: false,
      properties: {
        trigger: { type: "string", enum: ["yes", "no"] },
        keyzone: { type: "string", enum: ["yes", "no"] },
        trapzone: { type: "string", enum: ["yes", "no"] }
      },
      required: ["trigger", "keyzone", "trapzone"]
    },
    analysis_text: { type: "string" },
    suggested_result: {
      type: "string",
      enum: ["STRONG TRADE", "TRADE", "WATCH", "NO TRADE", "BLOCK"]
    }
  },
  required: [
    "success",
    "image_analysis",
    "mi6",
    "filters",
    "audit",
    "analysis_text",
    "suggested_result"
  ]
};

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

Analyze the uploaded trading chart image using MI6 six-point scoring.

MI6 rules:
1. Candlestick Pattern = clear candle trigger.
2. Chart Pattern = clear channel, triangle, breakout, support/resistance, reversal or continuation structure.
3. Wave = visible wave structure aligned with selected direction.
4. MA = moving average supports selected direction.
5. Bollinger Band = price position supports selected direction.
6. Fibo = price near meaningful retracement/extension zone.

Be conservative.
If unclear, score 0.
If selected direction conflicts with trend, structural = "no".
If no clear trigger, trigger = "no".
analysis_text must be Chinese, concise, practical.
`;

    const response = await client.responses.parse({
      model: "gpt-4.1-mini",
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
      ],
      text: {
        format: {
          type: "json_schema",
          name: "mi6_result",
          schema: mi6Schema,
          strict: true
        }
      }
    });

   const data = response.output_parsed;

if (!data) {
  console.error("AI parsed output empty:", JSON.stringify(response, null, 2));
  return res.json(fallbackResult("AI解析为空，使用保底分析"));
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
