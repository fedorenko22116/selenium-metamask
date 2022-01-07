import { By, Locator, WebDriver, WebElement, WebElementCondition, until } from 'selenium-webdriver'

export interface SeleniumKit {
  elementLocated(locator: Locator): WebElementCondition
}

export interface Network {
  name: string
  rpcUrl: string
  chainIdentifier: string
  symbol?: string
  explorerUrl?: string
}

export interface Account {
  name: string
  imported: boolean
}

class DriverHelper {
  /**
   * @param driver
   * @param kit Until set from original library
   * @param defaultTimeout Timeout for all await actions
   */
  public constructor(
    protected driver: WebDriver,
    protected kit: SeleniumKit = until,
    protected defaultTimeout: number = 3000
  ) {}

  protected async openExtensionPage(path: string = ''): Promise<void> {
    const browserName = (await this.driver.getCapabilities()).getBrowserName() || ''

    if (browserName.toLowerCase().includes('firefox')) {
      await this.driver.get('moz-extension://85ca8b6b-c5b4-4006-90d8-d47cd8ab7121/home.html')
    } else {
      await this.driver.get('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html' + path)
    }
  }

  protected async waitForElement(
    locator: Locator,
    timeout: number = this.defaultTimeout,
    message?: string
  ): Promise<WebElement> {
    await this.driver.wait(this.kit.elementLocated(locator), timeout, message)

    return this.driver.findElement(locator)
  }

  protected async waitForElements(
    locator: Locator,
    timeout: number = 3000,
    message?: string
  ): Promise<Array<WebElement>> {
    await this.driver.wait(this.kit.elementLocated(locator), timeout, message)

    return this.driver.findElements(locator)
  }

  protected async waitAndClick(
    locator: Locator,
    timeout: number = this.defaultTimeout,
    message?: string
  ): Promise<void> {
    const element = await this.waitForElement(locator, timeout, message)

    while (true) {
      try {
        return await element.click()
      } catch (_) {
        await this.driver.sleep(200)
      }
    }
  }
}

export class MetaMaskSession extends DriverHelper {
  public accounts: Array<Account> = [{ name: 'Account 1', imported: false }]

  public networks: Array<Network> = [
    {
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://main-light.eth.linkpool.io/',
      chainIdentifier: '1',
      symbol: 'ETH',
      explorerUrl: 'https://etherscan.io/',
    },
  ]

  public async importAccount(privateKey: string): Promise<Account> {
    await this.openExtensionPage()
    await this.waitAndClick(By.className('account-menu__icon'), this.defaultTimeout, 'Failed to import account')
    await this.waitAndClick(By.xpath("//img[@src='images/import-account.svg']"))
    await this.waitForElement(By.className('new-account-import-form__input-password')).then(e => e.sendKeys(privateKey))
    await this.waitAndClick(By.xpath("//button[contains(text(),'Import')]"))

    const accountName = await this.waitForElement(By.className('selected-account__name')).then(e => e.getText())
    this.accounts.push({ name: accountName, imported: true })

    return this.accounts[this.accounts.length - 1]
  }

  public async getAccountAddress(): Promise<string> {
    await this.openExtensionPage()
    await this.waitAndClick(By.xpath("//button[@data-testid='account-options-menu-button']"))
    await this.waitAndClick(By.xpath("//button[@data-testid='account-options-menu__account-details']"))

    return await this.waitForElement(By.className('qr-code__address')).then(e => e.getText())
  }

  public async createAccount(name: string): Promise<Account> {
    await this.openExtensionPage()
    await this.waitAndClick(By.className('account-menu__icon'), this.defaultTimeout, 'Failed to create account')
    await this.waitAndClick(By.xpath("//img[@src='images/plus-btn-white.svg']"))
    await this.waitForElement(By.className('new-account-create-form__input')).then(e => e.sendKeys(name))
    await this.waitAndClick(By.xpath("//button[contains(text(),'Create')]"))

    const accountName = await this.waitForElement(By.className('selected-account__name')).then(e => e.getText())

    this.accounts.push({ name: accountName, imported: false })

    return this.accounts[this.accounts.length - 1]
  }

  public async switchAccount(account: Account): Promise<void> {
    await this.openExtensionPage()
    await this.waitAndClick(By.className('account-menu__icon'), this.defaultTimeout, 'Failed to switch account')
    const accountElements = await this.waitForElements(By.className('account-menu__name'))

    for (let accountElement of accountElements) {
      if ((await accountElement.getText()) === account.name) {
        await accountElement.click()
        await this.driver.sleep(1000)
        return
      }
    }

    throw new Error(`Undefined account '${account.name}'`)
  }

  public async addNetwork(network: Network): Promise<void> {
    await this.openExtensionPage('#settings/networks/add-network')

    const inputs = await this.waitForElements(
      By.className('form-field__input'),
      this.defaultTimeout,
      'Failed to open extension page /add-network path'
    )

    await inputs[0].sendKeys(network.name)
    await inputs[1].sendKeys(network.rpcUrl)
    await inputs[2].sendKeys(network.chainIdentifier)

    if (network.symbol) {
      await inputs[3].sendKeys(network.symbol)
    }

    if (network.explorerUrl) {
      await inputs[4].sendKeys(network.explorerUrl)
    }

    await this.waitAndClick(By.xpath("//button[contains(text(),'Save')]"))
    await this.driver.sleep(1000)

    this.networks.push(network)
  }

  public async switchNetwork(network: Network): Promise<void> {
    await this.openExtensionPage()
    await this.waitAndClick(By.className('network-display'))

    const networksElements = await this.waitForElements(By.className('network-name-item'))

    for (let networkElement of networksElements) {
      if ((await networkElement.getText()) === network.name) {
        await networkElement.click()
        await this.driver.sleep(2000)
        return
      }
    }

    throw new Error(`Undefined network '${network.name}'`)
  }
}

export class MetaMask extends DriverHelper {
  private static readonly PASSWORD: string = 'password'

  /**
   * @throws Error
   */
  public async login(seed: string): Promise<MetaMaskSession> {
    await this.openExtensionPage()

    await this.waitAndClick(
      By.xpath("//button[contains(text(),'Get Started')]"),
      this.defaultTimeout,
      'Extension page is not loaded or session already started'
    )
    await this.waitAndClick(By.xpath("//button[contains(text(),'Import wallet')]"))
    await this.waitAndClick(By.xpath("//button[contains(text(),'I Agree')]"))

    await this.driver.sleep(500)

    await this.waitForElement(By.xpath("//input[@placeholder='Paste Secret Recovery Phrase from clipboard']")).then(e =>
      e.sendKeys(seed)
    )

    await this.driver.findElement(By.id('password')).sendKeys(MetaMask.PASSWORD)
    await this.driver.findElement(By.id('confirm-password')).sendKeys(MetaMask.PASSWORD)
    await this.driver.findElement(By.className('first-time-flow__terms')).click()
    await this.driver.findElement(By.xpath("//button[contains(text(),'Import')]")).click()

    await this.waitForElement(
      By.xpath("//button[contains(text(),'All Done')]"),
      this.defaultTimeout,
      'Failed to fetch MetaMask network data'
    ).then(e => e.click())

    return new MetaMaskSession(this.driver, this.kit, this.defaultTimeout)
  }
}
