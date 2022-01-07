import {By, Locator, WebDriver, WebElement, WebElementCondition} from 'selenium-webdriver'

export interface SeleniumKit {
  elementLocated(locator: Locator): WebElementCondition,
}

export interface Network {
  name: string
  rpcUrl: string
  chainIdentifier: string
  symbol?: string
  explorerUrl?: string
}

class DriverHelper {
  public constructor(protected driver: WebDriver, protected kit: SeleniumKit) {}

  protected async openExtensionPage(path: string = ''): Promise<void> {
    await this.driver.get('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html' + path)
  }

  protected async waitForElement(locator: Locator, timeout: number = 3000, message?: string): Promise<WebElement> {
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

  protected async waitAndClick(locator: Locator, timeout: number = 3000, message?: string): Promise<void> {
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
  public async importAccount(privateKey: string): Promise<void> {
    await this.openExtensionPage()
    await this.waitAndClick(By.className('account-menu__icon'), 3000, 'Failed to import account')
    await this.waitAndClick(By.xpath("//img[@src='images/import-account.svg']"))
    await this.waitForElement(By.className('new-account-import-form__input-password')).then(e => e.sendKeys(privateKey))
    await this.waitAndClick(By.xpath("//button[contains(text(),'Import')]"))
  }

  public async useNetwork(network: Network): Promise<void> {
    await this.openExtensionPage('#settings/networks/add-network')

    const inputs = await this.waitForElements(
        By.className('form-field__input'),
        3000,
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
        3000,
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
      3000,
      'Failed to fetch MetaMask network data'
    ).then(e => e.click())

    return new MetaMaskSession(this.driver, this.kit)
  }
}
