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

function fallbackResult(reason = "AI暂时不可用，使用系统保底分析") {
  return {
    success: true,
    fallback: true,
    image_analysis: {
      trend: "sideways",
      structure_summary: "AI fallback mode",
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

Return ONLY pure JSON. No markdown. No explanation outside JSON.

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

Rules:
- Be conservative.
- If unclear, score uncertain items as 0.
- If selected direction conflicts with trend, structural = "no".
- If no clear trigger, audit.trigger = "no".
- analysis_text must be Chinese, concise, and practical.
`;

    const response = await client.responses.create({
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
      return res.json(fallbackResult("AI没有返回内容，使用保底结果"));
    }

    console.log("AI RAW RESPONSE:", text);

    let data;

    try {
      data = safeJsonParse(text);
    } catch (err) {
      console.error("JSON parse failed:", text);
      return res.json(fallbackResult("AI返回格式异常，使用保底结果"));
    }

    return res.json(data);
  } catch (error) {
    console.error("AI chart analysis failed:", error);

    if (error.code === "insufficient_quota") {
      return res.json(fallbackResult("AI额度不足，使用系统保底分析"));
    }

    return res.status(500).json({
      success: false,
      error: "AI chart analysis failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MI6 AI backend running on port ${PORT}`);
});
