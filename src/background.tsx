import { apiKey } from "./constants";

// Constants
const sanitizeUrl = require("@braintree/sanitize-url").sanitizeUrl;

// Listeners
chrome.runtime.onUpdateAvailable.addListener(() => {
  chrome.runtime.reload();
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse: (response: { ok: boolean, content: string }) => void) => {
  if (request.type === "fetch") {
    handleFetchMessage(request.content).then(sendResponse);
  }
  return true;
});

// Functions
const handleFetchMessage = async (content: any): Promise<{ ok: boolean, content: string }> => {
  const sanitizedContent = sanitizeUrl(content);
  const response = await fetch(sanitizedContent, { headers: new Headers({ 'Authorization': `Bearer ${apiKey}` }) });
  return response.status === 200 ? { ok: true, content: await response.text() } : { ok: false, content: "Error 2000" };
};
