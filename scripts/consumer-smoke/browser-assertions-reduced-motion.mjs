export function assertReducedMotionResult(reducedMotionValue) {
if (reducedMotionValue.animationName !== 'none') throw new Error('Reduced-motion progress should not animate');
if (reducedMotionValue.transform !== 'none') throw new Error('Reduced-motion progress should remain visible without off-track transform');
if (reducedMotionValue.width <= 0) throw new Error('Reduced-motion progress should keep a visible width');
}
