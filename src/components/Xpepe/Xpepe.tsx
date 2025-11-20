import React, { useEffect, useRef, useState } from 'react';
import '../../styles/xPEPEstyle.css';
import DinoGame from '../../logic/XpepeGameEngine';
import { CharacterId } from './characters';
import { ComposedCharacter } from './ComposedCharacter';
import { SkinButtons } from './SkinButtons';
import { DEFAULT_CONFIG, generateRandomConfig, CharConfig, LayerName } from './constants/traits';
import { useXpepeNfts } from '../../hooks/useXpepeNfts';

// NFT to character mapping table (still present for legacy)
const NFT_TO_CHARACTER: Record<string, CharacterId> = {
  "XPEPE-937414-01": "xpepeRed",
  "XPEPE-937414-02": "xpepeYellow"
};

export type XpepeProps = {
  onGameOver?: (finalScore: number) => void;
  onScoreChange?: (score: number) => void;
};

const DinoGameComponent: React.FC<XpepeProps> = ({ onGameOver, onScoreChange }) => {
  const gameRef = useRef<any>(null);
  const [character, setCharacter] = useState<CharacterId>(
    (localStorage.getItem("character") as CharacterId) || "xpepe"
  );
  const [charConfig, setCharConfig] = useState<Record<LayerName, string>>(DEFAULT_CONFIG);
  const NUM_CHOICES = 1;
  const [choices, setChoices] = useState<Record<LayerName, string>[]>(
    Array.from({ length: NUM_CHOICES }, () => generateRandomConfig())
  );
  const [selectedKey, setSelectedKey] = useState<string>('default');

  // NFT support (fetch, display)
  const { nftSprites, hasAnyNft, ownsBringsAdoption, ownsIzBack } = useXpepeNfts();

  useEffect(() => {
    gameRef.current = new DinoGame({ onGameOver, onScoreChange, autoStart: false });
    return () => {
      try {
        gameRef.current?.pauseGame?.();
        gameRef.current?.destroy?.();
      } catch {}
      gameRef.current = null;
    };
  }, [onGameOver, onScoreChange]);

  // NFTs come from hook

  const handleChangeCharacter = (id: CharacterId) => {
    setCharacter(id);
    localStorage.setItem("character", id);
  };

  const applyChoice = (index: number) => {
    setCharConfig(choices[index]);
    setChoices(prev => prev.map((c, i) => (i === index ? generateRandomConfig() : c)));
    setSelectedKey(`choice-${index}`);
  };

  const handleSelectNft = (nft: any) => {
    console.log("NFT selectat:", nft.identifier);
    const mappedChar = NFT_TO_CHARACTER[nft.identifier] || "xpepeYellow";
    setCharacter(mappedChar);
    localStorage.setItem("character", mappedChar);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-center">
        <SkinButtons
          selectedKey={selectedKey}
          onSelect={(cfg: CharConfig, key: string) => { setCharConfig(cfg); setSelectedKey(key); }}
          choices={choices}
          nftSprites={nftSprites}
          hasAnyNft={hasAnyNft}
          ownsBringsAdoption={ownsBringsAdoption}
          ownsIzBack={ownsIzBack}
        />
      </div>


      {/* 🔹 Jocul */}
      <div className="game-container" id="gameContainer">
        <div className="ground" id="ground"></div>
        <div className="cloud" id="cloud1" style={{ right: '100px' }}></div>
        <div className="cloud" id="cloud2" style={{ right: '300px' }}></div>
        <div className="cloud" id="cloud3" style={{ right: '500px' }}></div>

        <div className="dino" id="dino">
          <ComposedCharacter config={charConfig} />
        </div>

        <div className="score" id="score">00000</div>
        <div className="game-over" id="gameOver" style={{ display: 'none' }}>
          <h2></h2>
          <p>Press S to start</p>
        </div>
      </div>
    </div>
  );
};

export default DinoGameComponent;