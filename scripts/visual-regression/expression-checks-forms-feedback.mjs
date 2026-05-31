export const visualExpressionFormsFeedbackChecks = `const searchPanelRoot = await showComponent('#component-search');
const searchInput = searchPanelRoot.querySelector('.uzu-search-input');
const searchClear = searchPanelRoot.querySelector('[data-uzu-search-clear]');
click(searchClear);
await wait(80);
const searchValueAfterClear = searchInput.value;
const searchClearHiddenAfterClear = searchClear.hidden;
const passwordPanelRoot = await showComponent('#component-password');
const passwordInput = passwordPanelRoot.querySelector('.uzu-password-input');
const passwordToggle = passwordPanelRoot.querySelector('[data-uzu-password-toggle]');
click(passwordToggle);
await wait(80);
const passwordTypeAfterToggle = passwordInput.type;
const passwordPressedAfterToggle = passwordToggle.getAttribute('aria-pressed');
const stepperPanelRoot = await showComponent('#component-stepper');
const stepperInput = stepperPanelRoot.querySelector('.uzu-stepper-input');
click(stepperPanelRoot.querySelector('[data-uzu-stepper-increment]'));
await wait(80);
const stepperValueAfterIncrement = stepperInput.value;
const stepperInputAppearance = getComputedStyle(stepperInput).appearance || getComputedStyle(stepperInput).webkitAppearance || '';

const sliderPanelRoot = await showComponent('#component-slider');
const slider = sliderPanelRoot.querySelector('.uzu-slider');
const sliderInitialValue = slider.style.getPropertyValue('--uzu-slider-value').trim();
slider.value = '20';
slider.dispatchEvent(new Event('input', { bubbles: true }));
await wait(80);
const sliderValueAfterInput = slider.style.getPropertyValue('--uzu-slider-value').trim();

const skeletonPanelRoot = await showComponent('#component-skeleton');
const skeleton = skeletonPanelRoot.querySelector('.uzu-skeleton');
window.Usuzumi.applyTheme(document.documentElement, 'dark', '', false);
await wait(80);
const skeletonDarkStyle = getComputedStyle(skeleton);
const skeletonDarkPanelStyle = getComputedStyle(skeleton.closest('.uzu-doc-example'));
const colorDelta = (a, b) => {
  const parts = (value) => {
    const text = String(value);
    const rgb = text.match(/rgba?\\(([^)]+)\\)/)?.[1];
    if (rgb) {
      return rgb.split(',').slice(0, 3).map((part) => Number.parseFloat(part.trim()) || 0);
    }
    const srgb = text.match(/color\\(srgb\\s+([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)/);
    if (srgb) return srgb.slice(1, 4).map((part) => (Number.parseFloat(part) || 0) * 255);
    return [0, 0, 0];
  };
  const left = parts(a);
  const right = parts(b);
  return Math.abs(left[0] - right[0]) + Math.abs(left[1] - right[1]) + Math.abs(left[2] - right[2]);
};
const skeletonDarkContrast = colorDelta(skeletonDarkStyle.backgroundColor, skeletonDarkPanelStyle.backgroundColor);
const skeletonHasShimmer = skeletonDarkStyle.backgroundImage.includes('linear-gradient');
window.Usuzumi.applyTheme(document.documentElement, 'light', '', false);
await wait(80);

const progressPanelRoot = await showComponent('#component-progress');
const spinnerAnimation = getComputedStyle(progressPanelRoot.querySelector('.uzu-spinner')).animationName;
`;
