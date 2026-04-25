import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MI6 Backend is running");
});

app.post("/api/analyze-chart", upload.single("image"), async (req, res) => {
  try {
    const direction = req.body.direction || "BUY";
    const symbol = req.body.symbol || "";
    const timeframe = req.body.timeframe || "";

    const isBuy = direction === "BUY";

    const result = {
      success: true,
      image_analysis: {
        trend: isBuy ? "up" : "down",
        structure_summary: isBuy ? "回调后继续偏多" : "反弹后继续偏空",
        pattern_detected: isBuy ? "bullish_channel" : "bearish_channel",
        notes: isBuy
          ? "价格整体偏多，结构有延续机会。"
          : "价格整体偏空，结构有延续机会。"
      },
      mi6: isBuy
        ? {
            candlestick: 1,
            chartpattern: 1,
            wave: 1,
            ma: 1,
            bb: 0,
            fibo: 1
          }
        : {
            candlestick: 1,
            chartpattern: 1,
            wave: 1,
            ma: 1,
            bb: 1,
            fibo: 0
          },
      filters: {
        structural: "yes",
        isolated: "no",
        session: isBuy ? "overlap" : "london",
        atr: "normal"
      },
      audit: {
        trigger: "yes",
        keyzone: "yes",
        trapzone: "no"
      },
      analysis_text: isBuy
        ? `AI 模拟分析：${symbol || "该图表"} ${timeframe || ""} 偏向上升趋势回调结构，BUY 方向与趋势一致。`
        : `AI 模拟分析：${symbol || "该图表"} ${timeframe || ""} 偏向下降趋势反弹结构，SHORT 方向与趋势一致。`,
      suggested_result: "TRADE"
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Analyze failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`MI6 backend running on port ${PORT}`);
});
