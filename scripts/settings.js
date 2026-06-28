export const MODULE_ID = "compact-chat";
export const COMPACT_TABS_SETTING = "compact-tabs";

// We don't want to get rid of these two.
// Chat is too core, and settings would lock the user out of changing it.
const LOCKED_TABS = new Set(["chat", "settings"]);

/**
 * Discover the sidebar tabs that may be toggled, excluding the locked ones.
 * @returns {Array<[string, object]>} Entries of [tabKey, tabConfig].
 */
export function getToggleableTabs() {
  const tabs = foundry.applications?.sidebar?.Sidebar?.TABS;
  return Object.entries(tabs).filter(([key]) => !LOCKED_TABS.has(key));
}

export function settingKey(tab) {
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
 * Register all module settings. The callbacks run whenever the related setting changes.
 * @param {object} handlers
 * @param {() => void} handlers.onCompactTabsChange  Fired when "compact tabs" is toggled.
 * @param {() => void} handlers.onShowTabChange      Fired when any per-tab toggle changes.
 */
export function registerSettings({ onCompactTabsChange, onShowTabChange }) {
  game.settings.register(MODULE_ID, COMPACT_TABS_SETTING, {
    name: game.i18n.localize("COMPACT_CHAT.CompactTabsName"),
    hint: game.i18n.localize("COMPACT_CHAT.CompactTabsHint"),
    scope: "user",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => onCompactTabsChange()
  });

  for (const [tab, config] of getToggleableTabs()) {
    game.settings.register(MODULE_ID, settingKey(tab), {
      name: game.i18n.format("COMPACT_CHAT.ShowTabName", { tab: tabLabel(tab, config) }),
      scope: "user",
      config: true,
      type: Boolean,
      default: true,
      onChange: () => onShowTabChange()
    });
  }
}

function insertDivider(formGroup, labelKey) {
  if (!formGroup || formGroup.previousElementSibling?.classList.contains("compact-chat-divider")) return;
  const divider = document.createElement("h3");
  divider.classList.add("divider", "compact-chat-divider");
  divider.textContent = game.i18n.localize(labelKey);
  formGroup.before(divider);
}

export function installSettingsUI() {
  Hooks.on("renderSettingsConfig", (app, element) => {
    const root = element instanceof HTMLElement ? element : element?.[0];
    const section = root?.querySelector(`[data-category="${MODULE_ID}"]`);
    if (!section) return;

    const styleGroup = section.querySelector(`[name="${MODULE_ID}.${COMPACT_TABS_SETTING}"]`)?.closest(".form-group");
    const firstTabToggle = section.querySelector(`[name^="${MODULE_ID}.show-"]`)?.closest(".form-group");

    insertDivider(styleGroup, "COMPACT_CHAT.StyleSectionHeader");
    insertDivider(firstTabToggle, "COMPACT_CHAT.TabSectionHeader");
  });
}
