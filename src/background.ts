import validator from "validator";
import { apiKey, config } from "./constants";

// Types
export type Message = {
  type: string;
  content: string;
};
export type Response = {
  ok: boolean;
  content: string;
};

// Listeners
chrome.runtime.onInstalled.addListener(() => {
  Object.entries(config).forEach(([key, value]) => {
    chrome.storage.sync.set({ [key]: value });
  });
});

chrome.runtime.onUpdateAvailable.addListener(() => {
  chrome.runtime.reload();
});

chrome.runtime.onMessage.addListener(
  (msg, _sender, sendResponse: (response: Response) => void) => {
    console.log("Received message", msg);

    let response: Response = { ok: false, content: "" };

    if (!isMessage(msg)) {
      console.error("Invalid message", msg);

      response.content = "Invalid message";
      console.log("Sent response", response);

      sendResponse(response);
      return true;
    }

    switch (msg.type) {
      case "fetch":
        handleFetchMessage(msg.content).then((res) => {
          console.log("Sent response", res);
          sendResponse(res);
        });
        return true;
      default:
        console.error("Invalid message type", msg.type);

        response.content = "Invalid message type";
        console.log("Sent response", response);

        sendResponse(response);
        return true;
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
