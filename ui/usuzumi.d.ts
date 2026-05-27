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

  interface UsuzumiApi {
    init(root?: ParentNode): void;
    applyTheme(root: HTMLElement, mode: UsuzumiThemeMode, key?: string, persist?: boolean): void;
    applyLanguage(root: HTMLElement, language: UsuzumiLanguage, key?: string): void;
    setSwitchState(control: HTMLElement, checked: boolean, emit?: boolean): void;
    openDialog(dialog: HTMLElement, trigger?: HTMLElement | null): void;
    closeDialog(dialog: HTMLElement): void;
  }

  interface Window {
    Usuzumi: UsuzumiApi;
  }

  interface HTMLElementEventMap {
    "uzu-select-change": CustomEvent<UsuzumiSelectChangeDetail>;
    "uzu-switch-change": CustomEvent<UsuzumiSwitchChangeDetail>;
    "uzu-disclosure-change": CustomEvent<UsuzumiDisclosureChangeDetail>;
    "uzu-toast-close": CustomEvent<UsuzumiToastCloseDetail>;
    "uzu-dialog-open": CustomEvent<UsuzumiDialogDetail>;
    "uzu-dialog-close": CustomEvent<UsuzumiDialogDetail>;
  }
}
