---
name: rixin-sanhao
description: 锐新三号：锐新科技「霓虹拆解」视频（甲方认可的智能药盒拆解配音版同款）+ 公众号联动周更。用户说「锐新三号 / 霓虹拆解 / 照药盒那条再做一期 / 拆一个单片机项目做视频 / 公众号配套横竖视频 / 一周内容」时使用。一个 JSON 脚本出 16:9 和 9:16 两条，支持网上真实作品图（带图源）。独立于 rixin-explainer-video（方格纸 8 段）和 hybrid-ai-video（夜光实验室）。
---

# 锐新三号 · 霓虹拆解

**定型片**：`智能药盒拆解_锐新科技_配音版_16x9.mp4`（105 秒，12 页，暗底 + 橙 / 青 / 蓝霓虹线，小锐只在结尾出现）。甲方反馈最好，**版式、配色、节奏都不要改**，每期只换内容。

代码在 `fcc-video/remotion/src/neon/`（工程根 `C:/Users/JOHO/Documents/Codex/2026-09-26/files-pasted-by-the-user-github/work/repo/fcc-video`），流水线 `fcc-video/tools/rx3.py`。本 skill 的 `code/` 里有同版本副本，工程丢了可以从这里恢复。

## 一期视频的做法

1. **选题**：用户给题目，或者从公众号项目的 `选题库.md` 取第一条「待写」（见 `references/weekly.md`）。
2. **查真实资料**：器件型号、引脚、参数要查得到出处（官方手册 / 开源项目 / CSDN 作品帖），写进 `<公众号目录>/素材/<编号>_素材.md`。不编数字。
3. **找真实作品图**（可选，最多 1–2 张）：按 `references/real-images.md`。**下载前把候选清单（来源页、文件名、大小）发给用户确认**。
4. **建脚本**：`python tools/rx3.py new <topic>`（默认从 `template.json` 复制，含 real 页示例），图片放 `remotion/public/rx3/<topic>/`。按 `references/scenes.md` 改每一页的内容和旁白。
5. **检查**：`python tools/rx3.py check <topic>`（字段、图片、字幕长度、数字没写 `say` 的提示）。
6. **配音**：`python tools/rx3.py voice <topic>`（剪映 zh_male_zhengtaikp，tempo 1.05，自动 register）。
7. **看关键帧**：`python tools/rx3.py still <topic> h` 和 `... v`（每页一张，放 `E:/rx3_out/<topic>/`），逐张 Read：文字不出框、标注线对准零件、竖版字幕不压画面。
8. **出片**：`python tools/rx3.py render <topic>`（后台跑，横竖各一条，自动混 BGM + 音效），成片 `E:/rx3_out/<topic>/<标题>_锐新科技_16x9.mp4 / _9x16.mp4`。复制到公众号项目的 `视频/` 和桌面，用默认播放器打开。

## 脚本结构（固定 12–13 页，照药盒）

| # | type | 作用 | 旁白句数 |
|---|---|---|---|
| 1 | title | 项目名 + 「一口气拆解一个 XX 毕设项目」+ 一句问题 | 2 |
| 2 | kit | 实物图 + 编号标注（≤9 个零件） | 4–5 |
| 3 | real（可选） | 网上真实作品图 + 3 个要点 + 图源 | 2 |
| 4 | layers | 系统拆成 3–5 层能力 | 2 |
| 5 | flow | 2–4 步功能闭环 + 回环说明 | 3 |
| 6 | chapter | 「功能看懂了 / 原理篇」过渡 | 1 |
| 7 | chain | 第一步：信号采集（输入 → 放大/驱动 → 主控 → 公式） | 3 |
| 8 | ring | 第二步：判断逻辑（3 条规则） | 2 |
| 9 | pins | 第三步：引脚 → 驱动 → 执行器（≤4 行） | 2 |
| 10 | pwm / chainlist | 电路深挖 01（有舵机用 pwm，否则 chainlist） | 2 |
| 11 | chainlist | 电路深挖 02（因果链 5 步，`diagram: "bridge"` 仅称重类） | 3 |
| 12 | upgrade | 两个升级方向卡片 | 3 |
| 13 | outro | 关注锐新科技 + 下期我们讲 + 3 个要点 | 3 |

旁白规则（和定型片一致）：
- 每句字幕 ≤ 24 字，口语，一句一个信息点；`【】` 只在竖版大字幕里变橙色。
- 有数字、型号读法的句子写 `say`（「0.5克」→「零点五克」，「HX711」念法不对时写成中文）。
- 结尾固定「关注锐新科技，一分钟拆透一个单片机项目」+「下期我们讲：<选题库下一条>」，**不引流公众号**。
- 全片 95–120 秒，30–34 句。

## 竖版（9:16）：全屏原生排版

用户 2026-11-07 否掉了「横版缩小放中间 + 上下加标题」的竖版，要**全屏、每页重新排**。竖版代码 `neon/NeonV.tsx`，同一份脚本和配音，但每种 type 都有自己的 1080×1920 布局：
- 结构从上到下：左上英文 tag / 右下品牌条 → 标题区（y 140–300，2 行，`
` 分行，`【】` 橙色）→ 内容区（y 320–1470）→ 大字幕（y 1530，56 px，自动换行）→ 品牌条 + 进度条。
- 各页竖排：kit = 实物图铺满宽度 + 编号圆点，下方两列编号图例；layers / flow = 竖向节点脊柱；chain = 输入在上、芯片卡居中、公式在下；ring = 大圆居中；pins = 每行「引脚 → 驱动 → 执行器」三卡；upgrade = 两张卡上下排；outro = 小锐在上、文字在下。
- 横版标题太长时，在场景里加 `"v": {...}` 只覆盖竖版字段：常用 `vTitle`（两行标题）、`vQuestion`（首页问题）、`vLabel`（kit 顶部标题）、`vFoot`。例子见 `templates/pillbox.json`。
- 检查：`rx3.py still <topic> v` 出 12 张，拼成一张总览图看：标题和下方内容不重叠、图例不出屏、字幕不压内容。

## 不要做

- 不改配色、字号、版式去「优化」——甲方认的就是这一版。要新风格去用 `hybrid-ai-video`。
- 不用 AI 重画小锐（logo 会走样），只用 `public/rixin/` 的贴图。
- 网上图片不去水印、不裁掉作者信息、不当成自己的作品讲；画面里一律标「图源」。
- 引脚、参数写「常见接法，以实际原理图为准」，别说成某个具体作品的原理图。

## 参考文件

- `references/scenes.md`：每种 type 的字段和示例。
- `references/real-images.md`：真实作品图的找图、确认、署名流程。
- `references/weekly.md`：和公众号联动的一周排期（每天 1 篇文章 + 横竖 2 条视频）。
- `templates/pillbox.json`：定型片原脚本（回归测试用）；`templates/template.json`：新题目的起点。
- `code/`：`Neon.tsx`（横版）、`NeonV.tsx`（竖版）、`register.tsx`、`rx3.py`、`Teardown.tsx` 副本。
