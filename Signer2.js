const fs = require("fs");
const { JSDOM, ResourceLoader } = require("jsdom");
const { createCipheriv } = require("crypto");

class Signer {
  static DEFAULT_USERAGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 Edg/107.0.1418.35";
  static PASSWORD = "webapp1.0+202106";
  /**
   * @type Window
   */
  window = null;

  constructor(userAgent = Signer.DEFAULT_USERAGENT) {
    const signature_js = fs.readFileSync(__dirname + "/signature.js", "utf-8");
    const webmssdk = fs.readFileSync(__dirname + "/webmssdk.js", "utf-8");
    const resourceLoader = new ResourceLoader({ userAgent });

    const { window } = new JSDOM("", {
      url: "https://www.douyin.com",
      referrer: "https://www.douyin.com",
      contentType: "text/html",
      includeNodeLocations: false,
      runScripts: "outside-only",
      pretendToBeVisual: true,
      resources: resourceLoader
    });
    this.window = window;
    this.window.eval(signature_js.toString());
    this.window.byted_acrawler.init({
      aid: 24,
      dfp: true
    });
    this.window.eval(webmssdk);
  }

  navigator() {
    return {
      deviceScaleFactor: this.window.devicePixelRatio,
      user_agent: this.window.navigator.userAgent,
      browser_language: this.window.navigator.language,
      browser_platform: this.window.navigator.platform,
      browser_name: this.window.navigator.appCodeName,
      browser_version: this.window.navigator.appVersion
    };
  }

  signature(url) {
    return this.window.byted_acrawler.sign({ url });
  }

  bogus(params) {
    return this.window._0x32d649(params);
  }

  xttparams(params) {
    params += "&verifyFp=undefined";
    params += "&is_encryption=1";
    // Encrypt query string using aes-128-cbc
    const cipher = createCipheriv("aes-128-cbc", Signer.PASSWORD, Signer.PASSWORD);
    return Buffer.concat([cipher.update(params), cipher.final()]).toString("base64");
  }

  sign(url_str) {
    const url = new URL(url_str);
    const signature = this.signature(url.toString());
    url.searchParams.append('_signature', signature);
    const bogus = this.bogus(url.searchParams.toString());
    url.searchParams.append('X-Bogus', bogus);
    const xttparams = this.xttparams(url.searchParams.toString());
    return {
      signature: signature,
      signed_url: url.toString(),
      "x-tt-params": xttparams,
      "X-Bogus": bogus
    };
  }
}

module.exports = Signer;
