import { apiKey, config, handler, sanitizeUrl } from "./constants";

// Listeners
handler.runtime.onInstalled.addListener(() => {
  Object.entries(config).forEach(([key, value]) => {
    chrome.storage.sync.set({ [key]: value });
  });
});

handler.runtime.onUpdateAvailable.addListener(() => {
  handler.runtime.reload();
});

handler.runtime.onMessage.addListener((request, _sender, sendResponse: (response: { ok: boolean, content: string }) => void) => {
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
