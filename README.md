# selenium-metamask

MetaMask wrapper for selenium webdriver API

(Chrome/Firefox supported only)

## Requirements

* selenium ^4.1
* webdriver ^4.1

## Installation

```shell
npm install selenium-metamask
```

## Implemented actions

* Authorization
* Importing account
* Creation account
* Switching account
* Adding network
* Switching network
* Getting account address

## Usage

```ts
import { Builder, until } from "selenium-webdriver"
import { Options } from "selenium-webdriver/chrome"
import { Loader, MetaMask } from "selenium-metamask"

async function init() {
    const builder = new Builder()
        .withCapabilities({
            'goog:chromeOptions': {
                excludeSwitches: ['enable-automation', 'useAutomationExtension'],
            },
        })
        .forBrowser('chrome')
        .usingServer('http://localhost:4444/')
    const loader = new Loader(builder)

    loader.loadChromeExtension(new Options())

    const driver = builder.build()
    const metaMask = new MetaMask(driver, until)
    const session = await metaMask.login('seed phrase')
    await session.addNetwork({
        name: 'NetworkName',
        chainIdentifier: '123',
        explorerUrl: 'https://explorer.example.com',
        rpcUrl: 'https://rpc.example.com',
        symbol: 'EXAMPLE',
    })
    await session.importAccount('private key')

    // Other tests
}
```
