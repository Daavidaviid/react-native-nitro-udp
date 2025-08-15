import { NitroModules } from 'react-native-nitro-modules'
import type { Udp as UdpType } from './specs/Udp.nitro'
import { useEffect } from 'react'

export const Udp = NitroModules.createHybridObject<UdpType>('Udp')

type UseUdpProps = {
  host: string
  port: number
  onReceive: (data: ArrayBuffer) => void
}

export const useUdp = ({ host, port, onReceive }: UseUdpProps) => {
  useEffect(() => {
    Udp.initialize(host, port)

    Udp.onReceive(onReceive)

    return () => {
      Udp.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const send = (data: ArrayBuffer) => {
    Udp.send(data)
  }

  return {
    send,
  }
}
