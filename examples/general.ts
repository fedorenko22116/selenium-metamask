import { Builder, until } from "selenium-webdriver"
import { Options } from "selenium-webdriver/chrome"
import { Loader, MetaMask } from "../dist"

async function initialize() {
    const builder = new Builder()
        .withCapabilities({
            'goog:chromeOptions': {
                excludeSwitches: ['enable-automation', 'useAutomationExtension'],
            },
        })
        .forBrowser('chrome')
        .usingServer('http://localhost:4444/')

    new Loader(builder).loadChromeExtension(new Options())

    const driver = builder.build()
    const metaMask = new MetaMask(driver, until)

    console.log('Login In')

    const seed = 'agent battle disorder double arch achieve aisle normal fiscal sound enact duck'
    const session = await metaMask.login(seed)

    console.log('Use Network')

    await session.addNetwork({
        name: 'Polygon',
        chainIdentifier: '137',
        explorerUrl: 'https://polygonscan.com/',
        rpcUrl: 'https://polygon-rpc.com',
        symbol: 'MATIC',
    })

    console.log('Import Account')

    const importedAccount = await session.importAccount('a99c4e083277f33db87cc21eb2cee61ef7174f801b867df72b8ffd227bf54e29')

    console.log('Create Account')

    await session.createAccount('Test Account')

    console.log('Switch Network')

    await session.switchNetwork(session.networks[0])

    console.log('Switch Account')

    await session.switchAccount(importedAccount)

    console.log('Done')
}

initialize()
