# code 副本（2026-11-07）

恢复位置：
- Neon.tsx, NeonV.tsx, register.tsx -> fcc-video/remotion/src/neon/
- Teardown.tsx -> fcc-video/remotion/src/long/（Neon.tsx 从这里导入霓虹组件：DarkBg Tag Head Foot NodeC Box Wire Mono Zig Pill SceneWrap）
- rx3.py -> fcc-video/tools/
- long/register.tsx 里要有 import {NeonCompositions} from '../neon/register' 并渲染 <NeonCompositions />
- topics.ts 由 python tools/rx3.py register 生成
