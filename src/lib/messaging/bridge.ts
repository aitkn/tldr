import type { Message } from './types';

const chromeRuntime = (globalThis as unknown as { chrome: { runtime: typeof chrome.runtime } }).chrome.runtime;
const chromeTabs = (globalThis as unknown as { chrome: { tabs: typeof chrome.tabs } }).chrome.tabs;

const MESSAGE_TIMEOUT_MS = 120_000; // 2 minutes

export function sendMessage<T extends Message>(message: T): Promise<Message> {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error(`Message "${message.type}" timed out after ${MESSAGE_TIMEOUT_MS / 1000}s`));
      }
    }, MESSAGE_TIMEOUT_MS);

    chromeRuntime.sendMessage(message, (response: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
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
