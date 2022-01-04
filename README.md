# selenium-metamask

MetaMask wrapper for selenium chrome webdriver API

## Requirements

* selenium ^4.1
* chrome-webdriver ^4.1

Works only as npm module

## Installation

```shell
npm install selenium-metamask
```

## Usage

```ts
import { Builder } from "selenium-webdriver"
import { MetaMaskBuilder } from "selenium-metamask"

async function init() {
    const builder = new Builder()
    const metaMaskBuilder = new MetaMaskBuilder(builder)
        .withCapabilities({
            'goog:chromeOptions': {
                excludeSwitches: ['enable-automation', 'useAutomationExtension'],
            },
        })
        .forBrowser('chrome')
        .usingServer('http://localhost:4444/')
        .build()

    const metaMask = await metaMaskBuilder.login('seed phrase')
    await metaMask.useNetwork({
        name: 'NetworkName',
        chainIdentifier: '123',
        explorerUrl: 'https://explorer.example.com',
        rpcUrl: 'https://rpc.example.com',
        symbol: 'EXAMPLE',
    })
    await metaMask.importAccount('private key')

    // Other tests
}
```
