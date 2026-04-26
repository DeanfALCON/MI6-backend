<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MI6 v3.4 Semi-Auto Assistant</title>
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Arial, "Microsoft YaHei", sans-serif;
      background: #070b13;
      color: #eef3ff;
    }

    .wrap {
      max-width: 1220px;
      margin: 0 auto;
      padding: 24px 16px 60px;
    }

    .topbar,
    .hero,
    .panel,
    .terminal,
    .box {
      border: 1px solid #34415f;
      border-radius: 18px;
      background: #101827;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .brand { display: flex; align-items: center; gap: 12px; }

    .logo {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #8da7ff, #b27dff);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      color: white;
    }

    .brand-title { font-size: 18px; font-weight: 900; }
    .brand-sub { color: #9fb0d1; font-size: 13px; margin-top: 4px; }

    .debug {
      padding: 10px 14px;
      border-radius: 999px;
      border: 1px solid #34415f;
      background: #172236;
      color: #dce6ff;
      font-size: 13px;
      white-space: nowrap;
    }

    .hero { padding: 26px; margin-bottom: 16px; }
    h1 { margin: 0 0 10px; font-size: 42px; line-height: 1.1; }
    .sub { color: #9fb0d1; line-height: 1.7; margin: 0; }

    .layout { display: grid; grid-template-columns: minmax(0, 1fr) 420px; gap: 16px; }
    .panel, .terminal { padding: 18px; }
    h2 { margin: 0 0 16px; }

    .section {
      border: 1px solid #34415f;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 16px;
      background: #0c1322;
    }

    .section-head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
    .section-head strong { font-size: 17px; }
    .section-head span { color: #9fb0d1; font-size: 13px; }

    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

    label { display: block; font-weight: 800; color: #dce6ff; margin-bottom: 8px; font-size: 14px; }
    input, select, textarea, button { font-family: inherit; }

    input[type="text"], select, textarea, input[type="file"] {
      width: 100%; border: 1px solid #34415f; border-radius: 12px; background: #172236;
      color: #eef3ff; padding: 12px; font-size: 15px;
    }

    textarea { min-height: 92px; resize: vertical; }

    .preview {
      width: 100%; max-height: 300px; object-fit: contain; border: 1px solid #34415f;
      border-radius: 14px; background: #05070d; margin-top: 12px; display: none;
    }

    .btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    button {
      border: 1px solid #34415f; border-radius: 12px; background: #172236; color: #eef3ff;
      padding: 13px 14px; font-size: 15px; font-weight: 900; cursor: pointer; min-height: 48px;
    }
    button:hover { filter: brightness(1.08); }

    .active-buy { background: rgba(25,195,125,.20) !important; border-color: #19c37d !important; color: #dff8ee !important; }
    .active-short { background: rgba(239,68,68,.20) !important; border-color: #ef4444 !important; color: #ffe7e7 !important; }
    .active-yes { background: rgba(25,195,125,.20) !important; border-color: #19c37d !important; color: #dff8ee !important; }
    .active-no { background: rgba(239,68,68,.20) !important; border-color: #ef4444 !important; color: #ffe7e7 !important; }

    .primary { background: linear-gradient(135deg, #8da7ff, #6a82ff, #b27dff); color: white; border: none; }
    .secondary { background: #1c2538; }
    .gold { background: linear-gradient(135deg, #f5b942, #d58b1f); color: #160f03; border: none; }

    .analysis-card { border: 1px solid #34415f; border-radius: 14px; padding: 14px; background: #111b2c; }
    .analysis-card h3 { margin: 0 0 6px; font-size: 15px; }
    .analysis-card p { color: #9fb0d1; font-size: 13px; line-height: 1.5; margin: 0 0 12px; }

    .suggestion {
      margin-top: 10px; padding: 10px; border-radius: 12px; background: rgba(141,167,255,.08);
      border: 1px solid rgba(141,167,255,.22); color: #c9d6ff; font-size: 12px; line-height: 1.55;
    }
    .suggestion.good { background: rgba(25,195,125,.08); border-color: rgba(25,195,125,.25); color: #dff8ee; }
    .suggestion.warn { background: rgba(245,185,66,.08); border-color: rgba(245,185,66,.25); color: #fff3d6; }
    .suggestion.bad { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.25); color: #ffe7e7; }

    .status-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    .chip { padding: 8px 10px; border: 1px solid #34415f; border-radius: 999px; background: #172236; font-size: 13px; color: #dce6ff; }

    .badge {
      display: inline-flex; align-items: center; justify-content: center; padding: 10px 14px; min-width: 118px;
      border-radius: 999px; font-weight: 900; font-size: 13px; border: 1px solid #ef4444;
      background: rgba(239,68,68,.18); color: #ffe7e7;
    }
    .badge.strong { border-color: #19c37d; background: rgba(25,195,125,.18); color: #dff8ee; }
    .badge.trade { border-color: #3daeff; background: rgba(61,174,255,.18); color: #e2f3ff; }
    .badge.watch { border-color: #f5b942; background: rgba(245,185,66,.18); color: #fff3d6; }
    .badge.block { border-color: #ef4444; background: rgba(239,68,68,.18); color: #ffe7e7; }

    .terminal-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px; }
    .small { color: #9fb0d1; font-size: 12px; line-height: 1.6; margin-bottom: 12px; word-break: break-word; }

    .score-box { border: 1px solid #34415f; border-radius: 16px; padding: 18px; background: #0c1322; margin-bottom: 14px; }
    .score-head { display: flex; justify-content: space-between; color: #9fb0d1; font-size: 12px; margin-bottom: 10px; }
    .score-number { font-size: 56px; font-weight: 900; line-height: 1; margin-bottom: 10px; }
    .track { height: 10px; border-radius: 999px; background: rgba(255,255,255,.08); overflow: hidden; margin-bottom: 10px; }
    .bar { height: 100%; width: 0%; background: linear-gradient(90deg, #ef4444, #f5b942, #19c37d); }
    .score-label { color: #9fb0d1; font-size: 13px; line-height: 1.6; }

    .mini-list { display: grid; gap: 8px; }
    .mini-row { display: flex; justify-content: space-between; gap: 10px; padding: 10px; border: 1px solid #34415f; border-radius: 12px; background: #101827; font-size: 13px; }
    .ok { color: #19c37d; } .warn { color: #f5b942; } .bad { color: #ef4444; }

    .box { padding: 14px; margin-bottom: 12px; }
    .box h3 { margin: 0 0 8px; font-size: 15px; }
    .box p, .box li { color: #9fb0d1; font-size: 14px; line-height: 1.7; margin: 0; }
    .box ul { margin: 0; padding-left: 18px; }

    .export-card { border: 1px solid #34415f; border-radius: 16px; padding: 16px; background: #0c1322; }
    .export-top { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 20px; }
    .export-title { font-weight: 900; }
    .export-sub { color: #9fb0d1; font-size: 12px; margin-top: 4px; }
    .export-score { font-size: 58px; font-weight: 900; }
    .export-label { font-size: 12px; color: #8da7ff; margin-bottom: 12px; }
    .export-section { border: 1px solid #34415f; border-radius: 12px; padding: 12px; margin-top: 10px; background: #111b2c; }
    .export-section-title { color: #8da7ff; font-size: 12px; margin-bottom: 6px; }
    .export-section p { margin: 0; color: #dfe7fb; font-size: 13px; line-height: 1.6; }

    @media (max-width: 980px) { .layout, .grid2 { grid-template-columns: 1fr; } h1 { font-size: 32px; } }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="topbar">
      <div class="brand">
        <div class="logo">MI6</div>
        <div>
          <div class="brand-title">MI6 v3.4 Semi-Auto Assistant</div>
          <div class="brand-sub">No-AI assisted scoring · Suggested checks · Final user confirmation</div>
        </div>
      </div>
      <div class="debug" id="debugBox">DEBUG: READY</div>
    </div>

    <div class="hero">
      <h1>MI6 v3.4 半自动六分交易评分器</h1>
      <p class="sub">这版不接 AI，不烧额度。系统会根据你选择的趋势、方向、过滤项，自动给建议勾选和风险提示；最后仍由用户确认，避免机器乱判。</p>
    </div>

    <div class="layout">
      <main class="panel">
        <h2>输入与半自动分析台</h2>

        <div class="section">
          <div class="section-head">
            <strong>Step 1 · 上传图表</strong>
            <span>图片只作预览，不上传服务器</span>
          </div>

          <div class="grid2">
            <div>
              <label for="chartUpload">选择图表图片</label>
              <input id="chartUpload" type="file" accept="image/*" onchange="handleFileUpload(event)" />
              <img id="previewImage" class="preview" alt="Preview" />
            </div>

            <div>
              <label>交易方向</label>
              <div class="btn-row">
                <button id="buyBtn" type="button" class="active-buy" onclick="setDirection('BUY')">BUY</button>
                <button id="shortBtn" type="button" onclick="setDirection('SHORT')">SHORT</button>
              </div>

              <div class="grid2" style="margin-top:14px;">
                <div>
                  <label for="symbol">标的</label>
                  <input id="symbol" type="text" placeholder="XAUUSD" oninput="renderDecision()" />
                </div>
                <div>
                  <label for="timeframe">Timeframe</label>
                  <select id="timeframe" onchange="renderDecision()">
                    <option value="">未选择</option>
                    <option value="M15">M15</option>
                    <option value="H1">H1</option>
                    <option value="H4">H4</option>
                    <option value="D1">D1</option>
                  </select>
                </div>
              </div>

              <div style="margin-top:14px;">
                <label for="notes">备注</label>
                <textarea id="notes" placeholder="例如：等回踩 / 左侧进场 / 目标区" oninput="renderDecision()"></textarea>
              </div>

              <div class="btn-row" style="margin-top:14px;">
                <button type="button" class="gold" onclick="applyAssistantSuggestions()">Auto Suggest</button>
                <button id="analyzeBtn" type="button" class="primary" onclick="runManualAnalysis()">Generate Result</button>
              </div>

              <div class="status-row">
                <div class="chip" id="stateChip">STATE: IDLE</div>
                <div class="chip" id="directionChip">DIRECTION: BUY</div>
                <div class="chip">ENGINE: LOCAL</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-head">
            <strong>Step 2 · 结构输入与建议</strong>
            <span>先选趋势，再用 Auto Suggest 辅助勾选</span>
          </div>

          <div class="grid2">
            <div class="analysis-card">
              <h3>Market Trend</h3>
              <p>趋势判断</p>
              <select id="trendSelect" onchange="updateSuggestions(); renderDecision();">
                <option value="up">上升趋势</option>
                <option value="down">下跌趋势</option>
                <option value="sideways">盘整</option>
              </select>
              <div id="trendSuggest" class="suggestion">建议：先判断 HH/HL、LH/LL 或盘整区间。</div>
            </div>

            <div class="analysis-card">
              <h3>结构一致性</h3>
              <p>是否顺主趋势</p>
              <select id="structuralConsistency" onchange="updateSuggestions(); renderDecision();">
                <option value="yes">顺主趋势</option>
                <option value="no">逆主趋势</option>
              </select>
              <div id="structureSuggest" class="suggestion">建议：方向顺趋势时评分更稳。</div>
            </div>

            <div class="analysis-card">
              <h3>1. Candlestick</h3><p>蜡烛触发</p>
              <div class="btn-row"><button id="candlestickYes" type="button" onclick="setScore('candlestick', 1)">符合 +1</button><button id="candlestickNo" type="button" class="active-no" onclick="setScore('candlestick', 0)">不符合 0</button></div>
              <div id="candlestickSuggest" class="suggestion">建议：没有明确吞没、Pin Bar、强收线，就先不给分。</div>
            </div>

            <div class="analysis-card">
              <h3>2. Chart Pattern</h3><p>通道 / 突破 / 支撑阻力 / 形态</p>
              <div class="btn-row"><button id="chartpatternYes" type="button" onclick="setScore('chartpattern', 1)">符合 +1</button><button id="chartpatternNo" type="button" class="active-no" onclick="setScore('chartpattern', 0)">不符合 0</button></div>
              <div id="chartpatternSuggest" class="suggestion">建议：有趋势通道、突破回踩或清楚区间，才给分。</div>
            </div>

            <div class="analysis-card">
              <h3>3. Wave</h3><p>HH/HL 或 LH/LL 波段结构</p>
              <div class="btn-row"><button id="waveYes" type="button" onclick="setScore('wave', 1)">符合 +1</button><button id="waveNo" type="button" class="active-no" onclick="setScore('wave', 0)">不符合 0</button></div>
              <div id="waveSuggest" class="suggestion">建议：顺趋势结构明显，Wave 通常可给分。</div>
            </div>

            <div class="analysis-card">
              <h3>4. MA</h3><p>均线方向 / 支撑 / 压力</p>
              <div class="btn-row"><button id="maYes" type="button" onclick="setScore('ma', 1)">符合 +1</button><button id="maNo" type="button" class="active-no" onclick="setScore('ma', 0)">不符合 0</button></div>
              <div id="maSuggest" class="suggestion">建议：价格在 MA 顺势侧，或 MA 形成支撑/压力，可给分。</div>
            </div>

            <div class="analysis-card">
              <h3>5. Bollinger Band</h3><p>布林带位置 / 回归 / 突破</p>
              <div class="btn-row"><button id="bbYes" type="button" onclick="setScore('bb', 1)">符合 +1</button><button id="bbNo" type="button" class="active-no" onclick="setScore('bb', 0)">不符合 0</button></div>
              <div id="bbSuggest" class="suggestion">建议：BB 通常作为辅助，不清楚就先不给分。</div>
            </div>

            <div class="analysis-card">
              <h3>6. Fibo</h3><p>回调区 / 延伸区</p>
              <div class="btn-row"><button id="fiboYes" type="button" onclick="setScore('fibo', 1)">符合 +1</button><button id="fiboNo" type="button" class="active-no" onclick="setScore('fibo', 0)">不符合 0</button></div>
              <div id="fiboSuggest" class="suggestion">建议：价格在 38.2 / 50 / 61.8 或延伸目标附近才给分。</div>
            </div>

            <div class="analysis-card"><h3>形态完整性</h3><p>是否孤立形态</p><select id="isolatedPattern" onchange="updateSuggestions(); renderDecision()"><option value="no">不是孤立形态</option><option value="yes">是孤立形态</option></select></div>
            <div class="analysis-card"><h3>Session</h3><p>交易时段</p><select id="sessionFilter" onchange="updateSuggestions(); renderDecision()"><option value="asia">亚洲盘</option><option value="london">伦敦盘</option><option value="newyork">纽约盘</option><option value="overlap" selected>重叠时段</option></select></div>
            <div class="analysis-card"><h3>ATR</h3><p>波动状态</p><select id="atrFilter" onchange="updateSuggestions(); renderDecision()"><option value="low">过低</option><option value="normal" selected>正常</option><option value="high">过高</option></select></div>
            <div class="analysis-card"><h3>Trigger Audit</h3><p>触发确认</p><select id="triggerAudit" onchange="renderDecision()"><option value="yes" selected>有明确触发</option><option value="no">没有明确触发</option></select></div>
            <div class="analysis-card"><h3>Key Zone</h3><p>关键区域</p><select id="keyZoneAudit" onchange="renderDecision()"><option value="yes" selected>在关键区</option><option value="no">不在关键区</option></select></div>
            <div class="analysis-card"><h3>Trap Zone</h3><p>陷阱区</p><select id="trapZoneAudit" onchange="renderDecision()"><option value="no" selected>不是陷阱区</option><option value="yes">接近陷阱区</option></select></div>
          </div>
        </div>
      </main>

      <aside class="terminal">
        <div class="terminal-head"><h2>MI6 决策终端</h2><div id="resultBadge" class="badge">NO TRADE</div></div>
        <div class="small">MODE: Semi-Auto Local Engine · No API Cost</div>
        <div class="score-box"><div class="score-head"><span>SIGNAL</span><span id="scoreSignalText">IDLE</span></div><div id="scoreNumber" class="score-number">0/6</div><div class="track"><div id="scoreProgressBar" class="bar"></div></div><div id="scoreLabel" class="score-label">等待上传图表并开始分析</div></div>
        <div class="grid3" style="margin-bottom:14px;"><div class="box"><h3>INPUT</h3><p>UPLOAD</p></div><div class="box"><h3>ENGINE</h3><p>LOCAL</p></div><div class="box"><h3>MODE</h3><p>SEMI</p></div></div>
        <div class="box"><h3>System Checks</h3><div class="mini-list" id="checks"></div></div>
        <div class="box"><h3>系统分析</h3><p id="analysisText">请先上传图表并点击 Generate Result。</p></div>
        <div class="box"><h3>执行建议</h3><p id="adviceText">暂无建议。</p></div>
        <div class="box"><h3>风险提醒</h3><ul id="riskList"><li>任何结果都必须搭配止损和仓位管理。</li></ul></div>
        <div class="box"><h3>IG Export Card</h3><div class="export-card"><div class="export-top"><div><div class="export-title">MI6 v3.4</div><div class="export-sub">Trading Decision Summary</div></div><div id="exportBadge" class="badge">NO TRADE</div></div><div id="exportScore" class="export-score">0/6</div><div class="export-label">SCORE</div><div class="export-section"><div class="export-section-title">META</div><p id="exportMeta">未生成摘要</p></div><div class="export-section"><div class="export-section-title">KEY SUMMARY</div><p id="exportSummary">上传图表后生成摘要。</p></div><div class="export-section"><div class="export-section-title">RISK NOTE</div><p id="exportRisk">暂无风险提示。</p></div></div><button type="button" class="primary" style="margin-top:12px;width:100%;" onclick="copySummary()">复制摘要</button></div>
      </aside>
    </div>
  </div>

  <script>
    const state = { direction: "BUY", candlestick: 0, chartpattern: 0, wave: 0, ma: 0, bb: 0, fibo: 0 };
    const labels = { candlestick: "Candlestick", chartpattern: "Chart Pattern", wave: "Wave", ma: "MA", bb: "Bollinger Band", fibo: "Fibo" };
    function el(id){ return document.getElementById(id); }
    function setDebug(text){ const box = el("debugBox"); if(box) box.textContent = "DEBUG: " + text; }
    function setDirection(direction){ state.direction = direction; el("directionChip").textContent = "DIRECTION: " + direction; el("buyBtn").className = direction === "BUY" ? "active-buy" : ""; el("shortBtn").className = direction === "SHORT" ? "active-short" : ""; updateSuggestions(); setDebug(direction + " selected"); renderDecision(); }
    function setScore(key,value){ state[key]=Number(value); const y=el(key+"Yes"), n=el(key+"No"); if(y&&n){ if(Number(value)===1){ y.className="active-yes"; n.className=""; } else { y.className=""; n.className="active-no"; }} setDebug(key + " = " + value); renderDecision(); }
    function handleFileUpload(event){ const file=event.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=function(){ el("previewImage").src=reader.result; el("previewImage").style.display="block"; el("stateChip").textContent="STATE: READY"; setDebug("Image uploaded"); }; reader.readAsDataURL(file); }
    function getTrendText(v){ if(v==="up")return"上升趋势"; if(v==="down")return"下跌趋势"; return"盘整"; }
    function getSessionText(v){ return {asia:"亚洲盘",london:"伦敦盘",newyork:"纽约盘",overlap:"重叠时段"}[v]||v; }
    function getAtrText(v){ return {low:"过低",normal:"正常",high:"过高"}[v]||v; }
    function getBadgeClass(r){ if(r==="STRONG TRADE")return"badge strong"; if(r==="TRADE")return"badge trade"; if(r==="WATCH")return"badge watch"; if(r==="BLOCK")return"badge block"; return"badge"; }
    function downgrade(r){ if(r==="STRONG TRADE")return"TRADE"; if(r==="TRADE")return"WATCH"; if(r==="WATCH")return"NO TRADE"; return"NO TRADE"; }
    function readAdvanced(){ return { trend:el("trendSelect").value, structural:el("structuralConsistency").value, isolated:el("isolatedPattern").value, session:el("sessionFilter").value, atr:el("atrFilter").value, trigger:el("triggerAudit").value, keyzone:el("keyZoneAudit").value, trapzone:el("trapZoneAudit").value }; }
    function calculateScore(){ return Object.keys(labels).reduce((sum,key)=>sum+Number(state[key]||0),0); }
    function getBaseResult(score){ if(score===6)return"STRONG TRADE"; if(score===5)return"TRADE"; if(score===4)return"WATCH"; return"NO TRADE"; }
    function setSuggest(id,text,type){ const box=el(id); if(!box)return; box.textContent=text; box.className="suggestion " + (type||""); }

    function updateSuggestions(){
      const adv = readAdvanced();
      const aligned = (adv.trend === "up" && state.direction === "BUY") || (adv.trend === "down" && state.direction === "SHORT");
      if(adv.trend === "sideways") setSuggest("trendSuggest","建议：盘整市场先观察，除非有清楚突破或区间边界。","warn");
      else if(aligned) setSuggest("trendSuggest","建议：方向顺主趋势，可优先检查 Wave / Chart Pattern / MA。","good");
      else setSuggest("trendSuggest","警告：方向逆趋势，系统会自动降级。","bad");

      setSuggest("structureSuggest", adv.structural === "yes" ? "建议：结构顺势，setup 质量较好。" : "警告：逆主趋势，分数再高也要降级。", adv.structural === "yes" ? "good" : "bad");
      setSuggest("waveSuggest", aligned ? "建议：若图中有清楚 HH/HL 或 LH/LL，可给 Wave +1。" : "建议：方向不顺趋势，Wave 需非常清楚才给分。", aligned ? "good" : "warn");
      setSuggest("chartpatternSuggest", adv.trend === "sideways" ? "建议：盘整时只在清楚区间边界或突破回踩给分。" : "建议：若有趋势通道、突破回踩、支撑压力，可给 Chart +1。", adv.trend === "sideways" ? "warn" : "good");
      setSuggest("maSuggest", aligned ? "建议：价格在 MA 顺势侧或 MA 支撑/压力明显，可给 MA +1。" : "建议：逆势时 MA 很容易变成阻力/支撑陷阱。", aligned ? "good" : "warn");
      setSuggest("candlestickSuggest", adv.trigger === "yes" ? "建议：已有触发条件，若蜡烛形态清楚可给 +1。" : "警告：没有明确触发，Candlestick 不建议给分。", adv.trigger === "yes" ? "good" : "bad");
      setSuggest("bbSuggest", adv.atr === "normal" ? "建议：BB 只作为辅助，位置支持方向才给分。" : "警告：ATR 不正常时，BB 信号容易失真。", adv.atr === "normal" ? "" : "warn");
      setSuggest("fiboSuggest", adv.isolated === "no" ? "建议：结构完整且接近关键 Fibo 区，才给 Fibo +1。" : "警告：孤立形态不要硬套 Fibo。", adv.isolated === "no" ? "good" : "warn");
    }

    function applyAssistantSuggestions(){
      const adv = readAdvanced();
      const aligned = (adv.trend === "up" && state.direction === "BUY") || (adv.trend === "down" && state.direction === "SHORT");
      if(aligned && adv.structural === "yes" && adv.trend !== "sideways") { setScore("wave",1); setScore("chartpattern",1); setScore("ma",1); }
      else { setScore("wave",0); setScore("ma",0); }
      setScore("candlestick", adv.trigger === "yes" ? 1 : 0);
      setScore("bb", adv.atr === "normal" && aligned ? 1 : 0);
      setScore("fibo", adv.isolated === "no" && aligned ? 1 : 0);
      setDebug("AUTO SUGGEST APPLIED");
      el("stateChip").textContent = "STATE: REVIEW";
      renderDecision();
    }

    function renderDecision(){
      const adv=readAdvanced(); const score=calculateScore(); let result=getBaseResult(score); const warnings=[]; const fails=[];
      if(adv.trend==="up"&&state.direction==="SHORT"){warnings.push("上升趋势选择 SHORT，方向冲突。"); result=downgrade(result);} if(adv.trend==="down"&&state.direction==="BUY"){warnings.push("下跌趋势选择 BUY，方向冲突。"); result=downgrade(result);} if(adv.trend==="sideways"){warnings.push("盘整市场，系统自动保守。"); result=downgrade(result);} if(adv.structural==="no"){warnings.push("结构不顺主趋势。"); result=downgrade(result);} if(adv.isolated==="yes"){warnings.push("形态偏孤立，缺乏前后结构支撑。"); result=downgrade(result);} if(adv.session==="asia"){warnings.push("亚洲盘流动性偏弱，系统自动保守。"); result=downgrade(result);} if(adv.atr!=="normal"){warnings.push("ATR "+getAtrText(adv.atr)+"，风险需要降低。"); result=downgrade(result);} if(adv.trigger==="no")fails.push("没有明确触发"); if(adv.keyzone==="no")fails.push("不在关键区"); if(adv.trapzone==="yes")fails.push("接近陷阱区"); if(fails.length>0)result="BLOCK";
      const badgeClass=getBadgeClass(result); el("resultBadge").textContent=result; el("resultBadge").className=badgeClass; el("exportBadge").textContent=result; el("exportBadge").className=badgeClass; el("scoreNumber").textContent=score+"/6"; el("exportScore").textContent=score+"/6"; el("scoreSignalText").textContent=score>=5?"HIGH":score===4?"MEDIUM":score>=2?"LOW":"IDLE"; el("scoreProgressBar").style.width=(score/6)*100+"%";
      const meta=(el("symbol").value||"未填写标的")+(el("timeframe").value?" · "+el("timeframe").value:"")+" · "+state.direction+" · "+getTrendText(adv.trend); el("scoreLabel").textContent=meta; el("exportMeta").textContent=meta;
      const checks=el("checks"); checks.innerHTML=""; Object.keys(labels).forEach(function(key){ const row=document.createElement("div"); row.className="mini-row"; row.innerHTML="<span>"+labels[key]+"</span><span class='"+(state[key]?"ok":"bad")+"'>"+(state[key]?"YES":"NO")+"</span>"; checks.appendChild(row); });
      [["趋势",getTrendText(adv.trend),adv.trend==="sideways"?"warn":"ok"],["结构",adv.structural==="yes"?"顺主趋势":"逆主趋势",adv.structural==="yes"?"ok":"bad"],["Session",getSessionText(adv.session),adv.session==="asia"?"warn":"ok"],["ATR",getAtrText(adv.atr),adv.atr==="normal"?"ok":"warn"],["总分",score+"/6",score>=5?"ok":score===4?"warn":"bad"]].forEach(function(item){ const row=document.createElement("div"); row.className="mini-row"; row.innerHTML="<span>"+item[0]+"</span><span class='"+item[2]+"'>"+item[1]+"</span>"; checks.appendChild(row); });
      const positives=[], missing=[]; Object.keys(labels).forEach(key=>state[key]?positives.push(labels[key]):missing.push(labels[key])); let analysis="当前方向 "+state.direction+"，趋势 "+getTrendText(adv.trend)+"，MI6 得分 "+score+"/6。"; if(positives.length)analysis+=" 已满足："+positives.join("、")+"。"; if(missing.length)analysis+=" 欠缺："+missing.join("、")+"。"; if(warnings.length)analysis+=" 风险修正："+warnings.join(" "); if(fails.length)analysis+=" 审计失败："+fails.join("、")+"。"; if(el("notes").value)analysis+=" 备注："+el("notes").value; el("analysisText").textContent=analysis; el("exportSummary").textContent=analysis;
      let advice="当前不建议交易。"; if(result==="STRONG TRADE")advice="当前属于高质量 setup，但仍需确认 Entry / SL / TP。"; else if(result==="TRADE")advice="条件较好，可以准备交易计划，但不要忽略风险报酬比。"; else if(result==="WATCH")advice="建议观察，等待更清晰触发。"; else if(result==="BLOCK")advice="系统拦截，先解决触发、关键区或陷阱区问题。"; el("adviceText").textContent=advice;
      const riskList=el("riskList"); riskList.innerHTML=""; ["分数高不等于必胜。","必须搭配止损和仓位管理。"].concat(warnings).concat(fails.map(f=>"审计失败："+f)).forEach(function(r){ const li=document.createElement("li"); li.textContent=r; riskList.appendChild(li); }); el("exportRisk").textContent=fails.length?"重点风险："+fails.join("、"):"请搭配止损、仓位管理与风险报酬比。";
    }

    function runManualAnalysis(){ el("stateChip").textContent="STATE: FINAL"; setDebug("LOCAL MODE"); updateSuggestions(); renderDecision(); }
    function resetAll(){ state.direction="BUY"; Object.keys(labels).forEach(key=>state[key]=0); el("symbol").value=""; el("timeframe").value=""; el("notes").value=""; el("chartUpload").value=""; el("previewImage").style.display="none"; el("previewImage").src=""; el("trendSelect").value="up"; el("structuralConsistency").value="yes"; el("isolatedPattern").value="no"; el("sessionFilter").value="overlap"; el("atrFilter").value="normal"; el("triggerAudit").value="yes"; el("keyZoneAudit").value="yes"; el("trapZoneAudit").value="no"; el("buyBtn").className="active-buy"; el("shortBtn").className=""; el("directionChip").textContent="DIRECTION: BUY"; Object.keys(labels).forEach(function(key){ const y=el(key+"Yes"),n=el(key+"No"); if(y&&n){y.className=""; n.className="active-no";} }); el("stateChip").textContent="STATE: IDLE"; el("scoreNumber").textContent="0/6"; el("scoreSignalText").textContent="IDLE"; el("scoreProgressBar").style.width="0%"; el("scoreLabel").textContent="等待上传图表并开始分析"; el("resultBadge").textContent="NO TRADE"; el("resultBadge").className="badge"; el("exportBadge").textContent="NO TRADE"; el("exportBadge").className="badge"; el("checks").innerHTML=""; el("analysisText").textContent="请先上传图表并点击 Generate Result。"; el("adviceText").textContent="暂无建议。"; el("riskList").innerHTML="<li>任何结果都必须搭配止损和仓位管理。</li>"; el("exportScore").textContent="0/6"; el("exportMeta").textContent="未生成摘要"; el("exportSummary").textContent="上传图表后生成摘要。"; el("exportRisk").textContent="暂无风险提示。"; updateSuggestions(); setDebug("READY"); }
    async function copySummary(){ const text="MI6 v3.4"+String.fromCharCode(10)+el("exportMeta").textContent+String.fromCharCode(10)+el("exportSummary").textContent+String.fromCharCode(10)+el("exportRisk").textContent; try{ await navigator.clipboard.writeText(text); setDebug("Copied"); }catch(err){ alert("复制失败"); } }
    window.addEventListener("load", function(){ resetAll(); setDebug("LOADED"); });
  </script>
</body>
</html>
