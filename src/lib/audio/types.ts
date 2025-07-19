// 音響システムの型定義

export type BGMTrack = 
  | 'opening'
  | 'stage1'
  | 'stage2'
  | 'stage3'
  | 'semifinal'
  | 'final'

export type SFXType = 
  | 'gameOver'
  | 'blockDrop'
  | 'lineClear'
  | 'rotate'
  | 'pauseMenu'
  | 'stageClear'
  | 'gameStart'

export interface AudioSettings {
  masterVolume: number    // 0-100
  bgmVolume: number       // 0-100
  sfxVolume: number       // 0-100
  muted: boolean
  bgmEnabled: boolean
  sfxEnabled: boolean
}

export interface BGMConfig {
  track: BGMTrack
  file: string
  loop: boolean
  volume?: number
}

export interface SFXConfig {
  type: SFXType
  file: string
  volume?: number
  priority?: number
}

export interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
}

export interface BGMPlayerInterface {
  play(track: BGMTrack): Promise<void>
  stop(): void
  pause(): void
  resume(): void
  setVolume(volume: number): void
  fadeIn(duration?: number): Promise<void>
  fadeOut(duration?: number): Promise<void>
  getCurrentTrack(): BGMTrack | null
  getState(): AudioPlayerState
}

export interface SFXPlayerInterface {
  play(type: SFXType, options?: { volume?: number }): Promise<void>
  preload(types: SFXType[]): Promise<void>
  setVolume(volume: number): void
  mute(): void
  unmute(): void
}

export interface AudioManagerInterface {
  bgm: BGMPlayerInterface
  sfx: SFXPlayerInterface
  initialize(): Promise<void>
  setSettings(settings: Partial<AudioSettings>): void
  getSettings(): AudioSettings
  mute(): void
  unmute(): void
  destroy(): void
}

// レベル別BGM設定
export const LEVEL_BGM_MAP: Record<number, BGMTrack> = {
  0: 'opening',
  1: 'stage1',
  2: 'stage1',
  3: 'stage2',
  4: 'stage2',
  5: 'stage3',
  6: 'stage3',
  7: 'stage3',
  8: 'semifinal',
  9: 'final'
}

// BGM設定
export const BGM_CONFIGS: Record<BGMTrack, BGMConfig> = {
  opening: {
    track: 'opening',
    file: '/sounds/tetris_bgm_opening.m4a',
    loop: true,
    volume: 0.7
  },
  stage1: {
    track: 'stage1',
    file: '/sounds/tetris_bgm_stage_1.m4a',
    loop: true,
    volume: 0.8
  },
  stage2: {
    track: 'stage2',
    file: '/sounds/tetris_bgm_stage_2.m4a',
    loop: true,
    volume: 0.8
  },
  stage3: {
    track: 'stage3',
    file: '/sounds/tetris_bgm_stage_3.m4a',
    loop: true,
    volume: 0.8
  },
  semifinal: {
    track: 'semifinal',
    file: '/sounds/semifinal_stage_main_sound.mp3',
    loop: true,
    volume: 0.9
  },
  final: {
    track: 'final',
    file: '/sounds/final_stage_main_sound.mp3',
    loop: true,
    volume: 1.0
  }
}

// 効果音設定
export const SFX_CONFIGS: Record<SFXType, SFXConfig> = {
  gameOver: {
    type: 'gameOver',
    file: '/sounds/game_over.mp3',
    volume: 0.8,
    priority: 10
  },
  blockDrop: {
    type: 'blockDrop',
    file: '/sounds/down_key.mp3',
    volume: 0.6,
    priority: 1
  },
  lineClear: {
    type: 'lineClear',
    file: '/sounds/delete_block.mp3',
    volume: 0.8,
    priority: 5
  },
  rotate: {
    type: 'rotate',
    file: '/sounds/rotate.mp3',
    volume: 0.5,
    priority: 2
  },
  pauseMenu: {
    type: 'pauseMenu',
    file: '/sounds/pause_menu.mp3',
    volume: 0.7,
    priority: 3
  },
  stageClear: {
    type: 'stageClear',
    file: '/sounds/stage_clear.mp3',
    volume: 0.9,
    priority: 8
  },
  gameStart: {
    type: 'gameStart',
    file: '/sounds/game_start_sound.mp3',
    volume: 0.8,
    priority: 6
  }
}

// デフォルト音響設定
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 70,
  bgmVolume: 60,
  sfxVolume: 80,
  muted: false,
  bgmEnabled: true,
  sfxEnabled: true
}