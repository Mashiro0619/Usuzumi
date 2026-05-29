export {};

declare global {
  type UsuzumiThemeMode = "auto" | "light" | "dark";
  type UsuzumiLanguage = "zh" | "en";

  interface UsuzumiSelectChangeDetail {
    value: string;
    label: string;
    option: HTMLElement;
    select: HTMLElement;
  }

  interface UsuzumiTabsChangeDetail {
    value: string;
    tab: HTMLElement;
    tabs: HTMLElement;
    index: number;
    panel: HTMLElement | null;
  }

  interface UsuzumiSegmentedChangeDetail {
    value: string;
    segment: HTMLElement;
    segmented: HTMLElement;
    index: number;
  }

  interface UsuzumiPaginationChangeDetail {
    value: string;
    page: HTMLElement;
    pagination: HTMLElement;
    index: number;
    panel: HTMLElement | null;
  }

  interface UsuzumiSwitchChangeDetail {
    checked: boolean;
    switch: HTMLElement;
  }

  interface UsuzumiDisclosureChangeDetail {
    open: boolean;
    disclosure: HTMLElement;
  }

  interface UsuzumiToastCloseDetail {
    toast: HTMLElement;
  }

  interface UsuzumiDialogDetail {
    dialog: HTMLElement;
    overlay: HTMLElement | null;
    trigger: HTMLElement | null;
  }

  interface UsuzumiPanelNavDetail {
    target: string;
    control: HTMLElement;
    panel: HTMLElement;
    nav: HTMLElement;
  }

  interface UsuzumiApi {
    init(root?: ParentNode): void;
    applyTheme(root: HTMLElement, mode: UsuzumiThemeMode, key?: string, persist?: boolean): void;
    applyLanguage(root: HTMLElement, language: UsuzumiLanguage, key?: string): void;
    setSwitchState(control: HTMLElement, checked: boolean, emit?: boolean): void;
    setPaginationPage(pagination: HTMLElement, page: HTMLElement | string, emit?: boolean): void;
    renderMarkdown(markdown: string): DocumentFragment;
    initCodeCopy(root?: ParentNode): void;
    openDialog(dialog: HTMLElement, trigger?: HTMLElement | null): void;
    closeDialog(dialog: HTMLElement): void;
  }

  interface Window {
    Usuzumi: UsuzumiApi;
  }

  interface HTMLElementEventMap {
    "uzu-select-change": CustomEvent<UsuzumiSelectChangeDetail>;
    "uzu-tabs-change": CustomEvent<UsuzumiTabsChangeDetail>;
    "uzu-segmented-change": CustomEvent<UsuzumiSegmentedChangeDetail>;
    "uzu-pagination-change": CustomEvent<UsuzumiPaginationChangeDetail>;
    "uzu-switch-change": CustomEvent<UsuzumiSwitchChangeDetail>;
    "uzu-disclosure-change": CustomEvent<UsuzumiDisclosureChangeDetail>;
    "uzu-toast-close": CustomEvent<UsuzumiToastCloseDetail>;
    "uzu-dialog-open": CustomEvent<UsuzumiDialogDetail>;
    "uzu-dialog-close": CustomEvent<UsuzumiDialogDetail>;
    "uzu-panel-nav-change": CustomEvent<UsuzumiPanelNavDetail>;
    "uzu-panel-show": CustomEvent<UsuzumiPanelNavDetail>;
  }
}
