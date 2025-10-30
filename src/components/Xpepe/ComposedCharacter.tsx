import React from 'react';
import { CharConfig, LAYER_ORDER, OFFSETS } from './constants/traits';

type Props = { config: CharConfig; size?: number };

export function ComposedCharacter({ config, size = 48 }: Props) {
  return (
    <div style={{ position: 'relative', width: size, height: size, imageRendering: 'pixelated', overflow: 'visible' }}>
      {LAYER_ORDER.map((layer) => {
        const file = config[layer];
        if (!file || file === 'none') return null;
        const src = layer === 'oneofone'
          ? `/assets/characters/1o1/${file}`
          : `/assets/characters/${layer}/${file}`;
        return (
          <img
            key={layer}
            src={src}
            alt={`${layer}-${file}`}
            style={{
              position: 'absolute',
              left: OFFSETS[layer].x,
              top: OFFSETS[layer].y,
              width: size,
              height: size,
              imageRendering: 'pixelated',
              pointerEvents: 'none'
            }}
            draggable={false}
          />
        );
      })}
    </div>
  );
}


