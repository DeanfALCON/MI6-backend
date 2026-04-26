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

Analyze the uploaded trading chart image.

Return a conservative MI6 trading analysis.

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
- analysis_text must be Chinese, concise, practical, and explain why.
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
      ],
      text: {
        format: {
          type: "json_schema",
          name: "mi6_chart_analysis",
          schema: mi6Schema,
          strict: true
        }
      }
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
      return res.status(500).json({
        success: false,
        error: "AI empty response"
      });
    }

    console.log("AI RAW RESPONSE:", text);

    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error("AI chart analysis failed:", error);

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
