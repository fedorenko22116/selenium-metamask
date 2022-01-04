import {
  Actions,
  By,
  Capabilities,
  Condition,
  FileDetector,
  Locator,
  Navigation,
  Options,
  Session,
  TargetLocator,
  ThenableWebDriver,
  until,
  WebDriver,
  WebElement,
  WebElementCondition,
  WebElementPromise,
} from 'selenium-webdriver';
import { Command, Executor } from 'selenium-webdriver/lib/command';

export interface Network {
  name: string;
  rpcUrl: string;
  chainIdentifier: string;
  symbol?: string;
  explorerUrl?: string;
}

class DriverHelper {
  public constructor(protected driver: MetaMaskWebDriver) {}

  protected async openExtensionPage(path: string = ''): Promise<void> {
    await this.driver.get(
      'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html' + path
    );
  }

  protected async waitForElement(
    locator: Locator,
    timeout?: number,
    message?: string
  ): Promise<WebElement> {
    await this.driver.wait(until.elementLocated(locator), timeout, message);

    return this.driver.findElement(locator);
  }

  protected async waitForElements(
    locator: Locator
  ): Promise<Array<WebElement>> {
    await this.driver.wait(until.elementLocated(locator));

    return this.driver.findElements(locator);
  }

  protected async waitAndClick(
    locator: Locator,
    timeout?: number
  ): Promise<void> {
    const element = await this.waitForElement(locator, timeout);

    while (true) {
      try {
        return await element.click();
      } catch (_) {
        await this.driver.sleep(200);
      }
    }
  }
}

export class MetaMaskManager extends DriverHelper {
  public async importAccount(privateKey: string): Promise<void> {
    await this.openExtensionPage();
    await this.waitAndClick(By.className('account-menu__icon'));
    await this.waitAndClick(
      By.xpath("//img[@src='images/import-account.svg']")
    );
    await this.waitForElement(
      By.className('new-account-import-form__input-password')
    ).then(e => e.sendKeys(privateKey));
    await this.waitAndClick(By.xpath("//button[contains(text(),'Import')]"));
  }

  public async useNetwork(network: Network): Promise<void> {
    await this.openExtensionPage('#settings/networks/add-network');

    const inputs = await this.waitForElements(
      By.className('form-field__input')
    );

    await inputs[0].sendKeys(network.name);
    await inputs[1].sendKeys(network.rpcUrl);
    await inputs[2].sendKeys(network.chainIdentifier);

    if (network.symbol) {
      await inputs[3].sendKeys(network.symbol);
    }

    if (network.explorerUrl) {
      await inputs[4].sendKeys(network.explorerUrl);
    }

    await this.waitAndClick(By.xpath("//button[contains(text(),'Save')]"));
    await this.driver.sleep(1000);
  }
}

export class MetaMask extends DriverHelper {
  private static readonly PASSWORD: string = 'password';

  /**
   * @throws Error
   */
  public async login(seed: string): Promise<MetaMaskManager> {
    await this.openExtensionPage();

    await this.waitAndClick(
      By.xpath("//button[contains(text(),'Get Started')]"),
      5000
    );
    await this.waitAndClick(
      By.xpath("//button[contains(text(),'Import wallet')]")
    );
    await this.waitAndClick(By.xpath("//button[contains(text(),'I Agree')]"));

    await this.driver.sleep(500);

    await this.waitForElement(
      By.xpath(
        "//input[@placeholder='Paste Secret Recovery Phrase from clipboard']"
      )
    ).then(e => e.sendKeys(seed));

    await this.driver
      .findElement(By.id('password'))
      .sendKeys(MetaMask.PASSWORD);
    await this.driver
      .findElement(By.id('confirm-password'))
      .sendKeys(MetaMask.PASSWORD);
    await this.driver
      .findElement(By.className('first-time-flow__terms'))
      .click();
    await this.driver
      .findElement(By.xpath("//button[contains(text(),'Import')]"))
      .click();

    await this.waitForElement(
      By.xpath("//button[contains(text(),'All Done')]"),
      3000,
      'Failed to fetch network data'
    ).then(e => e.click());

    return new MetaMaskManager(this.driver);
  }
}

export class MetaMaskWebDriver implements ThenableWebDriver {
  public constructor(private driver: ThenableWebDriver) {}

  public metaMask(): MetaMask {
    return new MetaMask(this);
  }

  public actions(
    options?:
      | { async: boolean; bridge: boolean }
      | { async: boolean }
      | { bridge: boolean }
  ): Actions {
    return this.driver.actions(options);
  }

  public close(): Promise<void> {
    return this.driver.close();
  }

  public execute<T>(command: Command, description?: string): Promise<T> {
    return this.driver.execute(command, description);
  }

  public executeAsyncScript<T>(
    script: string | Function,
    ...var_args: any[]
  ): Promise<T> {
    return this.driver.executeAsyncScript(script, ...var_args);
  }

  public executeScript<T>(
    script: string | Function,
    ...var_args: any[]
  ): Promise<T> {
    return this.driver.executeScript(script, ...var_args);
  }

  public findElement(locator: Locator): WebElementPromise {
    return this.driver.findElement(locator);
  }

  public findElements(locator: Locator): Promise<WebElement[]> {
    return this.driver.findElements(locator);
  }

  public get(url: string): Promise<void> {
    return this.driver.get(url);
  }

  public getAllWindowHandles(): Promise<string[]> {
    return this.driver.getAllWindowHandles();
  }

  public getCapabilities(): Promise<Capabilities> {
    return this.driver.getCapabilities();
  }

  public getCurrentUrl(): Promise<string> {
    return this.driver.getCurrentUrl();
  }

  public getExecutor(): Executor {
    return this.driver.getExecutor();
  }

  public getPageSource(): Promise<string> {
    return this.driver.getPageSource();
  }

  public getSession(): Promise<Session> {
    return this.driver.getSession();
  }

  public getTitle(): Promise<string> {
    return this.driver.getTitle();
  }

  public getWindowHandle(): Promise<string> {
    return this.driver.getWindowHandle();
  }

  public manage(): Options {
    return this.driver.manage();
  }

  public navigate(): Navigation {
    return this.driver.navigate();
  }

  public quit(): Promise<void> {
    return this.driver.quit();
  }

  public setFileDetector(detector: FileDetector): void {
    this.driver.setFileDetector(detector);
  }

  public sleep(ms: number): Promise<void> {
    return this.driver.sleep(ms);
  }

  public switchTo(): TargetLocator {
    return this.driver.switchTo();
  }

  public takeScreenshot(): Promise<string> {
    return this.driver.takeScreenshot();
  }

  public wait(
    condition: WebElementCondition,
    opt_timeout?: number,
    opt_message?: string
  ): WebElementPromise;
  public wait<T>(
    condition:
      | PromiseLike<T>
      | Condition<T>
      | ((driver: MetaMaskWebDriver) => PromiseLike<T> | T)
      | Function,
    opt_timeout?: number,
    opt_message?: string
  ): Promise<T>;
  public wait(
    condition: WebElementCondition,
    opt_timeout?: number,
    opt_message?: string
  ): any {
    return this.driver.wait(condition, opt_timeout, opt_message);
  }

  public then<TResult1 = WebDriver, TResult2 = never>(
    onfulfilled?:
      | ((value: WebDriver) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.driver.then(onfulfilled, onrejected);
  }

  public catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<WebDriver | TResult> {
    return this.driver.catch(onrejected);
  }

  public finally(onfinally?: (() => void) | null): Promise<WebDriver> {
    return this.driver.finally(onfinally);
  }

  public [Symbol.toStringTag]: string;
}
