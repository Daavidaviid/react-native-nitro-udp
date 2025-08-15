# react-native-nitro-udp

## Getting started

Add the library to your project and react-native-nitro-modules if not installed already

#### npm

```bash
npm i react-native-nitro-udp react-native-nitro-modules
```

#### yarn

```bash
yarn add react-native-nitro-udp react-native-nitro-modules
```

#### bun

```bash
bun add react-native-nitro-udp react-native-nitro-modules
```

Then run `pod install` or `npm expo run:ios` / `npm expo run:android`

## How to use

Use the `useUdp()` hook:

```tsx
const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1'

function HomeScreen() {
  const { send } = useUdp({ host: LOCALHOST, port: 1234 }, (data) => {
    console.log('Received data:', data)
  })

  return <Button title="Send" onPress={() => send(new TextEncoder().encode('Hello, world!').buffer)} />
}
```

Check the file `example/server.ts` [here](https://github.com/Daavidaviid/expo-udp/tree/main/example) to see an example server using Bun.

We use u18n.com for the high quality automatic translation in many languages (see [/example/u18n.json](https://github.com/Daavidaviid/expo-udp/tree/main/example/u18n.json))