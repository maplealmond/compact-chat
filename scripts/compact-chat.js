import {
  MODULE_ID,
  COMPACT_TABS_SETTING,
  getToggleableTabs,
  settingKey,
  registerSettings,
  installSettingsUI
} from "./settings.js";

const STYLE_ELEMENT_ID = "compact-chat-hidden-tabs";
const COMPACT_TABS_CLASS = "compact-chat-compact-tabs";

// Rewrites the managed <style> element to hide tabs whose setting is off.
function updateHiddenTabs() {
  const hidden = getToggleableTabs()
    .map(([tab]) => tab)
    .filter(tab => game.settings.get(MODULE_ID, settingKey(tab)) === false);

  let style = document.getElementById(STYLE_ELEMENT_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ELEMENT_ID;
    document.head.appendChild(style);
  }

  if (hidden.length) {
    const selector = hidden.map(tab => `#sidebar-tabs li:has(> [data-tab="${tab}"])`).join(", ");
    style.textContent = `${selector} { display: none !important; }`;
  } else {
    style.textContent = "";
  }
}

// Toggles the compact-tab body class to match the setting.
function applyCompactTabs() {
  const enabled = game.settings.get(MODULE_ID, COMPACT_TABS_SETTING) !== false;
  document.body.classList.toggle(COMPACT_TABS_CLASS, enabled);
}

installSettingsUI();

Hooks.once("setup", () => {
  registerSettings({
    onCompactTabsChange: applyCompactTabs,
    onShowTabChange: updateHiddenTabs
  });

  applyCompactTabs();
});

Hooks.once("ready", () => {
  applyCompactTabs();
  updateHiddenTabs();
});
Hooks.on("renderSidebar", () => updateHiddenTabs());
