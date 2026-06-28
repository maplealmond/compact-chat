const MODULE_ID = "compact-chat";

const STYLE_ELEMENT_ID = "compact-chat-hidden-tabs";

// We don't want to get rid of these two.  
// Chat is too core, and settings would lock the user out of changing it.
const LOCKED_TABS = new Set(["chat", "settings"]);

/**
 * Discover the sidebar tabs that may be toggled, excluding the locked ones.
 * @returns {Array<[string, object]>} Entries of [tabKey, tabConfig].
 */
function getToggleableTabs() {
  const tabs = foundry.applications?.sidebar?.Sidebar?.TABS
  return Object.entries(tabs).filter(([key]) => !LOCKED_TABS.has(key));
}

function settingKey(tab) {
  return `show-${tab}`;
}

function tabLabel(tab, config) {
  if (config?.tooltip) return game.i18n.localize(config.tooltip);
  if (config?.documentName) {
    const cls = getDocumentClass(config.documentName);
    if (cls?.metadata?.labelPlural) return game.i18n.localize(cls.metadata.labelPlural);
  }
  return tab;
}

/**
 * Rewrite the managed <style> element to hide tabs with setting off.
 */
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

Hooks.once("setup", () => {
  for (const [tab, config] of getToggleableTabs()) {
    const label = tabLabel(tab, config);
    game.settings.register(MODULE_ID, settingKey(tab), {
      name: game.i18n.format("COMPACT_CHAT.ShowTabName", { tab: label }),
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: () => updateHiddenTabs()
    });
  }
});

Hooks.once("ready", () => updateHiddenTabs());
Hooks.on("renderSidebar", () => updateHiddenTabs());
