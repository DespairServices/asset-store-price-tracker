import validator from "validator";
import { apiKey, config } from "./constants";

import browser = require("webextension-polyfill");

// Types
type Message = {
  type: string;
  content: string;
};
type Response = {
  ok: boolean;
  content: string;
};

// Listeners
browser.runtime.onInstalled.addListener(() => {
  Object.entries(config).forEach(([key, value]) => {
    browser.storage.sync.set({ [key]: value });
  });
});

browser.runtime.onUpdateAvailable.addListener(() => {
  browser.runtime.reload();
});

browser.runtime.onMessage.addListener(
  async (msg, _sender): Promise<Response> => {
    if (!isMessage(msg)) {
      console.error("Invalid message", msg);
      return { ok: false, content: "Invalid message" };
    }

    console.log("Received message", msg);

    switch (msg.type) {
      case "fetch":
        return await handleFetchMessage(msg.content);
      default:
        console.error("Invalid message type", msg.type);
        return { ok: false, content: "Invalid message type" };
    }
  },
);

// Functions
function isMessage(value: unknown): value is Message {
  return (
    value !== undefined &&
    value !== null &&
    typeof value === "object" &&
    "type" in value &&
    "content" in value &&
    typeof (value as Message).type === "string" &&
    typeof (value as Message).content === "string"
  );
}

async function handleFetchMessage(content: string): Promise<Response> {
  if (!validator.isURL(content)) {
    console.error("Invalid URL", content);
    return { ok: false, content: "Invalid URL" };
  }

  const response = await fetch(content, {
    headers: new Headers({ Authorization: `Bearer ${apiKey}` }),
  });

  return response.status === 200
    ? { ok: true, content: await response.text() }
    : { ok: false, content: response.statusText };
}

// Entry Point
console.log("Background script loaded.");
