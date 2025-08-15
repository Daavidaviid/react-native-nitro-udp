import { type HybridObject } from 'react-native-nitro-modules'

interface Udp extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  initialize(host: string, port: number): void
  send(data: ArrayBuffer): void
  onReceive(callback: (data: ArrayBuffer) => void): void
  close(): void
}

export type { Udp }
