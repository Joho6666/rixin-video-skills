---
name: rixin-explainer-video
description: 锐新科技专属科普视频制作:用客户吉祥物「锐新科技机器人」(白色机器人,头部是黑色 R 标志,蓝色发光耳机),按认证通同款 8 段方格纸模板,做单片机 / STM32 / PWM / 电子硬件类 1 分钟科普短视频,同时出 9:16 竖版和 16:9 横版,画面带电路板元件装饰。用户说"锐新科技视频 / 锐新机器人 / 单片机科普 / 做一期硬件科普 / 出竖版和横版"时使用。
---

# 锐新科技 · 硬件科普视频

基于 `compliance-explainer-video`(认证通模板)的分支:**同一套 8 段结构、同一个男声、同一套混音**,只换三样东西:吉祥物(锐新机器人)、品牌(锐新科技)、电子元件装饰。先读那个 skill 的 `SKILL.md` 和 `scene-schema.md` 了解数据格式。

项目根目录:`C:\Users\JOHO\Documents\Codex\2026-09-26\files-pasted-by-the-user-github\work\repo\fcc-video`(下称 `$P`),Remotion 工程在 `$P/remotion`。**C 盘经常接近满盘,渲染临时目录和输出一律放 E 盘**(见下方"磁盘")。

## 固定规格
| 项 | 值 |
|---|---|
| 画布 | 竖版 1080×1920,横版 1920×1080,30 fps,55–70 秒 |
| 外观 | `ThemeCtx="paper"` 方格纸 + `meta.decor="electronic"` 电路元件装饰 |
| 吉祥物 | `MascotCtx="rixin"`(素材 `remotion/public/rixin`,由 `tools/key_rixin.py` 从客户设定图生成) |
| 配音 | 男声 `zh_male_zhengtaikp`,`TEMPO=1.05` |
| 配乐 | 同认证通:`7378229393163175948`,-32 LUFS 垫在 -16 LUFS 人声下 |
| 品牌 | `meta.brand="锐新科技"`,`meta.watermark="@锐新科技"`,`meta.栏目="单片机科普"`,结尾贴纸 `锐新科技` |
| 输出 | `<主题>科普_锐新科技_方格纸_男声.mp4` + `..._16x9.mp4`,并放一份到桌面 `D:\Desktop` |

## 流程(新主题 `<id>`,如 `pwm`;Composition ID 用 `-` 不用 `_`)
1. **写脚本 JSON**:复制本目录 `example-pwm.json` 到 `remotion/src/scripts/<id>.json`,改内容。同时写 `remotion/src/<id>_lines.json`(`[{id,text}]`,**text 是配音读法**:数字写中文读音,3.3V→"三点三伏",50%→"百分之五十",51→"五一",500→"五百";字幕文字在 beats 的 `text` 里,可以和读法不同)。
2. **配音**:`LINES=<id>_lines VODIR=vo_<id> VOJSON=vo_<id>.json TEMPO=1.05 PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe -I tools/gen_voice_jy.py all zh_male_zhengtaikp`。检查英文缩写读音(见"踩坑")。
3. `tools/vo_env.py vo_<id> vo_<id>.json vo_<id>_env.json`;`SCRIPT=scripts/<id>.json VOJSON=vo_<id>.json OUT=mix_timing_<id>.json node tools/timing5_dump.mjs`。
4. **注册两个 Composition**(照 `remotion/src/Root.tsx` 里 `PWM-RX` / `PWM-RX-L` 抄):竖版 `Video5` + `MascotCtx rixin`;横版 `Video5Land script guide="rixin"`(`Video5Land.tsx`:左边机器人当讲解员,右边白板复用竖版场景,下方字幕)。`build_v3.py` 的 `CFG` 里加两项(`PWM`/`PWML` 抄)。`npx tsc -p . --noEmit`。
5. **抽帧检查(必做)**:每个场景末尾各 `remotion still`,竖版 8 张 + 横版 4 张,用 PIL 拼图看。重点看:文字溢出/重叠、机器人胸口字、装饰有没有压到文字。
6. **渲染 + 混音(E 盘)**:
```bash
export TEMP='E:\tmp_remotion' TMP='E:\tmp_remotion' OUT_DIR='E:\fcc-video-out' FINAL_DIR='E:\fcc-video-out'
cd remotion && npx remotion render <ID>-RX 'E:\fcc-video-out\<id>_voice.mp4' && npx remotion render <ID>-RX-L 'E:\fcc-video-out\<id>_land_voice.mp4'
cd .. && V=<KEY> PYTHONIOENCODING=utf-8 .venv/Scripts/python.exe build_v3.py   # KEY 和 KEYL 各一次
```
   渲染逐条执行,**不要写 `for c in ...; set -- $c` 之类的后台循环**(曾经整批静默失败)。
7. **交付**:ffprobe 核对分辨率/时长;峰值 < -1 dB、响度约 -16 LUFS;复制到项目目录和桌面;用默认播放器打开;告诉用户路径。发微信提醒用户用"文件"方式发送,否则被压到 720p 字会糊。

## 一条龙脚本(2026-10-31 新增,批量出片优先用它)
写好 `remotion/src/scripts/<id>.json` 和 `remotion/src/<id>_lines.json` 后(可以像 `research/scripts/week1_videos.py` 那样用一个 Python 文件批量生成多个脚本):
```bash
python tools/rixin_video.py prep   <id> <KEY> <成片名>   # 配音→包络→时间轴→注册竖横两个 Composition 和 build_v3 CFG→tsc→抽帧拼图
python tools/rixin_video.py render <id> <KEY>            # 竖横两版渲染(E 盘)→混音→ffprobe/峰值核对→复制到 公众号/视频 和桌面
```
- prep 之后**必须 Read** `E:/fcc-video-out/stills/<id>_grid.png` 和 `<id>_L_grid.png` 再 render。
- 多条连续渲染:用一条后台命令把多个 `render` 用 `&&` 串起来(脚本失败会 sys.exit,不会静默跳过),日志写到 `E:/fcc-video-out/*.log`。
- hook 的 `badges` 每个 ≤ 6 个字符(TCRT5000、AMS1117 会顶出框)。
- analogy 的 `sep` 可用 `=`、`→`、`VS`。

## 电子元素(本 skill 的特色)
- 装饰层 `remotion/src/Decor.tsx`:竖版底部一条"电路板元件带"(电阻、电容、MCU 芯片、LED、晶振、方波示波器)加两侧走线,橙色信号光点持续流动;横版是整屏很淡的走线加顶部小元件带。**只放在文字区域之外**,新增元素前先确认不会压字。开关:`meta.decor = "electronic"`。
- 新增场景图标(`Video5.tsx` 的 `ICONS`):`resistor` `capacitor` `led` `wave`(方波示波器) `motor` `buzzer` `screen` `sensor`,另有原有的 `chip` `plug` `bolt` `wireless` 等。讲 PWM/定时器/传感器时优先用这些图标,别全用 doc。

## 机器人素材
- 来源是客户设定图 `research/rixin/sheet.jpg` 的 5 个姿势(竖拇指=cheer、站立=idle、讲解=point、打招呼=wave、跑步=surprised),`think`、`present` 复用 idle、point。
- 重新生成:`tools/key_rixin.py`(Real-ESRGAN 放大 4 倍、抠背景、胸口"锐新科技 / RIXINKEJI"用雅黑重写、3 倍超采样、输出 1200px 高)。**机器人没有嘴**,说话效果是耳机/胸灯变亮。
- 小姿势原图只有约 300px 高,再放大也没有更多细节。要根本提升,需要客户给高清设定图,或用 gpt-image 参考大姿势重画一套(付费约 ¥2–3,先报价,先出一张让用户看)。

## 脚本规则
- 一句一镜头,8–20 字;标题 ≤ 8 字,用 `hl` 标一个高亮词;卡片文字 ≤ 8 个字(横版会缩到约 70%,字小了看不清)。
- 数字、公式必须正确:PWM 例子里 3.3V×50%=1.65V、计数 0→999、比较值 500=50%、200=20%,都是自洽的。引用厂商资料或年份要标来源,拿不准的写进 `meta.source` 并告诉用户核实。
- 事实类陈述保守:"一秒判断上万次""几块钱一颗"这类,发布前请用户确认。
- 禁止圈场景(impact)的标签已下移避免压图标;`from` 标签别超过 8 个字。

## 踩坑记录
| 现象 | 处理 |
|---|---|
| 胸口文字糊(旧视频) | 修复只对修复后渲染的视频生效;旧视频必须重新渲染。微信转发视频会压缩,让用户用"文件"发 |
| C 盘满(`ENOSPC`)、内存不足、`fork: Resource temporarily unavailable` | 先 `df -h /c`;把 `TEMP/TMP`、`OUT_DIR`、`FINAL_DIR` 指到 E 盘;剪映草稿引用 E 盘文件,**不要删 `E:\fcc-video-out`** |
| 英文缩写读错(ANATEL 读成怪音、Wi-Fi 读成 wife) | 配音稿里写成 `WiFi`、`Anatel`;其余如 STM32/ST-Link/CPU/DMA/ADC/PWM 一般没问题。检查需要 faster-whisper 模型,缓存在 `E:\hf`(`HF_HOME=E:\hf`),下载很慢,不行就让用户听 |
| 装饰压到文字 | 装饰只能放底部条带(y≈1790–1890)和左右边缘 14px 内 |
| 后台批量渲染"成功"但文件没更新 | 检查输出文件时间戳;逐条渲染 |
| 横版右边白板偏窄 | 复用竖版的取舍;要铺满需单独为 16:9 重排 |
| 结尾写成「看公众号全文」引流 | 用户要求结尾只做「关注锐新科技 + 下期我们讲……」并用 `next` 具体列出下期内容 |
| analogy 场景中间固定是「=」,做「改前 → 改后」时意思反了 | 场景里写 `"sep": "→"`(默认仍是 `=`) |

## 已做过的主题(可当范例)
单片机是什么(`mcu`)、STM32(`stm32`)、PWM(`pwm`,带电子元素)。成片在 `fcc-video/` 和 `D:\Desktop`。
2026-10-31 由公众号文章改编(竖横双版):ESP32 宿舍门禁(`door`,`DOOR-RX` / `DOOR-RX-L`)、开题报告不被打回(`kaiti`,`KAITI-RX` / `KAITI-RX-L`),成片同时放在 `D:\Desktop\锐新科技_公众号\视频`。公众号文章改视频时:取文章的开场小剧场 + 核心三步 + 重点(控制思想 / 坑)+ 清单,结尾**不引流到公众号**,固定说「关注锐新科技,下期我们讲:……」,把下期要讲的几项具体列出来;outro 场景写 `"next": ["题目太大", …]`(≤6 条、每条 ≤7 字),画面会出一张「下期预告」清单卡,气泡写「下期:xxx」。相关:[[wechat-mp-article]]

## 运行演示场景(demoA / demoB,2026-10-25 新增)
把"单片机在运行"的动画穿插进 8 段结构:`remotion/src/Demo.tsx`(`PwmDemo`)+ `Video5.tsx` 的 `DemoScene`,场景 id 用 `demoA`、`demoB`(可再加,需在 `RENDER` 里注册),脚本里把对应 beats 的 `scene` 改成它,并写:
```json
"demoA": {"title":[{"t":"三个"},{"t":"词","hl":true}], "parts":["led","scope"], "terms":["周期","占空比","平均电压"], "duty":[{"beat":0,"duty":0.5}]},
"demoB": {"title":[...], "parts":["led","scope","counter"], "duty":[{"beat":0,"duty":0.5},{"beat":2,"duty":0.2}]}
```
- `parts`:`led`(板子+LED,亮度随占空比)、`scope`(滚动方波+平均电压线)、`counter`(定时器计数 0→999+比较值)。
- `duty`:到第 N 句开始时占空比渐变到新值;屏幕上的占空比/比较值/平均电压/LED 亮度由同一个数算出,**旁白里的数字必须和它一致**。
- `terms`:底部三个词的芯片,随旁白句子依次高亮,同时示波器对应高亮(周期括号 / 高电平区域 / 平均电压线)。
- 画面底部有"动画为原理示意,非真实测量",不要删。计数器卡片靠右(x=250 起)是给机器人留位置。
- PWM 之外的演示(ADC、串口、中断等)需要新增组件,写法照 `PwmDemo`。范例脚本 `example-pwm.json` 已是带演示场景的版本。

## 拆解视频视觉系统（工程蓝图 × 硬件品牌，2026-11-06，用户认可）
"一分钟拆透一个单片机项目"类视频用这套，不用霓虹暗场模板（多色发光、圆角药丸框、居中弹出 = AI 味）。
- 代码：`remotion/src/long/bp.tsx`（设计令牌 + `Sheet` 图纸底、`Frame` 直角细框、`Leader` 引线标注、`Exploded` 分层爆炸图、`Scope` 示波器、`Heading`）；成片组件 `long/TeardownBP.tsx`（Composition `RX-TEARDOWN-PILLBOX-BP`），时长和配音复用 `long/Teardown.tsx` 的 `BEATS/TEARDOWN_SCENES`，脚本 `scripts/teardown_pillbox.json`。
- 规则：炭黑 `#0E0F11` / 纸白 `#F2F1EC`，唯一强调色电光蓝 `#2D8CFF`（红只表示报警）；字体 Noto Sans SC VF + Cascadia Mono（`public/fonts`），编号/参数/引脚一律等宽大写；12 栏网格、96px 边距、刻度尺 + 裁切角标 + `SHEET 02 / 12`；1–1.5px 线，零发光；遮罩展开和描线代替弹出；页间横向镜头平移；胶片颗粒 + 暗角。
- 爆炸图：JOHO 中转站 gpt-image-2 生成**无文字**等轴测爆炸图（渲染版 + 白线稿版），图片用 `mixBlendMode: lighten` 去掉底色框；按行亮度切出各层（`EX_BANDS`），讲到哪层哪层变蓝、其余变暗。标注全部矢量叠加。
- 示例数据要标 "EXAMPLE 示例数据"，引脚标"以实际原理图为准"。
- 混音：`mix_music.py`，`VOICE=1` 时人声 -16 LUFS、配乐 -32。

## 长视频 / 拆解视频（2026-11 起优先用）
1–3 分钟的横版拆解、讲解视频，用 skill `hybrid-ai-video` 的「夜光实验室」风格（`references/lab-style.md`）：AI 真实镜头铺底 + 毛玻璃卡片 + 超大字，机器人在左下角朝右讲解（约 290px，不挡内容），钩子只留一屏，配乐卡鼓点。参考成片 `智能药盒拆解_锐新科技_V3_16x9.mp4`，代码 `remotion/src/long/v3/`。本 skill 的方格纸 8 段模板仍用于 55–70 秒的短科普。
