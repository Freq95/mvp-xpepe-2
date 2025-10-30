import { } from 'react';

// Layer order used for composition
export const LAYER_ORDER = ['oneofone', 'templates', 'mouth', 'eyes', 'body', 'feet', 'head'] as const;
export type LayerName = typeof LAYER_ORDER[number];

// Offsets per layer so the composed character aligns (y positive down)
export const OFFSETS: Record<LayerName, { x: number; y: number }> = {
  oneofone: { x: 0, y: -35 },
  templates: { x: 0, y: -35 },
  mouth: { x: 0, y: -35 },
  eyes: { x: 0, y: -35 },
  body: { x: 0, y: -35 },
  feet: { x: 0, y: 0 },
  head: { x: 0, y: -35 }
};

export type CharConfig = Record<LayerName, string>;

// Available assets per layer (filenames must exist under public/assets/characters/<layer>/)
export const TRAIT_POOLS: Record<LayerName, string[]> = {
  templates: ['template_face_body.png', 'template_face.png'],
  mouth: ['mouth_smile.png', 'mouth_serious.png', 'mouth_open.png', 'mouth_teeth_smile.png', 'mouth_sad.png', 'mouth_double_serious.png'],
  eyes: ['eyes_3d.png', 'eyes_closed.png', 'eyes_squint.png', 'eyes_sigh.png', 'eyes_raised.png', 'eyes_pirate_patch.png', 'eyes_nerd_glasses.png', 'eyes_nerd_yellow_glasses.png', 'eyes_ski_glasses.png', 'eyes_meme_glassess.png', 'eyes_mvx_vibes.png', 'eyes_orange_sunset.png', 'eyes_cyborg.png'],
  body: ['body_naked.png', 'body_clouths_clean_white.png', 'body_clouths_clean_blue.png', 'body_clouths_clean_oj.png', 'body_clouths_clean_coray.png', 'body_clouths_clean_gold.png', 'body_clouths_rainbow_oj.png', 'body_gradient.png', 'body_frac.png', 'body_mvx_blouser.png', 'body_mvx_blouser _metalic_gray.png'],
  feet: ['feet_default.png'],
  head: ['head_blue.png', 'head_afro.png', 'head_coray_cap.png', 'head_detective_black.png', 'head_detective_brown.png', 'head_doorag.png', 'head_oj_cap.png', 'head_orange_band.png', 'head_pinwheelhat.png', 'head_red_band.png', 'head_special_forces.png', 'head_sunflower_beanie.png'],
  oneofone: ['none']
};

export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRandomConfig(): CharConfig {
  return {
    templates: randomPick(TRAIT_POOLS.templates),
    mouth: randomPick(TRAIT_POOLS.mouth),
    eyes: randomPick(TRAIT_POOLS.eyes),
    // Force body to always be naked regardless of pool
    body: 'body_naked.png',
    feet: randomPick(TRAIT_POOLS.feet),
    head: randomPick(TRAIT_POOLS.head),
    oneofone: 'none'
  };
}

export const DEFAULT_CONFIG: CharConfig = {
  templates: 'template_face_body.png',
  mouth: 'mouth_double_serious.png',
  eyes: 'eyes_sigh.png',
  body: 'body_naked.png',
  feet: 'feet_default.png',
  head: 'none',
  oneofone: 'none'
};


