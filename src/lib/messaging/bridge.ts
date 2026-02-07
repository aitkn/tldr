import type { Message } from './types';

const chromeRuntime = (globalThis as unknown as { chrome: { runtime: typeof chrome.runtime } }).chrome.runtime;
const chromeTabs = (globalThis as unknown as { chrome: { tabs: typeof chrome.tabs } }).chrome.tabs;

export function sendMessage<T extends Message>(message: T): Promise<Message> {
  return new Promise((resolve, reject) => {
    chromeRuntime.sendMessage(message, (response: unknown) => {
      if (chromeRuntime.lastError) {
        reject(new Error(chromeRuntime.lastError.message));
      } else {
        resolve(response as Message);
      }
    });
  });
}

export function sendTabMessage<T extends Message>(tabId: number, message: T): Promise<Message> {
  return new Promise((resolve, reject) => {
    chromeTabs.sendMessage(tabId, message, (response: unknown) => {
      if (chromeRuntime.lastError) {
        reject(new Error(chromeRuntime.lastError.message));
      } else {
        resolve(response as Message);
      }
    });
  });
}
