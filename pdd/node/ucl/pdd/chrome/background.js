/*
 * Copyright 2017-2018 UCL / Vincent Primault <v.primault@ucl.ac.uk>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Raven from 'raven-js';
import moment from 'moment';

import { history, storage } from './browser';
import xhr from './util/xhr';
import { encryptCounters, generateKeyPair } from './crypto';

// Configure Sentry reporting. The environment variables are provided at build time.
Raven.config(process.env.SENTRY_DSN, { environment: process.env.NODE_ENV }).install();

const API_URL = process.env.API_URL || 'https://api.ppd.cs.ucl.ac.uk';

// Open the options page just after the extension has been installed.
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage();
  }
});

// Open the options page when the browser button is clicked.
chrome.browserAction.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// If the client is not registered, register it. It should normally happen only once, after the
// extension has been installed, but it may exceptionally happen again, e.g., if the local storage
// has been emptied. We do not store the result in a local variable, as the local cache may
// potentially be wiped out at any time, and will instead try that again at every ping.
getOrRegisterClient();

// At the heart of the extension, there is the "ping" feature. Periodically (typically once a day),
// the API server will be contacted for instructions about what to do. The extension will then
// process those commands and send the server the required information.
chrome.alarms.onAlarm.addListener(alarm => {
  if ('ping' === alarm.name) {
    getOrRegisterClient().then(client => ping(client));
  }
});
// We schedule a first ping in 2 minutes. Normally, scheduling it the next day would be sufficient,
// but for testing purposes the duration of a "day" may be reduced at first. So we prefer to do a
// first useless ping query, that will give us the next ping time.
chrome.alarms.create('ping', { when: moment().add(2, 'minutes').valueOf() });

function ping(client) {
  console.log(`Pinging the server for client ${client.name}...`);
  xhr(`${API_URL}/api/clients/${client.name}/ping`)
    .then(resp => {
      // Submit each sketch that was requested.
      resp.submit.forEach(command => submitSketch(client, command));

      // Schedule next ping time. Normally, the response comes with a suggested time. If for any
      // reason it is not present, we still schedule one for the next day (otherwise the extension
      // will simply stop sending data).
      const nextPingTime = resp.nextPingTime
        ? moment(resp.nextPingTime)
        : moment().add(1, 'day').hours(1);
      chrome.alarms.create('ping', { when: nextPingTime.valueOf() });
    });
}

/**
 * Return the currently registered client, or register a new client it if no one was found.
 *
 * @returns PromiseLike<Client>
 */
function getOrRegisterClient() {
  return storage.getClient().then(client => {
    return client || registerClient();
  });
}

/**
 * Register a new client.
 *
 * @returns Promise<Client>
 */
function registerClient() {
  console.log('Registering client...');
  const keyPair = generateKeyPair();
  const attrs = {
    publicKey: keyPair.publicKey,
    browser: 'chrome',
    externalName: null,
  };
  return xhr(`${API_URL}/api/clients`, { method: 'POST', body: JSON.stringify(attrs) })
    .then(client => storage.setClient({
      keyPair,
      name: client.name,
      createTime: client.createTime,
      browser: client.browser,
      externalName: client.externalName,
    }))
    .then(client => {
      console.log(`Registered as client ${client.name}`);
      return client;
    });
}

function submitSketch(client, command) {
  const startTime = moment(command.startTime).valueOf();
  const endTime = moment(command.startTime).valueOf();
  return history
    .aggregate(startTime, endTime, command.vocabulary)
    .then(rawValues => {
      const encryptedValues = command.collectEncrypted
        ? encryptCounters(command.publicKeys, command.round, client.keyPair, rawValues)
        : [];
      const sketch = { rawValues, encryptedValues };
      return xhr(
        `${API_URL}/api/sketches/${command.sketchName}`,
        { method: 'PATCH', body: JSON.stringify(sketch) }
      );
    });
}