// 锐新三号 compositions: RX3-<TOPIC>-H (16:9) and RX3-<TOPIC>-V (9:16) for every topic in topics.ts.
import React from 'react';
import {Composition} from 'remotion';
import {NeonVideo, buildTiming, NFPS} from './Neon';
import {NeonVertical} from './NeonV';
import {TOPICS} from './topics';

const H: React.FC<{k: string}> = ({k}) => { const x = TOPICS.find((t) => t.key === k)!; return <NeonVideo script={x.script} t={buildTiming(x.script, x.vo, x.env)} />; };
const V: React.FC<{k: string}> = ({k}) => { const x = TOPICS.find((t) => t.key === k)!; return <NeonVertical script={x.script} t={buildTiming(x.script, x.vo, x.env)} />; };

export const NeonCompositions: React.FC = () => (
  <>
    {TOPICS.map((x) => {
      const total = buildTiming(x.script, x.vo, x.env).total;
      return (
        <React.Fragment key={x.key}>
          <Composition id={`RX3-${x.key}-H`} component={H} defaultProps={{k: x.key}} durationInFrames={total} fps={NFPS} width={1920} height={1080} />
          <Composition id={`RX3-${x.key}-V`} component={V} defaultProps={{k: x.key}} durationInFrames={total} fps={NFPS} width={1080} height={1920} />
        </React.Fragment>
      );
    })}
  </>
);
