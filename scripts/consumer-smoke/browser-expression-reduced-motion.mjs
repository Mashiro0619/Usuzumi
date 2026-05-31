export const browserExpressionReducedMotion = `
const progressBar = document.querySelector('.uzu-progress-indeterminate .uzu-progress-bar');
const style = getComputedStyle(progressBar);
return {
  animationName: style.animationName,
  transform: style.transform,
  width: Math.round(progressBar.getBoundingClientRect().width)
};
`;
