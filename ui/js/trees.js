  function getTreeItems(tree) {
    return getScopedControls(tree, '[data-uzu-tree-item], .uzu-tree-item', '[data-uzu-tree]');
  }

  function getTreeItemControl(item) {
    return item.querySelector('[data-uzu-tree-label], .uzu-tree-label') || item;
  }

  function getTreeItemGroup(item) {
    return item.querySelector(':scope > [role="group"], :scope > .uzu-tree-group');
  }

  function isTreeItemExpanded(item) {
    const group = getTreeItemGroup(item);
    return Boolean(group && !group.hidden);
  }

  function setTreeItemExpanded(item, expanded, emit = true) {
    const tree = item.closest('[data-uzu-tree]');
    const group = getTreeItemGroup(item);
    const toggle = item.querySelector('[data-uzu-tree-toggle], .uzu-tree-toggle');
    if (!group) return;
    group.hidden = !expanded;
    item.classList.toggle('is-open', expanded);
    item.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (toggle) toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    if (emit && tree) {
      tree.dispatchEvent(new CustomEvent('uzu-tree-toggle', {
        bubbles: true,
        detail: { tree, item, expanded, value: getControlValue(item, 'uzuTreeValue') }
      }));
    }
  }

  function getVisibleTreeItems(tree) {
    return getTreeItems(tree).filter((item) => {
      let parent = item.parentElement?.closest('[data-uzu-tree-item], .uzu-tree-item');
      while (parent && tree.contains(parent)) {
        if (!isTreeItemExpanded(parent)) return false;
        parent = parent.parentElement?.closest('[data-uzu-tree-item], .uzu-tree-item');
      }
      return true;
    });
  }

  function selectTreeItem(tree, item, emit = true) {
    getTreeItems(tree).forEach((control) => {
      const selected = control === item;
      control.classList.toggle('is-selected', selected);
      control.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
    tree.dataset.uzuTreeValue = getControlValue(item, 'uzuTreeValue');
    if (emit) {
      tree.dispatchEvent(new CustomEvent('uzu-tree-select', {
        bubbles: true,
        detail: { tree, item, value: tree.dataset.uzuTreeValue }
      }));
      tree.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function initTrees(root = document) {
    queryAll(root, '[data-uzu-tree]').forEach((tree) => {
      const items = getTreeItems(tree);
      if (!items.length) return;
      tree.setAttribute('role', tree.getAttribute('role') || 'tree');
      items.forEach((item) => {
        item.setAttribute('role', item.getAttribute('role') || 'treeitem');
        item.setAttribute('tabindex', item.classList.contains('is-selected') ? '0' : '-1');
        const group = getTreeItemGroup(item);
        if (group) {
          group.setAttribute('role', group.getAttribute('role') || 'group');
          if (!item.classList.contains('is-open') && item.getAttribute('aria-expanded') !== 'true') group.hidden = true;
          setTreeItemExpanded(item, !group.hidden, false);
        }
      });
      const selected = items.find((item) => item.classList.contains('is-selected')) || items[0];
      if (selected) {
        selected.setAttribute('tabindex', '0');
        selectTreeItem(tree, selected, false);
      }
      if (!markInitialized(tree, 'Tree')) return;
      tree.addEventListener('click', (event) => {
        const toggle = getScopedEventControl(event, '[data-uzu-tree-toggle], .uzu-tree-toggle', tree, '[data-uzu-tree]');
        const item = toggle ? toggle.closest('[data-uzu-tree-item], .uzu-tree-item') : getScopedEventControl(event, '[data-uzu-tree-item], .uzu-tree-item', tree, '[data-uzu-tree]');
        if (!item) return;
        if (toggle) {
          event.preventDefault();
          setTreeItemExpanded(item, !isTreeItemExpanded(item));
        } else {
          selectTreeItem(tree, item);
        }
      });
      tree.addEventListener('keydown', (event) => {
        const item = event.target instanceof Element ? event.target.closest('[data-uzu-tree-item], .uzu-tree-item') : null;
        if (!item || !tree.contains(item)) return;
        const visible = getVisibleTreeItems(tree);
        const index = visible.indexOf(item);
        let next = null;
        if (event.key === 'ArrowDown') next = visible[index + 1] || visible[0];
        else if (event.key === 'ArrowUp') next = visible[index - 1] || visible.at(-1);
        else if (event.key === 'ArrowRight') {
          if (getTreeItemGroup(item) && !isTreeItemExpanded(item)) setTreeItemExpanded(item, true);
          else next = getVisibleTreeItems(tree)[index + 1] || null;
        } else if (event.key === 'ArrowLeft') {
          if (getTreeItemGroup(item) && isTreeItemExpanded(item)) setTreeItemExpanded(item, false);
          else next = item.parentElement?.closest('[data-uzu-tree-item], .uzu-tree-item');
        } else if (event.key === 'Home') next = visible[0];
        else if (event.key === 'End') next = visible.at(-1);
        else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectTreeItem(tree, item);
        }
        if (next) {
          event.preventDefault();
          getTreeItems(tree).forEach((control) => control.setAttribute('tabindex', control === next ? '0' : '-1'));
          next.focus();
        }
      });
    });
  }
