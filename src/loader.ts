import { Builder } from 'selenium-webdriver'
import { Options as ChromeOptions } from 'selenium-webdriver/chrome'
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox'
import path from 'path'

export class Loader {
  public constructor(private builder: Builder) {}

  loadChromeExtension(options: ChromeOptions): void {
    options.addExtensions(path.resolve(__dirname, '../resources/metamask.crx'))
    this.builder.setChromeOptions(options)
  }

  loadFirefoxExtension(options: FirefoxOptions): void {
    options.addExtensions(path.resolve(__dirname, '../resources/metamask.xpi'))
    this.builder.setFirefoxOptions(options)
  }
}
