export const visualExpressionNavigationFeedbackChecks = `const stepNavPanelRoot = await showComponent('#component-step-nav');
const stepNav = stepNavPanelRoot.querySelector('[data-uzu-step-nav]');
const stepNavReview = stepNav.querySelector('[data-uzu-step-value="finish"]');
click(stepNavReview);
await wait(80);
const stepNavValue = stepNav.dataset.uzuStepNavValue;
const stepNavCurrent = stepNavReview.getAttribute('aria-current');

const accordionPanelRoot = await showComponent('#component-accordion');
const accordion = accordionPanelRoot.querySelector('[data-uzu-accordion]');
const accordionItems = accordion.querySelectorAll('[data-uzu-disclosure]');
click(accordionItems[1].querySelector('[data-uzu-disclosure-trigger]'));
await wait(300);
const accordionFirstOpen = accordionItems[0].classList.contains('is-open');
const accordionSecondOpen = accordionItems[1].classList.contains('is-open');

const tagPanelRoot = await showComponent('#component-tag');
const selectableTag = tagPanelRoot.querySelector('[data-uzu-tag-selectable]');
const closeableTag = tagPanelRoot.querySelector('[data-uzu-tag-close]').closest('[data-uzu-tag]');
click(selectableTag);
await wait(80);
const tagChanged = selectableTag.getAttribute('aria-pressed') === 'false';
click(closeableTag.querySelector('[data-uzu-tag-close]'));
await wait(80);
const tagClosed = closeableTag.hidden;

await showComponent('#component-alert-dialog');
const alertDialogTrigger = document.querySelector('[data-uzu-dialog-target="#site-alert-dialog"]');
const alertDialog = document.querySelector('#site-alert-dialog');
click(alertDialogTrigger);
await wait(80);
const alertDialogRole = alertDialog.getAttribute('role');
const alertDialogBorderLeftWidth = Math.round(Number.parseFloat(getComputedStyle(alertDialog).borderLeftWidth));
click(alertDialog.querySelector('[data-uzu-dialog-close]'));
await wait(240);

await showComponent('#component-drawer');
const drawerTrigger = document.querySelector('[data-uzu-dialog-target="#site-drawer"]');
const drawer = document.querySelector('#site-drawer');
click(drawerTrigger);
await wait(80);
const drawerOpenAnimation = getComputedStyle(drawer).animationName;
const drawerOpenTransform = getComputedStyle(drawer).transform;
click(drawer.querySelector('[data-uzu-dialog-close]'));
await wait(240);

const hoverPanelRoot = await showComponent('#component-hover-card');
const hoverCard = hoverPanelRoot.querySelector('[data-uzu-hover-card]');
hoverCard.querySelector('[data-uzu-hover-card-trigger]').focus();
await wait(180);
const hoverCardOpen = hoverCard.classList.contains('is-open');
`;
