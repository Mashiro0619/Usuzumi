export const consumerDialogsHtml = `    <button class="uzu-button" type="button" data-uzu-dialog-target="#consumer-dialog">Open dialog</button>
    <button class="uzu-button" type="button" data-uzu-dialog-target="#consumer-dialog-two">Open second dialog</button>
    <div class="uzu-dialog-overlay" data-uzu-dialog-overlay hidden>
      <section class="uzu-modal" id="consumer-dialog" data-uzu-dialog hidden tabindex="-1" aria-labelledby="consumer-dialog-title">
        <h2 id="consumer-dialog-title">Consumer dialog</h2>
        <button class="uzu-button" type="button" data-uzu-dialog-close>Close</button>
      </section>
    </div>
    <div class="uzu-dialog-overlay" data-uzu-dialog-overlay hidden>
      <section class="uzu-modal" id="consumer-dialog-two" data-uzu-dialog hidden tabindex="-1" aria-labelledby="consumer-dialog-two-title">
        <h2 id="consumer-dialog-two-title">Second dialog</h2>
        <button class="uzu-button" type="button" data-uzu-dialog-close>Close</button>
      </section>
    </div>
    <button class="uzu-button" id="consumer-drawer-trigger" type="button" data-uzu-dialog-target="#consumer-drawer">Open drawer</button>
    <button class="uzu-button uzu-button-danger" id="consumer-alert-dialog-trigger" type="button" data-uzu-dialog-target="#consumer-alert-dialog">Open alert dialog</button>
    <div class="uzu-dialog-overlay" data-uzu-dialog-overlay hidden>
      <aside class="uzu-drawer uzu-drawer-end" id="consumer-drawer" data-uzu-dialog hidden tabindex="-1" aria-labelledby="consumer-drawer-title">
        <h2 id="consumer-drawer-title">Consumer drawer</h2>
        <button class="uzu-button" type="button" data-uzu-dialog-close>Close drawer</button>
      </aside>
    </div>
    <div class="uzu-dialog-overlay" data-uzu-dialog-overlay hidden>
      <section class="uzu-modal uzu-alert-dialog" id="consumer-alert-dialog" data-uzu-dialog hidden tabindex="-1" role="alertdialog" aria-labelledby="consumer-alert-dialog-title" aria-describedby="consumer-alert-dialog-desc">
        <h2 id="consumer-alert-dialog-title">Delete item</h2>
        <p id="consumer-alert-dialog-desc">This action is dangerous.</p>
        <button class="uzu-button" type="button" data-uzu-dialog-close>Cancel</button>
      </section>
    </div>`;
