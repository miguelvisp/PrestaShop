'use strict';

var client;
var webdriverio = require('webdriverio');
var globals = require('./globals.webdriverio.js');

var options = {
  logLevel: 'silent',
  waitForTimeout: 30000,
  desiredCapabilities: {
    browserName: 'chrome',
  },
  port: 4444,
  deprecationWarnings: false
};
if (typeof global.selenium_url !== 'undefined') {
  options.host = global.selenium_url;
}

var options2 = {
  logLevel: 'silent',
  waitForTimeout: 30000,
  desiredCapabilities: {
    browserName: 'chrome',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
    username: process.env.SAUCE_USERNAME,
    access_key: process.env.SAUCE_ACCESS_KEY,
    screenResolution: "1680x1050",
    platform: "Windows 7"
  },
  port: 4445,
  deprecationWarnings: false
};

function initCommands(client) {

  client.addCommand('linkAccess', function (link) {
    return client
      .url('http://' + link)
  });

  client.addCommand('localhost', function (link) {
    return client
      .url('http://' + link + '/install-dev')
  });

  client.addCommand('waitForExistAndClick', function (selector, timeout = 90000) {
    return client
      .waitForExist(selector, timeout)
      .click(selector)
  });

  client.addCommand('waitAndSetValue', function (selector, value, timeout = 90000) {
    return client
      .waitForExist(selector, timeout)
      .setValue(selector, value)
  });

  client.addCommand('scrollTo', function (selector, margin = 150) {
    return client
      .getLocation(selector)
      .then((location) => client.scroll(location.x, location.y - margin));
  });

  client.addCommand('scrollWaitForExistAndClick', function (selector, margin = 150, timeout = 90000) {
    return client
      .scrollTo(selector, margin)
      .waitForExistAndClick(selector, timeout)
  });

  client.addCommand('waitForVisibleAndClick', function (selector, timeout = 90000) {
    return client
      .waitForVisible(selector, timeout)
      .click(selector)
  });

  client.addCommand('waitForVisibleElement', function (selector, timeout = 90000) {
    return client
      .waitForVisible(selector, timeout)
  });

  client.addCommand('waitAndSelectByValue', function (selector, value, timeout = 60000) {
    return client
      .waitForExist(selector, timeout)
      .selectByValue(selector, value)
  });

  client.addCommand('waitAndSelectByVisibleText', function (selector, value, timeout = 60000) {
    return client
      .waitForExist(selector, timeout)
      .selectByVisibleText(selector, value)
  });

  client.addCommand('signInBO', function (selector, link = URL, login = 'demo@prestashop.com', password='prestashop_demo') {
    this.selector = globals.selector;
    return client
      .url('http://' + link + '/admin-dev')
      .waitAndSetValue(selector.login_input, login)
      .waitAndSetValue(selector.password_inputBO, password)
      .waitForExistAndClick(selector.login_buttonBO)
      .waitForExist(selector.menuBO, 120000)
  });

  client.addCommand('waitAndSelectByAttribute', function (selector, attribute, value, pause = 0, timeout = 60000) {
    return client
      .waitForExist(selector, timeout)
      .selectByAttribute(selector, attribute, value)
      .pause(pause)
  });

  client.addCommand('signInFO', function (selector, link = URL) {
    return client
      .url('http://' + link)
      .waitForExistAndClick(selector.sign_in_button)
      .waitAndSetValue(selector.login_input, 'pub@prestashop.com')
      .waitAndSetValue(selector.password_inputFO, '123456789')
      .waitForExistAndClick(selector.login_button)
      .waitForExistAndClick(selector.logo_home_page)
  });

  client.addCommand('signOutBO', function () {
    return client
      .deleteCookie();
  });

  client.addCommand('signOutFO', function (selector) {
    return client
      .waitForExistAndClick(selector.sign_out_button)
      .waitForExist(selector.sign_in_button, 90000)
      .deleteCookie();
  });

  client.addCommand('accessToFO', function (selector) {
    return client
      .url('http://' + URL)
      .waitForExistAndClick(selector.logo_home_page)
  });

  client.addCommand('switchWindow', function (id) {
    return client
      .getTabIds()
      .then(ids => client.switchTab(ids[id]))
      .refresh()
  });
}

module.exports = {
  getClient: function () {
    if (client) {
      return client;
    } else {
      if (typeof headless !== 'undefined' && headless) {
        options["desiredCapabilities"] = {
          browserName: 'chrome',
          chromeOptions: {
            args: ['--headless', '--disable-gpu', '--window-size=1270,899']
          }
        }
      }
      client = webdriverio.remote(options);
      initCommands(client);
      return client;
    }
  },
  getCustomDate: function (numberOfDay) {
    var today = new Date();
    today.setDate(today.getDate() + numberOfDay);
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }

    today = yyyy + '-' + mm + '-' + dd;
    return today;
  },
  browser: function () {
    return options.desiredCapabilities.browserName
  }
};
