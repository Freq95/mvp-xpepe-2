import React from 'react';
import { ComposedCharacter } from './ComposedCharacter';
import { CharConfig, generateRandomConfig, DEFAULT_CONFIG, LayerName } from './constants/traits';

type Props = {
  selectedKey: string;
  onSelect: (config: CharConfig, key: string) => void;
  choices: CharConfig[];
  nftSprites: any[];
  hasAnyNft: boolean;
  ownsBringsAdoption: boolean;
  ownsIzBack: boolean;
};

export function SkinButtons({ selectedKey, onSelect, choices, nftSprites, hasAnyNft, ownsBringsAdoption, ownsIzBack }: Props) {
  return (
    <div className="flex gap-4 flex-wrap mt-[15px]">
      {/* Default */}
      <button
        onClick={() => onSelect(DEFAULT_CONFIG, 'default')}
        className={`px-5 pt-9 pb-2 border rounded-xl flex flex-col items-center hover:shadow-lg transition ${selectedKey === 'default' ? 'ring-2 ring-yellow-400' : ''}`}
        title="Default skin"
      >
        <ComposedCharacter config={DEFAULT_CONFIG} />
        <span className="text-xs mt-1">default</span>
      </button>

      {/* Random (if has NFTs) */}
      {hasAnyNft && choices.map((cfg, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(cfg, `choice-${idx}`)}
          className={`px-5 pt-9 pb-2 border rounded-xl flex flex-col items-center hover:shadow-lg transition ${selectedKey === `choice-${idx}` ? 'ring-2 ring-yellow-400' : ''}`}
          title="Random skin"
        >
          <ComposedCharacter config={cfg} />
          <span className="text-xs mt-1">random #{idx + 1}</span>
        </button>
      ))}

      {/* Regular NFTs (exclude 1/1) */}
      {hasAnyNft && nftSprites
        .filter((n) => {
          const name = (n?.name || '').toLowerCase();
          return !name.includes('xpepe_brings_adoption') && !name.includes('xpepe_iz_back');
        })
        .map((n) => (
          <button
            key={n.identifier}
            onClick={() => onSelect(generateRandomConfig(), `nft-${n.identifier}`)}
            className={`px-5 pt-9 pb-2 border rounded-xl flex flex-col items-center hover:shadow-lg transition`}
            title={n.name}
          >
            <img src={n.media?.[0]?.url} alt={n.name} className="w-12 h-12 object-contain" />
            <span className="text-xs mt-1">{n.name}</span>
          </button>
        ))}

      {/* 1/1 appended last */}
      {ownsBringsAdoption && (
        <button
          onClick={() => onSelect({ oneofone: 'pepe_trump.png', templates: 'none', mouth: 'none', eyes: 'none', body: 'none', feet: 'feet_default.png', head: 'none' } as CharConfig, 'nft-trump')}
          className={`px-5 pt-9 pb-2 border rounded-xl flex flex-col items-center hover:shadow-lg transition ${selectedKey === 'nft-trump' ? 'ring-2 ring-yellow-400' : ''}`}
          title="trump 1/1"
        >
          <ComposedCharacter config={{ oneofone: 'pepe_trump.png', templates: 'none', mouth: 'none', eyes: 'none', body: 'none', feet: 'feet_default.png', head: 'none' } as CharConfig} />
          <span className="text-xs mt-1">trump 1/1</span>
        </button>
      )}

      {ownsIzBack && (
        <button
          onClick={() => onSelect({ oneofone: 'template_logo.png', templates: 'none', mouth: 'none', eyes: 'none', body: 'none', feet: 'feet_black_1o1.png', head: 'none' } as CharConfig, 'nft-black')}
          className={`px-5 pt-9 pb-2 border rounded-xl flex flex-col items-center hover:shadow-lg transition ${selectedKey === 'nft-black' ? 'ring-2 ring-yellow-400' : ''}`}
          title="black 1/1"
        >
          <ComposedCharacter config={{ oneofone: 'template_logo.png', templates: 'none', mouth: 'none', eyes: 'none', body: 'none', feet: 'feet_black_1o1.png', head: 'none' } as CharConfig} />
          <span className="text-xs mt-1">black 1/1</span>
        </button>
      )}
    </div>
  );
}


