(() => {
  const docs = window.UsuzumiComponentDocs;
  if (
    !docs ||
    !docs.componentNotes ||
    !docs.componentInterfaces ||
    !docs.interfaceLabels ||
    !docs.utils ||
    !docs.tutorial ||
    !docs.interfaceView ||
    !docs.demo
  ) {
    throw new Error('Usuzumi component docs scripts are missing. Load notes, interfaces, labels, utilities, tutorial, interface, and demo scripts before assets/components.js.');
  }

  docs.demo.enhanceComponentDocs();
})();