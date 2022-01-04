import { Builder, Capabilities, ProxyConfig } from 'selenium-webdriver';
import path from 'path';
import {
  Options as ChromeOptions,
  ServiceBuilder as ChromeServiceBuilder,
} from 'selenium-webdriver/chrome';
import {
  Options as IEOptions,
  ServiceBuilder as IEServiceBuilder,
} from 'selenium-webdriver/ie';
import {
  Options as FirefoxOptions,
  ServiceBuilder as FirefoxServiceBuilder,
} from 'selenium-webdriver/firefox';
import {
  Options as EdgeOptions,
  ServiceBuilder as EdgeServiceBuilder,
} from 'selenium-webdriver/edge';
import { Options as SafariOptions } from 'selenium-webdriver/safari';
import { Preferences } from 'selenium-webdriver/lib/logging';
import { MetaMaskWebDriver } from './driver';

export class MetaMaskBuilder implements Builder {
  public constructor(private builder: Builder) {
    const options = builder.getChromeOptions() || new ChromeOptions()
    options.addExtensions(path.resolve(__dirname, '../resources/metamask.crx'))
    this.setChromeOptions(options)
  }

  public build(): MetaMaskWebDriver {
    return new MetaMaskWebDriver(this.builder.build())
  }

  // @ts-ignore
  disableEnvironmentOverrides(): MetaMaskBuilder {
    this.builder.disableEnvironmentOverrides();

    return this;
  }

  // @ts-ignore
  forBrowser(
    name: 'chrome',
    opt_version?: string,
    opt_platform?: string
  ): MetaMaskBuilder {
    this.builder.forBrowser(name, opt_version, opt_platform);

    return this;
  }

  getCapabilities(): Capabilities {
    return this.builder.getCapabilities();
  }

  getServerUrl(): string {
    return this.builder.getServerUrl();
  }

  getWebDriverProxy(): string | null {
    return this.builder.getWebDriverProxy();
  }

  // @ts-ignore
  setAlertBehavior(behavior?: string): MetaMaskBuilder {
    this.builder.setAlertBehavior(behavior);

    return this;
  }

  // @ts-ignore
  setChromeOptions(options: ChromeOptions): MetaMaskBuilder {
    this.builder.setChromeOptions(options);

    return this;
  }

  getChromeOptions(): ChromeOptions {
    return this.builder.getChromeOptions();
  }

  // @ts-ignore
  setChromeService(service: ChromeServiceBuilder): MetaMaskBuilder {
    this.builder.setChromeService(service);

    return this;
  }

  // @ts-ignore
  setEdgeOptions(_options: EdgeOptions): MetaMaskBuilder {
    throw new Error('Edge is not supported');
  }

  // @ts-ignore
  setEdgeService(service: EdgeServiceBuilder): MetaMaskBuilder {
    throw new Error('Safari is not supported');
  }

  // @ts-ignore
  setFirefoxOptions(_options: FirefoxOptions): MetaMaskBuilder {
    throw new Error('Firefox is not supported');
  }

  // @ts-ignore
  getFirefoxOptions(): FirefoxOptions {
    throw new Error('Firefox is not supported');
  }

  // @ts-ignore
  setFirefoxService(service: FirefoxServiceBuilder): MetaMaskBuilder {
    throw new Error('Firefox is not supported');
  }

  // @ts-ignore
  setIeOptions(options: IEOptions): MetaMaskBuilder {
    throw new Error('IE is not supported');
  }

  // @ts-ignore
  setIeService(service: IEServiceBuilder): MetaMaskBuilder {
    throw new Error('IE is not supported');
  }

  // @ts-ignore
  setSafariOptions(options: SafariOptions): MetaMaskBuilder {
    throw new Error('Safari is not supported');
  }

  // @ts-ignore
  getSafariOptions(): SafariOptions {
    throw new Error('Safari is not supported');
  }

  // @ts-ignore
  setLoggingPrefs(prefs: Preferences | {}): MetaMaskBuilder {
    this.builder.setLoggingPrefs(prefs);

    return this;
  }

  // @ts-ignore
  setProxy(config: ProxyConfig): MetaMaskBuilder {
    this.builder.setProxy(config);

    return this;
  }

  // @ts-ignore
  usingHttpAgent(agent: any): MetaMaskBuilder {
    this.builder.usingHttpAgent(agent);

    return this;
  }

  getHttpAgent(): any {
    return this.builder.getHttpAgent();
  }

  // @ts-ignore
  usingServer(url: string): MetaMaskBuilder {
    this.builder.usingServer(url);

    return this;
  }

  // @ts-ignore
  usingWebDriverProxy(proxy: string): MetaMaskBuilder {
    this.builder.usingWebDriverProxy(proxy);

    return this;
  }

  // @ts-ignore
  withCapabilities(capabilities: {} | Capabilities): MetaMaskBuilder {
    this.builder.withCapabilities(capabilities);

    return this;
  }
}
