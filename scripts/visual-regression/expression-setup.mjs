export const visualExpressionSetup = `
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const rect = (selector) => {
  const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!element) return null;
  const value = element.getBoundingClientRect();
  return { top: value.top, right: value.right, bottom: value.bottom, left: value.left, width: value.width, height: value.height };
};
const click = (element) => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
const showComponent = async (target) => {
  const control = document.querySelector('[data-uzu-panel-target="' + target + '"]');
  if (!control) throw new Error('Missing component control: ' + target);
  click(control);
  await wait(160);
  const panel = document.querySelector(target);
  if (!panel || panel.hidden) throw new Error('Component panel did not open: ' + target);
  return panel;
};
`;
