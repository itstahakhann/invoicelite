/* ==========================================================================
   InvoiceLite V1 – Script
   Clean, modular invoice generator (vanilla JS)
   ========================================================================== */

(function () {
  'use strict';

  // ---------- DOM References ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Editor elements
  const bizNameInput = $('#bizName');
  const bizEmailInput = $('#bizEmail');
  const bizPhoneInput = $('#bizPhone');
  const bizAddressInput = $('#bizAddress');
  const logoInput = $('#logoInput');
  const logoPreview = $('#logoPreview');
  const removeLogoBtn = $('#removeLogoBtn');

  const custNameInput = $('#custName');
  const custEmailInput = $('#custEmail');
  const custPhoneInput = $('#custPhone');
  const custAddressInput = $('#custAddress');

  const invNumberInput = $('#invNumber');
  const invDateInput = $('#invDate');
  const dueDateInput = $('#dueDate');
  const currencySelect = $('#currencySelect');

  const itemsContainer = $('#itemsContainer');
  const addItemBtn = $('#addItemBtn');
  const taxRateInput = $('#taxRate');
  const discountRateInput = $('#discountRate');
  const clearInvoiceBtn = $('#clearInvoiceBtn');

  const previewPanel = $('#previewPanel');
  const invoicePreview = $('#invoicePreview');
  const previewBtn = $('#previewBtn');
  const printBtn = $('#printBtn');
  const toastEl = $('#toast');

  // ---------- State ----------
  let items = [];
  let logoDataUrl = null;

  // ---------- Utilities ----------
  function formatCurrency(value, currency = '$') {
    const num = Number(value) || 0;
    // simple formatting; for non-$ currencies we just prefix
    return `${currency}${num.toFixed(2)}`;
  }

  function toNumber(value) {
    const n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2500);
  }

  // ---------- Validation ----------
  function validateEmail(email) {
    if (!email) return true; // empty is allowed, just not invalid
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function markInputError(input, hasError) {
    if (!input) return;
    input.classList.toggle('input-error', hasError);
  }

  function validateAll() {
    let valid = true;

    // Business name required
    const bizNameEmpty = !bizNameInput.value.trim();
    markInputError(bizNameInput, bizNameEmpty);
    if (bizNameEmpty) valid = false;

    // Customer name required
    const custNameEmpty = !custNameInput.value.trim();
    markInputError(custNameInput, custNameEmpty);
    if (custNameEmpty) valid = false;

    // Email validation
    markInputError(bizEmailInput, !validateEmail(bizEmailInput.value.trim()));
    markInputError(custEmailInput, !validateEmail(custEmailInput.value.trim()));

    // Items validation
    $$('.item-row').forEach(row => {
      const qty = row.querySelector('.item-qty');
      const price = row.querySelector('.item-price');
      if (qty && toNumber(qty.value) <= 0 && qty.value !== '') {
        qty.classList.add('input-error');
        valid = false;
      } else if (qty) {
        qty.classList.remove('input-error');
      }
      if (price && toNumber(price.value) < 0) {
        price.classList.add('input-error');
        valid = false;
      } else if (price) {
        price.classList.remove('input-error');
      }
    });

    // Tax & discount cannot be negative
    const tax = toNumber(taxRateInput.value);
    const disc = toNumber(discountRateInput.value);
    markInputError(taxRateInput, tax < 0);
    markInputError(discountRateInput, disc < 0);
    if (tax < 0 || disc < 0) valid = false;

    return valid;
  }

  // ---------- Items Management ----------
  function createItemRow(item = {}) {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" class="item-name" placeholder="Item description" value="${escapeHtml(item.name || '')}" aria-label="Item name">
      <input type="number" class="item-qty" placeholder="1" min="0" step="1" value="${item.qty || 1}" aria-label="Quantity">
      <input type="number" class="item-price" placeholder="0.00" min="0" step="0.01" value="${item.price || 0}" aria-label="Unit price">
      <span class="item-total">${formatCurrency((item.qty || 1) * (item.price || 0))}</span>
      <button type="button" class="remove-item" aria-label="Remove item">✕</button>
    `;
    return row;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"]/g, function (m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      if (m === '"') return '&quot;';
      return m;
    });
  }

  function renderItems() {
    if (!items.length) {
      itemsContainer.innerHTML = '<p class="empty-items-message">No items yet. Click “Add Item” to begin.</p>';
      return;
    }
    itemsContainer.innerHTML = '';
    items.forEach((item, index) => {
      const row = createItemRow(item);
      // Store index
      row.dataset.index = index;
      itemsContainer.appendChild(row);
    });
  }

  function collectItemsFromDOM() {
    const rows = $$('.item-row', itemsContainer);
    return rows.map(row => ({
      name: row.querySelector('.item-name')?.value || '',
      qty: toNumber(row.querySelector('.item-qty')?.value) || 0,
      price: toNumber(row.querySelector('.item-price')?.value) || 0,
    }));
  }

  function addItem() {
    items.push({ name: '', qty: 1, price: 0 });
    renderItems();
    updatePreview();
    saveToLocalStorage();
  }

  function removeItem(index) {
    if (index < 0 || index >= items.length) return;
    items.splice(index, 1);
    renderItems();
    updatePreview();
    saveToLocalStorage();
  }

  // ---------- Calculations ----------
  function calculateTotals() {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const taxRate = toNumber(taxRateInput.value);
    const discountRate = toNumber(discountRateInput.value);
    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = subtotal * (discountRate / 100);
    const total = subtotal + taxAmount - discountAmount;

    return {
      subtotal: Math.max(0, subtotal),
      taxAmount: Math.max(0, taxAmount),
      discountAmount: Math.max(0, discountAmount),
      total: Math.max(0, total),
      taxRate,
      discountRate,
    };
  }

  // ---------- Rendering Preview ----------
  function updatePreview() {
    // Sync items from DOM first
    items = collectItemsFromDOM();

    const totals = calculateTotals();
    const currency = currencySelect.value || '$';

    const bizName = bizNameInput.value.trim() || 'Your Business';
    const bizEmail = bizEmailInput.value.trim();
    const bizPhone = bizPhoneInput.value.trim();
    const bizAddress = bizAddressInput.value.trim();

    const custName = custNameInput.value.trim() || 'Customer Name';
    const custEmail = custEmailInput.value.trim();
    const custPhone = custPhoneInput.value.trim();
    const custAddress = custAddressInput.value.trim();

    const invNumber = invNumberInput.value.trim() || 'INV-001';
    const invDate = invDateInput.value || '—';
    const dueDate = dueDateInput.value || '—';

    const logoUrl = logoDataUrl || 'assets/logo-placeholder.svg';

    // Build items table rows
    let itemsHtml = '';
    if (items.length === 0) {
      itemsHtml = `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:1rem;">No items added</td></tr>`;
    } else {
      itemsHtml = items.map(item => {
        const lineTotal = item.qty * item.price;
        const desc = item.name ? '' : '<div class="item-desc">—</div>';
        return `<tr>
          <td>${escapeHtml(item.name) || 'Item'}${desc}</td>
          <td class="text-right">${item.qty}</td>
          <td class="text-right">${formatCurrency(item.price, currency)}</td>
          <td class="text-right">${formatCurrency(lineTotal, currency)}</td>
        </tr>`;
      }).join('');
    }

    // Build totals rows
    const totalsHtml = `
      <div class="total-row">
        <span>Subtotal</span>
        <span>${formatCurrency(totals.subtotal, currency)}</span>
      </div>
      <div class="total-row">
        <span>Tax (${totals.taxRate}%)</span>
        <span>${formatCurrency(totals.taxAmount, currency)}</span>
      </div>
      <div class="total-row discount-row">
        <span>Discount (${totals.discountRate}%)</span>
        <span>−${formatCurrency(totals.discountAmount, currency)}</span>
      </div>
      <div class="total-row grand-total">
        <span>Total</span>
        <span>${formatCurrency(totals.total, currency)}</span>
      </div>
    `;

    // Construct full preview
    invoicePreview.innerHTML = `
      <div class="invoice-preview">
        <div class="invoice-header">
          <div class="invoice-brand">
            <img class="logo-preview" src="${logoUrl}" alt="Business logo">
            <div class="invoice-brand-info">
              <h2>${escapeHtml(bizName)}</h2>
              ${bizEmail ? `<p>${escapeHtml(bizEmail)}</p>` : ''}
              ${bizPhone ? `<p>${escapeHtml(bizPhone)}</p>` : ''}
              ${bizAddress ? `<p>${escapeHtml(bizAddress)}</p>` : ''}
            </div>
          </div>
          <div class="invoice-meta">
            <span class="inv-number">${escapeHtml(invNumber)}</span>
            <div><span class="label">Date:</span> ${invDate}</div>
            <div><span class="label">Due:</span> ${dueDate}</div>
          </div>
        </div>

        <div class="invoice-parties">
          <div class="invoice-party">
            <h4>Bill To</h4>
            <p class="name">${escapeHtml(custName)}</p>
            ${custEmail ? `<p>${escapeHtml(custEmail)}</p>` : ''}
            ${custPhone ? `<p>${escapeHtml(custPhone)}</p>` : ''}
            ${custAddress ? `<p>${escapeHtml(custAddress)}</p>` : ''}
          </div>
        </div>

        <table class="invoice-items">
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Price</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="invoice-totals">
          ${totalsHtml}
        </div>

        <div class="invoice-footer">
          Thank you for your business!
        </div>
      </div>
    `;
  }

  // ---------- Logo Handling ----------
  function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      logoDataUrl = ev.target.result;
      logoPreview.src = logoDataUrl;
      updatePreview();
      saveToLocalStorage();
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    logoDataUrl = null;
    logoPreview.src = 'assets/logo-placeholder.svg';
    logoInput.value = '';
    updatePreview();
    saveToLocalStorage();
  }

  // ---------- LocalStorage ----------
  const STORAGE_KEY = 'invoicelite_v1_data';

  function saveToLocalStorage() {
    try {
      const data = {
        bizName: bizNameInput.value,
        bizEmail: bizEmailInput.value,
        bizPhone: bizPhoneInput.value,
        bizAddress: bizAddressInput.value,
        custName: custNameInput.value,
        custEmail: custEmailInput.value,
        custPhone: custPhoneInput.value,
        custAddress: custAddressInput.value,
        invNumber: invNumberInput.value,
        invDate: invDateInput.value,
        dueDate: dueDateInput.value,
        currency: currencySelect.value,
        taxRate: taxRateInput.value,
        discountRate: discountRateInput.value,
        items: items,
        logoDataUrl: logoDataUrl,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // silently fail — localStorage may be disabled
    }
  }

  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);

      bizNameInput.value = data.bizName || '';
      bizEmailInput.value = data.bizEmail || '';
      bizPhoneInput.value = data.bizPhone || '';
      bizAddressInput.value = data.bizAddress || '';
      custNameInput.value = data.custName || '';
      custEmailInput.value = data.custEmail || '';
      custPhoneInput.value = data.custPhone || '';
      custAddressInput.value = data.custAddress || '';
      invNumberInput.value = data.invNumber || 'INV-001';
      invDateInput.value = data.invDate || '';
      dueDateInput.value = data.dueDate || '';
      currencySelect.value = data.currency || '$';
      taxRateInput.value = data.taxRate || '0';
      discountRateInput.value = data.discountRate || '0';

      if (data.logoDataUrl) {
        logoDataUrl = data.logoDataUrl;
        logoPreview.src = logoDataUrl;
      }

      items = Array.isArray(data.items) ? data.items : [];
      renderItems();
      updatePreview();
      return true;
    } catch (e) {
      return false;
    }
  }

  function clearInvoice() {
    if (!confirm('Clear the entire invoice? This cannot be undone.')) return;

    // Reset inputs
    bizNameInput.value = '';
    bizEmailInput.value = '';
    bizPhoneInput.value = '';
    bizAddressInput.value = '';
    custNameInput.value = '';
    custEmailInput.value = '';
    custPhoneInput.value = '';
    custAddressInput.value = '';
    invNumberInput.value = 'INV-001';
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    invDateInput.value = today;
    const due = new Date();
    due.setDate(due.getDate() + 30);
    dueDateInput.value = due.toISOString().split('T')[0];
    currencySelect.value = '$';
    taxRateInput.value = '0';
    discountRateInput.value = '0';

    // Reset logo
    logoDataUrl = null;
    logoPreview.src = 'assets/logo-placeholder.svg';
    logoInput.value = '';

    // Reset items to one empty
    items = [{ name: '', qty: 1, price: 0 }];
    renderItems();
    updatePreview();

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }

    showToast('Invoice cleared.');
  }

  // ---------- Preview Mode ----------
  function togglePreviewMode() {
    document.body.classList.toggle('preview-mode-active');
    const isPreview = document.body.classList.contains('preview-mode-active');
    previewBtn.textContent = isPreview ? 'Edit' : 'Preview';
    // Update aria
    previewBtn.setAttribute('aria-label', isPreview ? 'Return to editor' : 'Preview invoice');
    if (isPreview) {
      previewPanel.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ---------- Initialize ----------
  function init() {
    // Set default dates if not loaded
    const today = new Date().toISOString().split('T')[0];
    if (!invDateInput.value) invDateInput.value = today;
    if (!dueDateInput.value) {
      const due = new Date();
      due.setDate(due.getDate() + 30);
      dueDateInput.value = due.toISOString().split('T')[0];
    }

    // Try load from storage
    const loaded = loadFromLocalStorage();

    if (!loaded) {
      // Start with one empty item
      items = [{ name: '', qty: 1, price: 0 }];
      renderItems();
    }

    // Ensure at least one item row visible
    if (items.length === 0) {
      items.push({ name: '', qty: 1, price: 0 });
      renderItems();
    }

    // Initial preview
    updatePreview();

    // ---------- Event Listeners ----------
    // Live update on any editor change
    const formInputs = [
      bizNameInput, bizEmailInput, bizPhoneInput, bizAddressInput,
      custNameInput, custEmailInput, custPhoneInput, custAddressInput,
      invNumberInput, invDateInput, dueDateInput, currencySelect,
      taxRateInput, discountRateInput
    ];

    formInputs.forEach(input => {
      input.addEventListener('input', () => {
        updatePreview();
        saveToLocalStorage();
      });
      input.addEventListener('change', () => {
        updatePreview();
        saveToLocalStorage();
      });
    });

    // Items – delegated events
    itemsContainer.addEventListener('input', (e) => {
      const row = e.target.closest('.item-row');
      if (!row) return;
      const index = parseInt(row.dataset.index, 10);
      if (isNaN(index) || index < 0 || index >= items.length) return;

      // Update local state
      items[index].name = row.querySelector('.item-name')?.value || '';
      items[index].qty = toNumber(row.querySelector('.item-qty')?.value) || 0;
      items[index].price = toNumber(row.querySelector('.item-price')?.value) || 0;

      // Update line total display
      const totalSpan = row.querySelector('.item-total');
      if (totalSpan) {
        totalSpan.textContent = formatCurrency(items[index].qty * items[index].price);
      }

      updatePreview();
      saveToLocalStorage();
    });

    itemsContainer.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.remove-item');
      if (!removeBtn) return;
      const row = removeBtn.closest('.item-row');
      if (!row) return;
      const index = parseInt(row.dataset.index, 10);
      if (!isNaN(index)) {
        removeItem(index);
      }
    });

    // Add item
    addItemBtn.addEventListener('click', addItem);

    // Logo
    logoInput.addEventListener('change', handleLogoUpload);
    removeLogoBtn.addEventListener('click', removeLogo);

    // Clear invoice
    clearInvoiceBtn.addEventListener('click', clearInvoice);

    // Preview mode toggle
    previewBtn.addEventListener('click', togglePreviewMode);

    // Print
    printBtn.addEventListener('click', () => {
      // Validate before printing (but still allow)
      validateAll();
      window.print();
    });

    // Remove error highlight on input for specific fields
    [bizNameInput, custNameInput, bizEmailInput, custEmailInput].forEach(inp => {
      inp.addEventListener('input', () => {
        inp.classList.remove('input-error');
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();