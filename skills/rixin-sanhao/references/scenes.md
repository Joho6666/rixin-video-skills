# 场景类型字段表

所有场景都有 `id`（唯一）、`type`、`min`（最短秒数，旁白更长时自动延长）、`sfx`（可省：首页/chapter=boom，outro=ping，其余 whoosh）、`beats`（`[{id, text, say?}]`，beat id 全片唯一，建议 `<topic缩写>01…`）。
`tag` 是左上角英文小标签，各类型都有默认值，可覆盖。
颜色 `c` 取 `teal` / `orange` / `blue`，不写就按位置轮换。
图标 `icon` 可选：chip sensor bell phone fan wifi test code heart leaf car bulb smoke wire star check cross arrow list blocks tangle gift。

画布横版 1920×1080、竖版 1080×1920（竖版字段覆盖写在 `v` 里，见文末）；下面的字数上限是为了不出框，超了先删字，不要改字号。

## title
```json
{"type": "title", "title": "智能药盒", "sub": "一口气拆解一个 STM32 毕设项目", "question": "它是怎么提醒你吃药的"}
```
title ≤ 6 字，question ≤ 12 字。

## kit — 实物图 + 编号标注
```json
{"type": "kit", "img": "rx3/<topic>/kit.png", "imgW": 1672, "label": "STM32 智能药盒 · 实物组成",
 "callouts": [{"t": "STM32F103C8T6", "sub": "主控芯片", "x": 970, "y": 530, "c": "orange"}]}
```
- 图片 16:9 左右，显示宽 1360 px，放在 (520,160)。`imgW` 填原图像素宽，`x/y` 是**原图像素坐标**（用画图软件量，或者先 still 一帧再对位）。
- callouts ≤ 9 条，`t` ≤ 16 字符，`sub` ≤ 12 字。
- 实物图可用：用户给的实拍、gpt-image 生成的平铺图（药盒用的就是生成图），或经确认的网上作品图（同时要在 label 里写「图源：…」）。

## real — 网上真实作品（新增）
```json
{"type": "real", "title": "网上真实作品长这样", "kicker": "真实作品参考", "img": "rx3/<topic>/real1.jpg",
 "credit": "B站 @作者名《视频标题》", "fit": "cover", "points": ["主控 + 称重 + 舵机，【三块板】就能跑通"], "foot": "…"}
```
- 右侧 1000×640 霓虹框放图，底部自动加「图源：<credit>」。`fit` 用 `cover`（裁满）或 `contain`（完整显示）。
- points 3 条，每条 ≤ 16 字，`【】` 橙色。credit 必填。

## layers — 3–5 层能力
```json
{"type": "layers", "title": "一个药盒，被拆成五层能力", "foot": "感知 → 决策 → 交互 → 执行 → 连接",
 "nodes": [{"icon": "sensor", "t": "感知层", "sub": "称重 · 温湿度 · 红外开盖"}]}
```
位置固定：0 左、1 中（主控，放大）、2 上、3 下、4 右。sub ≤ 14 字。

## flow — 功能闭环
```json
{"type": "flow", "title": "…", "loop": "没吃？10 分钟后再提醒一次", "foot": "…",
 "steps": [{"t": "到点", "sub": "DS1302 时间 = 设定", "icon": "bell", "c": "blue"}]}
```
2–4 步，等距排开；`loop` 可省（不画回环线）。

## chapter
```json
{"type": "chapter", "small": "功能看懂了", "big": "原理篇", "sub": "看懂它的工作原理"}
```

## chain — 第一步：信号采集
```json
{"type": "chain", "title": "第一步：…",
 "inputs": [{"t": "称重传感器", "sub": "mV 级差分信号", "c": "orange", "wave": "small"}],
 "amp": {"t": "HX711", "sub": "放大 128 倍 · 24 位 ADC"},
 "chip": {"t": "STM32F103", "sub": "GPIO · TIM · USART", "rows": ["读称重 raw", "读温湿度"]},
 "formula": {"label": "药量", "expr": "W = k·(raw − offset)", "note": "k、offset 由空盒和砝码标定"}}
```
inputs ≤ 3（wave：small 小信号 / 默认 模拟 / flat 数字电平）；`amp` 只接第 1 路，可省；chip.rows ≤ 5；formula 可省。

## ring — 第二步：判断逻辑
```json
{"type": "ring", "title": "第二步：把数据变成判断", "input": "开格前后的重量", "engine": "DOSE CHECK ENGINE",
 "rows": [{"t": "ΔW ≥ 0.8·m药 → 已服", "c": "orange"}], "note": "…", "output": "state = TAKEN | MISSED", "foot": "…"}
```
rows ≤ 3，每条 ≤ 18 字符（等宽字体）。

## pins — 第三步：驱动输出
```json
{"type": "pins", "title": "第三步：小信号，驱动执行动作", "foot": "…", "note": "引脚为常见示例接法，以实际原理图为准",
 "rows": [{"pin": "PA8", "pinSub": "TIM1 PWM", "mid": "50Hz 脉宽", "out": "SG90 舵机", "c": "orange"}]}
```
≤ 4 行；mid ≤ 12 字，out ≤ 10 字。

## pwm — 舵机脉宽（固定动画）
```json
{"type": "pwm", "title": "01 · 舵机怎么知道要转多少度？看脉宽", "note": "药盒里：平时 0° 盖住药格，到点转到 90° 打开"}
```
只有项目里有舵机才用。

## chainlist — 因果链深挖
```json
{"type": "chainlist", "title": "02 · 称重传感器：惠斯通电桥", "diagram": "bridge", "hi": 3,
 "chain": ["受压变形", "应变片电阻变化", "mV 级差分电压", "HX711 ×128 放大", "24 位数字量"], "foot": "…"}
```
chain ≤ 6 条，每条 ≤ 12 字；`hi` 是高亮的序号（从 0 起）；`diagram` 目前只有 `bridge`，不写则链条居中。

## upgrade — 两个升级方向（浅色页）
```json
{"type": "upgrade", "title": "这类药盒课题，如何升级难度？", "sub": "…",
 "cards": [{"title": "RFID 识别药瓶", "art": "rfid", "bullets": ["…"]},
           {"title": "上云 + 家属微信提醒", "art": "notify", "panel": "服药看护", "rows": [["08:00", "已服用", "#16A34A"]]}]}
```
art：`rfid`（读卡动画）、`notify`（手机通知面板，配 panel + rows）、或任一图标名。bullets 3 条，每条 ≤ 18 字。

## outro
```json
{"type": "outro", "next": "智能温室大棚", "items": ["土壤湿度怎么测", "水泵怎么用继电器控", "数据怎么传上云"]}
```
可覆盖 `title`（默认「关注锐新科技」）和 `sub`（默认「一分钟拆透一个单片机项目」）。`next` 填选题库下一条。

## meta
```json
{"meta": {"title": "智能药盒拆解", "vTitle": "智能药盒\n怎么知道你【吃没吃药】？", "brand": "锐新科技", "topic": "智能药盒"}}
```
`title` 用作成片文件名；`vTitle` 是竖版顶部大标题（2 行，每行 ≤ 12 字）。`voDir` 由 `rx3.py new` 自动设成 `vo_rx3_<topic>`。

## v — 只给竖版用的覆盖字段
```json
{"id": "step1", "type": "chain", "title": "第一步：把重量、温度变成芯片能读的数",
 "v": {"vTitle": "第一步
把重量变成【芯片能读的数】"}}
```
可用：`vTitle`（多数页的标题，2 行、每行 ≤ 12 字）、`vQuestion` / `vSub`（title 页）、`vLabel`（kit）、`vFoot`（chainlist）。也可以直接覆盖任何字段（例如竖版少列一个 callout）。kit 竖版需要 `imgH`（原图像素高）来对准编号圆点。
