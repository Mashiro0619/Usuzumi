  function getDataGridRows(table) {
    return queryAll(table, 'tbody tr, [data-uzu-grid-row]').filter((row) => row.closest('table') === table);
  }

  function initDataGrids(root = document) {
    queryAll(root, '[data-uzu-data-grid]').forEach((grid) => {
      const table = grid.matches('table') ? grid : grid.querySelector('table');
      if (!table) return;
      const rows = () => getDataGridRows(table);
      rows().forEach((row, index) => {
        row.dataset.uzuGridRow = row.dataset.uzuGridRow || String(index + 1);
        row.setAttribute('tabindex', row.getAttribute('tabindex') || '0');
      });
      if (!markInitialized(grid, 'DataGrid')) return;
      queryAll(table, '[data-uzu-grid-sort]').forEach((header) => {
        header.setAttribute('tabindex', header.getAttribute('tabindex') || '0');
        header.setAttribute('aria-sort', header.getAttribute('aria-sort') || 'none');
        const sort = () => {
          const body = table.tBodies[0];
          if (!body) return;
          const headers = [...header.parentElement.children];
          const columnIndex = headers.indexOf(header);
          const current = header.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
          queryAll(table, '[data-uzu-grid-sort]').forEach((item) => item.setAttribute('aria-sort', item === header ? current : 'none'));
          const direction = current === 'ascending' ? 1 : -1;
          const sorted = [...body.rows].sort((a, b) => {
            const aText = (a.cells[columnIndex]?.textContent || '').trim();
            const bText = (b.cells[columnIndex]?.textContent || '').trim();
            const aNumber = Number(aText.replace(/[^\d.-]/g, ''));
            const bNumber = Number(bText.replace(/[^\d.-]/g, ''));
            if (Number.isFinite(aNumber) && Number.isFinite(bNumber) && /\d/.test(aText + bText)) {
              return (aNumber - bNumber) * direction;
            }
            return aText.localeCompare(bText, undefined, { numeric: true }) * direction;
          });
          sorted.forEach((row) => body.append(row));
          grid.dispatchEvent(new CustomEvent('uzu-data-grid-sort', {
            bubbles: true,
            detail: { grid, table, header, columnIndex, direction: current }
          }));
        };
        header.addEventListener('click', sort);
        header.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            sort();
          }
        });
      });
      grid.addEventListener('click', (event) => {
        const row = event.target instanceof Element ? event.target.closest('[data-uzu-grid-row], tbody tr') : null;
        if (!row || !table.contains(row) || event.target.closest('a, button, input, select, textarea')) return;
        const multi = grid.dataset.uzuDataGridMulti === 'true';
        if (!multi) rows().forEach((item) => {
          if (item !== row) {
            item.classList.remove('is-selected');
            item.setAttribute('aria-selected', 'false');
          }
        });
        const selected = !(row.classList.contains('is-selected') || row.getAttribute('aria-selected') === 'true');
        row.classList.toggle('is-selected', selected);
        row.setAttribute('aria-selected', selected ? 'true' : 'false');
        grid.dispatchEvent(new CustomEvent('uzu-data-grid-select', {
          bubbles: true,
          detail: { grid, table, row, selected, value: row.dataset.uzuGridRow || '' }
        }));
      });
      grid.addEventListener('keydown', (event) => {
        const row = event.target instanceof Element ? event.target.closest('[data-uzu-grid-row], tbody tr') : null;
        const list = rows();
        if (!row || !list.length) return;
        const index = list.indexOf(row);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          list[(index + (event.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length].focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          row.click();
        }
      });
    });
  }
