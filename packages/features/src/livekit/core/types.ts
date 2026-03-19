export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface TokenResponse {
  token: string;
  url: string;
}

export interface RoomOptions {
  roomName: string;
  participantName: string;
}