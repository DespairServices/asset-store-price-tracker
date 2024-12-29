import {
  colorGray,
  colorGreen,
  colorRed,
  colorWhite,
  colorYellow,
  handler,
} from "./constants";

// Event Listeners
$("#enable").on("click", function () {
  const newValue = !JSON.parse($(this).val() + "");
  setStorageValue("enable", newValue, updateValue, updateColor);
});
$("#mode").on("click", function () {
  const newValue = $(this).val() === "dark" ? "light" : "dark";
  setStorageValue("mode", newValue, updateValue, updateMode);
});
$("#priceColor").on("change", function () {
  setStorageValue("priceColor", $(this).val(), updateValue);
});
$("#gapColor").on("change", function () {
  setStorageValue("gapColor", $(this).val(), updateValue);
});
$("#minimumColor").on("change", function () {
  setStorageValue("minimumColor", $(this).val(), updateValue);
});
$("#intermediateColor").on("change", function () {
  setStorageValue("intermediateColor", $(this).val(), updateValue);
});
$("#maximumColor").on("change", function () {
  setStorageValue("maximumColor", $(this).val(), updateValue);
});
$("#reset").on("click", function () {
  setStorageValue("enable", true, updateValue, updateColor);
  setStorageValue("mode", "dark", updateValue, updateMode);
  setStorageValue("priceColor", colorWhite, updateValue);
  setStorageValue("gapColor", colorGray, updateValue);
  setStorageValue("minimumColor", colorGreen, updateValue);
  setStorageValue("intermediateColor", colorYellow, updateValue);
  setStorageValue("maximumColor", colorRed, updateValue);
});
$("#website").on("click", function () {
  handler.tabs.create({
    url: "https://www.despair.services",
  });
});

// Functions
function updateValue(key: any, value: any) {
  $("#" + key).val(value);
}

function updateColor(key: any, value: any) {
  let color = value ? colorGreen : colorRed;
  $("#" + key + " svg").attr("fill", color);
}

function updateMode(_key: any, value: any) {
  $("html").attr("data-bs-theme", value);
  const isDark = value === "dark";
  $("#light").toggle(!isDark);
  $("#dark").toggle(isDark);
}

function validateValue(key: any, value: any, result: any): boolean {
  return typeof result[key] === typeof value;
}

function validateColor(key: any, value: any, result: any): boolean {
  return validateValue(key, value, result) && CSS.supports("color", value);
}

function validateMode(key: any, value: any, result: any): boolean {
  return (
    validateValue(key, value, result) && (value === "dark" || value === "light")
  );
}

function getStorageValue(key: any, callback: (result: any) => void) {
  handler.storage.sync.get([key]).then((result) => callback(result));
}

function setStorageValue(
  key: any,
  value: any,
  ...callbacks: ((key: any, value: any) => void)[]
) {
  handler.storage.sync.set({ [key]: value });
  callbacks.forEach(function (callback) {
    callback(key, value);
  });
}

function initStorageValue(
  key: any,
  value: any,
  validate: (key: any, value: any, result: any) => boolean,
  ...callbacks: ((key: any, value: any) => void)[]
) {
  getStorageValue(key, (result) => {
    const storedValue = validate(key, value, result) ? result[key] : value;
    setStorageValue(key, storedValue, ...callbacks);
  });
}

function init() {
  initStorageValue("enable", true, validateValue, updateValue, updateColor);
  initStorageValue("mode", "dark", validateMode, updateValue, updateMode);
  initStorageValue("priceColor", colorWhite, validateColor, updateValue);
  initStorageValue("gapColor", colorGray, validateColor, updateValue);
  initStorageValue("minimumColor", colorGreen, validateColor, updateValue);
  initStorageValue(
    "intermediateColor",
    colorYellow,
    validateColor,
    updateValue
  );
  initStorageValue("maximumColor", colorRed, validateColor, updateValue);
}

// Entry Point
const entryPoint = () => {
  init();
};
entryPoint();
