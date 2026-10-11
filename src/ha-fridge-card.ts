import { LitElement, html, nothing, unsafeCSS } from "lit";
import styles from "./ha-fridge-card.css";

type Layout = "default" | "freezer" | "inverted" | "dual_door" | "side_by_side";

interface Zone {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CardConfig {
  type: string;
  title?: string;
  layout?: Layout;
  freezer_entity?: string;
  fridge_entity?: string;
}

interface DisplayState {
  stateText: string;
  unitText: string;
  isPlaceholder: boolean;
}

const CARD_TYPE = "ha-fridge-card";
const INVALID_STATES = new Set(["unknown", "unavailable", "none"]);
const VIEWBOX_WIDTH = 192;
const VIEWBOX_HEIGHT = 387;
const LAYOUTS: Layout[] = ["default", "freezer", "inverted", "dual_door", "side_by_side"];
const LAYOUT_ZONES: Record<Layout, { freezer: Zone; fridge?: Zone }> = {
  default: {
    freezer: { x: 10, y: 8, width: 172, height: 108 },
    fridge: { x: 10, y: 124, width: 172, height: 253 }
  },
  freezer: {
    freezer: { x: 10, y: 8, width: 172, height: 371 }
  },
  inverted: {
    freezer: { x: 10, y: 269, width: 172, height: 108 },
    fridge: { x: 10, y: 8, width: 172, height: 253 }
  },
  dual_door: {
    freezer: { x: 10, y: 269, width: 172, height: 108 },
    fridge: { x: 10, y: 8, width: 172, height: 253 }
  },
  side_by_side: {
    freezer: { x: 10, y: 56, width: 84, height: 88 },
    fridge: { x: 98, y: 56, width: 84, height: 88 }
  }
};
const FRIDGE_SVGS = {
  default: html`
  <svg class="fridge-svg" viewBox="0 0 192 387" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="4" y="4" width="184" height="379" rx="14" fill="#E8ECF0" stroke="#C4CDD6" stroke-width="1.5" />

    <rect x="10" y="8" width="172" height="108" rx="10" fill="#F4F6F8" />
    <rect x="10" y="8" width="172" height="108" rx="10" stroke="#D1D8E0" stroke-width="1" />
    <rect x="26" y="38" width="6" height="48" rx="3" fill="#B8C2CC" />

    <line x1="10" y1="120" x2="182" y2="120" stroke="#BCC5CF" stroke-width="1.5" />

    <rect x="10" y="124" width="172" height="253" rx="10" fill="#F7F9FB" />
    <rect x="10" y="124" width="172" height="253" rx="10" stroke="#D1D8E0" stroke-width="1" />
    <rect x="26" y="194" width="6" height="60" rx="3" fill="#B8C2CC" />
  </svg>
`,
  freezer: html`
    <svg class="fridge-svg" viewBox="0 0 192 387" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="184" height="379" rx="14" fill="#E8ECF0" stroke="#C4CDD6" stroke-width="1.5" />
      <rect x="10" y="8" width="172" height="371" rx="10" fill="#edf1f5" />
      <rect x="10" y="8" width="172" height="371" rx="10" stroke="#D1D8E0" stroke-width="1" />
      <rect x="26" y="140" width="6" height="70" rx="3" fill="#B8C2CC" />
    </svg>
  `,
  inverted: html`
    <svg class="fridge-svg" viewBox="0 0 192 387" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="184" height="379" rx="14" fill="#E8ECF0" stroke="#C4CDD6" stroke-width="1.5" />
      <rect x="10" y="8" width="172" height="253" rx="10" fill="#F7F9FB" />
      <rect x="10" y="8" width="172" height="253" rx="10" stroke="#D1D8E0" stroke-width="1" />
      <rect x="26" y="80" width="6" height="60" rx="3" fill="#B8C2CC" />
      <line x1="10" y1="265" x2="182" y2="265" stroke="#BCC5CF" stroke-width="1.5" />
      <rect x="10" y="269" width="172" height="108" rx="10" fill="#F4F6F8" />
      <rect x="10" y="269" width="172" height="108" rx="10" stroke="#D1D8E0" stroke-width="1" />
      <rect x="26" y="299" width="6" height="48" rx="3" fill="#B8C2CC" />
    </svg>
  `,
  dual_door: html`
    <svg class="fridge-svg" viewBox="0 0 192 387" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="184" height="379" rx="14" fill="#E8ECF0" stroke="#C4CDD6" stroke-width="1.5" />
      <rect x="10" y="8" width="84" height="253" rx="10" fill="#F7F9FB" />
      <rect x="10" y="8" width="84" height="253" rx="10" stroke="#D1D8E0" stroke-width="1" />
      <rect x="82" y="80" width="6" height="60" rx="3" fill="#B8C2CC" />
      <rect x="98" y="8" width="84" height="253" rx="10" fill="#F7F9FB" />
      <rect x="98" y="8" width="84" height="253" rx="10" stroke="#D1D8E0" stroke-width="1" />
      <rect x="104" y="80" width="6" height="60" rx="3" fill="#B8C2CC" />
      <line x1="10" y1="265" x2="182" y2="265" stroke="#BCC5CF" stroke-width="1.5" />
      <rect x="10" y="269" width="172" height="108" rx="10" fill="#F4F6F8" />
      <rect x="10" y="269" width="172" height="108" rx="10" stroke="#D1D8E0" stroke-width="1" />
      <rect x="26" y="299" width="6" height="48" rx="3" fill="#B8C2CC" />
    </svg>
  `,
  side_by_side: html`
    <svg class="fridge-svg" viewBox="0 0 192 387" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="4" y="4" width="184" height="379" rx="14" fill="#E8ECF0" stroke="#C4CDD6" stroke-width="1.5" />
      <rect x="10" y="8" width="84" height="371" rx="10" fill="#F4F6F8" />
      <rect x="10" y="8" width="84" height="371" rx="10" stroke="#D1D8E0" stroke-width="1" />
      <rect x="82" y="140" width="6" height="70" rx="3" fill="#B8C2CC" />
      <line x1="96" y1="8" x2="96" y2="379" stroke="#BCC5CF" stroke-width="1.5" />
      <rect x="98" y="8" width="84" height="371" rx="10" fill="#F7F9FB" />
      <rect x="98" y="8" width="84" height="371" rx="10" stroke="#D1D8E0" stroke-width="1" />
      <rect x="104" y="140" width="6" height="70" rx="3" fill="#B8C2CC" />
    </svg>
  `
};
class HaFridgeCard extends LitElement {
  static properties = {
    hass: { attribute: false }
  };
  static styles = unsafeCSS(styles);

  hass?: any;
  private _config?: CardConfig;

  static getConfigForm() {
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        {
          name: "layout",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "default", label: "Freezer on top" },
                { value: "inverted", label: "Fridge on top" },
                { value: "dual_door", label: "French door" },
                { value: "side_by_side", label: "Side by side" },
                { value: "freezer", label: "Freezer only" }
              ]
            }
          }
        },
        {
          name: "freezer_entity",
          selector: {
            entity: {
              domain: "sensor"
            }
          }
        },
        {
          name: "fridge_entity",
          selector: {
            entity: {
              domain: "sensor"
            }
          }
        }
      ],
      computeLabel: (schema: { name: string }) => {
        switch (schema.name) {
          case "title":
            return "Title";
          case "layout":
            return "Layout";
          case "freezer_entity":
            return "Freezer sensor";
          case "fridge_entity":
            return "Fridge sensor";
          default:
            return undefined;
        }
      }
    };
  }
  static getStubConfig(): CardConfig {
    return {
      type: `custom:${CARD_TYPE}`,
      freezer_entity: "sensor.freezer_temperature",
      fridge_entity: "sensor.fridge_temperature",
      title: "Fridge",
      layout: "default"
    };
  }
  setConfig(config: CardConfig) {
    const layout = this.normalizeLayout(config.layout);
    this._config = {
      title: "Fridge",
      ...config,
      layout
    };
  }
  getCardSize() {
    return 4;
  }
  getGridOptions() {
    return {
      columns: 6,
      min_columns: 4
    };
  }
  render() {
    if (!this._config) {
      return nothing;
    }
    const layout = this.normalizeLayout(this._config.layout);
    const zones = LAYOUT_ZONES[layout];
    // With a single entity configured, hide the other zone; with none, show both as placeholders.
    const showFridge = Boolean(zones.fridge) && Boolean(this._config.fridge_entity || !this._config.freezer_entity);
    const showFreezer = Boolean(this._config.freezer_entity || !this._config.fridge_entity) || !showFridge;
    const freezer = this.getDisplayState(this._config.freezer_entity);
    const fridge = showFridge ? this.getDisplayState(this._config.fridge_entity) : null;
    const cardLabel = this.cardLabel(showFreezer, showFridge);
    return html`
      <ha-card>
        <div class="card-shell">
          <div class="heading">
            <h3 class="title">${this._config.title}</h3>
          </div>

          <div class="body">
            <div class="fridge layout-${layout}" role="img" aria-label=${cardLabel}>
              <div class="fridge-photo-frame">
                ${FRIDGE_SVGS[layout]}

                <div class="readings">
                  ${showFreezer ? html`
                        <section
                          class=${this.readingClass(Boolean(this._config.freezer_entity), "zone-freezer")}
                          style=${this.readingStyle(zones.freezer)}
                          role=${this._config.freezer_entity ? "button" : "presentation"}
                          tabindex=${this._config.freezer_entity ? "0" : "-1"}
                          @click=${() => this.showMoreInfo(this._config?.freezer_entity)}
                          @keydown=${(event: KeyboardEvent) => this.handleReadingKeydown(event, this._config?.freezer_entity)}
                        >
                          <p class="section-label">Freezer</p>
                          <div class=${this.temperatureClass(freezer)}>
                            <span>${freezer.stateText}</span>
                            ${freezer.unitText ? html`<span class="unit">${freezer.unitText}</span>` : nothing}
                          </div>
                        </section>
                      ` : nothing}

                  ${showFridge ? html`
                        <section
                          class=${this.readingClass(Boolean(this._config.fridge_entity), "zone-fridge")}
                          style=${this.readingStyle(zones.fridge)}
                          role=${this._config.fridge_entity ? "button" : "presentation"}
                          tabindex=${this._config.fridge_entity ? "0" : "-1"}
                          @click=${() => this.showMoreInfo(this._config?.fridge_entity)}
                          @keydown=${(event: KeyboardEvent) => this.handleReadingKeydown(event, this._config?.fridge_entity)}
                        >
                          <p class="section-label">Fridge</p>
                          <div class=${this.temperatureClass(fridge!)}>
                            <span>${fridge!.stateText}</span>
                            ${fridge!.unitText ? html`<span class="unit">${fridge!.unitText}</span>` : nothing}
                          </div>
                        </section>
                      ` : nothing}
                </div>
              </div>

              <div class="feet" aria-hidden="true">
                <span class="foot"></span>
                <span class="foot"></span>
              </div>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }
  temperatureClass(displayState: DisplayState) {
    return displayState.isPlaceholder ? "temperature placeholder" : "temperature";
  }
  readingClass(clickable: boolean, zoneClass: string) {
    return clickable ? `reading ${zoneClass} clickable` : `reading ${zoneClass}`;
  }
  cardLabel(showFreezer: boolean, showFridge: boolean) {
    if (showFreezer && showFridge) {
      return "Fridge and freezer temperatures";
    }
    if (showFreezer) {
      return "Freezer temperature";
    }
    return "Fridge temperature";
  }
  normalizeLayout(layout?: string): Layout {
    if (layout && (LAYOUTS as string[]).includes(layout)) {
      return layout as Layout;
    }
    return "default";
  }
  readingStyle(zone?: Zone) {
    if (!zone) {
      return "";
    }
    const left = (zone.x + zone.width / 2) / VIEWBOX_WIDTH * 100;
    const top = (zone.y + zone.height / 2) / VIEWBOX_HEIGHT * 100;
    return `left:${left}%;top:${top}%;`;
  }
  handleReadingKeydown(event: KeyboardEvent, entityId?: string) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    this.showMoreInfo(entityId);
  }
  showMoreInfo(entityId?: string) {
    if (!entityId) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true
      })
    );
  }
  getDisplayState(entityId?: string): DisplayState {
    if (!entityId) {
      return {
        stateText: "--",
        unitText: "\xB0C",
        isPlaceholder: true
      };
    }
    const entity = this.hass?.states?.[entityId];
    if (!entity) {
      return {
        stateText: "--",
        unitText: "",
        isPlaceholder: true
      };
    }
    const rawState = entity.state?.trim();
    if (!rawState || INVALID_STATES.has(rawState.toLowerCase())) {
      return {
        stateText: "--",
        unitText: "",
        isPlaceholder: true
      };
    }
    const numeric = Number.parseFloat(rawState);
    const unit = this.getUnit(entity);
    if (!Number.isNaN(numeric)) {
      return {
        stateText: new Intl.NumberFormat(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(numeric),
        unitText: unit,
        isPlaceholder: false
      };
    }
    return {
      stateText: rawState,
      unitText: unit,
      isPlaceholder: false
    };
  }
  getUnit(entity: any): string {
    const unit = entity.attributes.unit_of_measurement;
    return typeof unit === "string" && unit.trim() ? unit : "\xB0C";
  }
}
if (!customElements.get(CARD_TYPE)) {
  customElements.define(CARD_TYPE, HaFridgeCard);
}
const customCards: any[] = ((window as any).customCards ??= []);
if (!customCards.some((card) => card.type === CARD_TYPE)) {
  customCards.push({
    type: CARD_TYPE,
    name: "HA Fridge Card",
    description: "Fridge and freezer temperatures with multiple fridge layout options.",
    preview: true
  });
}
