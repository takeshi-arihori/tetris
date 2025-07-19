// 音響システムの統合エクスポート

export { AudioManager, getAudioManager, initializeAudio } from './AudioManager'
export { BGMPlayer } from './BGMPlayer'
export { SFXPlayer } from './SFXPlayer'

export type {
  AudioSettings,
  BGMTrack,
  SFXType,
  BGMConfig,
  SFXConfig,
  AudioPlayerState,
  BGMPlayerInterface,
  SFXPlayerInterface,
  AudioManagerInterface
} from './types'

export {
  LEVEL_BGM_MAP,
  BGM_CONFIGS,
  SFX_CONFIGS,
  DEFAULT_AUDIO_SETTINGS
} from './types'