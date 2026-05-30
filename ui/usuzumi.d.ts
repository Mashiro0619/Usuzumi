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

  interface UsuzumiPasswordToggleDetail {
    visible: boolean;
    password: HTMLElement;
    input: HTMLInputElement;
    toggle: HTMLElement;
  }

  interface UsuzumiStepperChangeDetail {
    value: string;
    number: number;
    stepper: HTMLElement;
    input: HTMLInputElement;
  }

  interface UsuzumiMenuDetail {
    menu: HTMLElement;
    trigger: HTMLElement | null;
    content: HTMLElement | null;
  }

  interface UsuzumiMenuSelectDetail extends UsuzumiMenuDetail {
    item: HTMLElement;
    value: string;
  }

  interface UsuzumiMenubarChangeDetail {
    value: string;
    item: HTMLElement;
    menubar: HTMLElement;
    index: number;
  }

  interface UsuzumiCommandFilterDetail {
    value: string;
    command: HTMLElement;
    visibleCount: number;
  }

  interface UsuzumiCommandSelectDetail {
    value: string;
    item: HTMLElement;
    command: HTMLElement;
  }

  interface UsuzumiComboboxDetail {
    combobox: HTMLElement;
    input: HTMLInputElement;
    list: HTMLElement;
  }

  interface UsuzumiComboboxFilterDetail {
    value: string;
    combobox: HTMLElement;
    visibleCount: number;
  }

  interface UsuzumiComboboxChangeDetail {
    value: string;
    label: string;
    option: HTMLElement;
    combobox: HTMLElement;
    input: HTMLInputElement;
  }

  interface UsuzumiDataGridSortDetail {
    grid: HTMLElement;
    table: HTMLTableElement;
    header: HTMLElement;
    columnIndex: number;
    direction: "ascending" | "descending";
  }

  interface UsuzumiDataGridSelectDetail {
    grid: HTMLElement;
    table: HTMLTableElement;
    row: HTMLTableRowElement;
    selected: boolean;
    value: string;
  }

  interface UsuzumiTreeToggleDetail {
    tree: HTMLElement;
    item: HTMLElement;
    expanded: boolean;
    value: string;
  }

  interface UsuzumiTreeSelectDetail {
    tree: HTMLElement;
    item: HTMLElement;
    value: string;
  }

  interface UsuzumiSplitResizeDetail {
    splitPane: HTMLElement;
    size: number;
  }

  interface UsuzumiResizableResizeDetail {
    resizable: HTMLElement;
    width: number;
    height: number;
  }

  interface UsuzumiDisclosureChangeDetail {
    open: boolean;
    disclosure: HTMLElement;
  }

  interface UsuzumiAccordionChangeDetail {
    accordion: HTMLElement;
    disclosure: HTMLElement;
    open: boolean;
  }

  interface UsuzumiHoverCardDetail {
    hoverCard: HTMLElement;
    trigger: HTMLElement | null;
    content: HTMLElement | null;
  }

  interface UsuzumiTagChangeDetail {
    selected: boolean;
    tag: HTMLElement;
    value: string;
  }

  interface UsuzumiTagCloseDetail {
    tag: HTMLElement;
    closeButton: HTMLElement | null;
    value: string;
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

  interface UsuzumiStepNavChangeDetail {
    value: string;
    step: HTMLElement;
    stepNav: HTMLElement;
    index: number;
  }

  interface UsuzumiEditorCommandDetail {
    editor: HTMLElement;
    surface: HTMLElement;
    command: string;
  }

  interface UsuzumiEditorChangeDetail {
    editor: HTMLElement;
    surface: HTMLElement;
    value: string;
  }

  interface UsuzumiMarkdownEditorRenderDetail {
    editor: HTMLElement;
    source: HTMLTextAreaElement | HTMLElement;
    preview: HTMLElement;
  }

  interface UsuzumiInlineEditorChangeDetail {
    editor: HTMLElement;
    value: string;
  }

  interface UsuzumiApi {
    init(root?: ParentNode): void;
    applyTheme(root: HTMLElement, mode: UsuzumiThemeMode, key?: string, persist?: boolean): void;
    applyLanguage(root: HTMLElement, language: UsuzumiLanguage, key?: string): void;
    setSwitchState(control: HTMLElement, checked: boolean, emit?: boolean): void;
    setPasswordVisible(password: HTMLElement, visible: boolean, emit?: boolean): void;
    setStepperValue(stepper: HTMLElement, value: number, emit?: boolean): void;
    setComboboxValue(combobox: HTMLElement, optionOrValue: HTMLElement | string, emit?: boolean): void;
    setTagSelected(tag: HTMLElement, selected: boolean, emit?: boolean): void;
    setSplitPaneSize(splitPane: HTMLElement, size: number, emit?: boolean): void;
    setResizableSize(resizable: HTMLElement, width: number, height: number, emit?: boolean): void;
    setTreeItemExpanded(item: HTMLElement, expanded: boolean, emit?: boolean): void;
    openMenu(menu: HTMLElement, options?: { trigger?: HTMLElement | null; focus?: boolean; x?: number; y?: number }): void;
    closeMenu(menu: HTMLElement, options?: { trigger?: HTMLElement | null; restoreFocus?: boolean }): void;
    setPaginationPage(pagination: HTMLElement, page: HTMLElement | string, emit?: boolean): void;
    setStepNavStep(stepNav: HTMLElement, step: HTMLElement, emit?: boolean): void;
    renderJson(value: unknown): DocumentFragment;
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
    "uzu-password-toggle": CustomEvent<UsuzumiPasswordToggleDetail>;
    "uzu-stepper-change": CustomEvent<UsuzumiStepperChangeDetail>;
    "uzu-menu-open": CustomEvent<UsuzumiMenuDetail>;
    "uzu-menu-close": CustomEvent<UsuzumiMenuDetail>;
    "uzu-menu-select": CustomEvent<UsuzumiMenuSelectDetail>;
    "uzu-menubar-change": CustomEvent<UsuzumiMenubarChangeDetail>;
    "uzu-command-filter": CustomEvent<UsuzumiCommandFilterDetail>;
    "uzu-command-select": CustomEvent<UsuzumiCommandSelectDetail>;
    "uzu-combobox-open": CustomEvent<UsuzumiComboboxDetail>;
    "uzu-combobox-close": CustomEvent<UsuzumiComboboxDetail>;
    "uzu-combobox-filter": CustomEvent<UsuzumiComboboxFilterDetail>;
    "uzu-combobox-change": CustomEvent<UsuzumiComboboxChangeDetail>;
    "uzu-data-grid-sort": CustomEvent<UsuzumiDataGridSortDetail>;
    "uzu-data-grid-select": CustomEvent<UsuzumiDataGridSelectDetail>;
    "uzu-tree-toggle": CustomEvent<UsuzumiTreeToggleDetail>;
    "uzu-tree-select": CustomEvent<UsuzumiTreeSelectDetail>;
    "uzu-split-resize": CustomEvent<UsuzumiSplitResizeDetail>;
    "uzu-resizable-resize": CustomEvent<UsuzumiResizableResizeDetail>;
    "uzu-disclosure-change": CustomEvent<UsuzumiDisclosureChangeDetail>;
    "uzu-accordion-change": CustomEvent<UsuzumiAccordionChangeDetail>;
    "uzu-hover-card-open": CustomEvent<UsuzumiHoverCardDetail>;
    "uzu-hover-card-close": CustomEvent<UsuzumiHoverCardDetail>;
    "uzu-tag-change": CustomEvent<UsuzumiTagChangeDetail>;
    "uzu-tag-close": CustomEvent<UsuzumiTagCloseDetail>;
    "uzu-toast-close": CustomEvent<UsuzumiToastCloseDetail>;
    "uzu-dialog-open": CustomEvent<UsuzumiDialogDetail>;
    "uzu-dialog-close": CustomEvent<UsuzumiDialogDetail>;
    "uzu-step-nav-change": CustomEvent<UsuzumiStepNavChangeDetail>;
    "uzu-editor-command": CustomEvent<UsuzumiEditorCommandDetail>;
    "uzu-editor-change": CustomEvent<UsuzumiEditorChangeDetail>;
    "uzu-markdown-editor-render": CustomEvent<UsuzumiMarkdownEditorRenderDetail>;
    "uzu-inline-editor-change": CustomEvent<UsuzumiInlineEditorChangeDetail>;
    "uzu-panel-nav-change": CustomEvent<UsuzumiPanelNavDetail>;
    "uzu-panel-show": CustomEvent<UsuzumiPanelNavDetail>;
  }
}
