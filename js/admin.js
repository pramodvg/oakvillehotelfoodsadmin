// Admin Page Logic — keypad input, add/remove orders, real-time list

(function () {
    const ordersRef = database.ref('orders');

    // DOM elements
    const numberDisplay = document.getElementById('numberDisplay');
    const addBtn = document.getElementById('addBtn');
    const ordersList = document.getElementById('ordersList');
    const orderCount = document.getElementById('orderCount');
    const toast = document.getElementById('toast');
    const screensaverToggle = document.getElementById('screensaverToggle');

    let currentInput = '';
    const MAX_DIGITS = 4;

    // ── Settings Toggle Logic ──
    const settingsRef = database.ref('settings/forceOrderPage');

    settingsRef.on('value', (snap) => {
        screensaverToggle.checked = snap.val() || false;
    });

    screensaverToggle.addEventListener('change', (e) => {
        settingsRef.set(e.target.checked)
            .then(() => showToast('Display settings updated', 'success'))
            .catch((err) => showToast('Failed to update settings', 'error'));
    });

    // ── Keypad Logic ──

    function updateDisplay() {
        if (currentInput === '') {
            numberDisplay.innerHTML = '<span class="placeholder">Enter #</span>';
            addBtn.disabled = true;
        } else {
            numberDisplay.textContent = currentInput;
            addBtn.disabled = false;
        }
    }

    function pressKey(digit) {
        if (currentInput.length >= MAX_DIGITS) return;
        currentInput += digit;
        updateDisplay();
    }

    function backspace() {
        currentInput = currentInput.slice(0, -1);
        updateDisplay();
    }

    function clearInput() {
        currentInput = '';
        updateDisplay();
    }

    // Attach keypad events
    document.querySelectorAll('.key-btn[data-digit]').forEach((btn) => {
        btn.addEventListener('click', () => pressKey(btn.dataset.digit));
    });

    document.getElementById('backspaceBtn').addEventListener('click', backspace);
    document.getElementById('clearBtn').addEventListener('click', clearInput);

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') {
            pressKey(e.key);
        } else if (e.key === 'Backspace') {
            backspace();
        } else if (e.key === 'Escape') {
            clearInput();
        } else if (e.key === 'Enter' && currentInput !== '') {
            addOrder();
        }
    });

    // ── Add Order ──

    function addOrder() {
        const orderNum = currentInput.trim();
        if (!orderNum) return;

        ordersRef.push({
            number: orderNum,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        })
            .then(() => {
                showToast(`Order #${orderNum} added`, 'success');
                clearInput();
            })
            .catch((err) => {
                showToast('Failed to add order', 'error');
                console.error(err);
            });
    }

    addBtn.addEventListener('click', addOrder);

    // ── Remove Order ──

    function removeOrder(key, number) {
        ordersRef.child(key).remove()
            .then(() => {
                showToast(`Order #${number} removed`, 'success');
            })
            .catch((err) => {
                showToast('Failed to remove order', 'error');
                console.error(err);
            });
    }

    // ── Real-Time Orders List ──

    ordersRef.orderByChild('timestamp').on('value', (snapshot) => {
        ordersList.innerHTML = '';

        if (!snapshot.exists()) {
            orderCount.textContent = '0';
            ordersList.innerHTML = `
        <div class="admin-empty">
          <div class="admin-empty-icon">📋</div>
          <p>No active orders</p>
        </div>
      `;
            return;
        }

        const orders = [];
        snapshot.forEach((child) => {
            orders.push({ key: child.key, ...child.val() });
        });

        // Sort by timestamp ascending
        orders.sort((a, b) => a.timestamp - b.timestamp);

        orderCount.textContent = orders.length;

        orders.forEach((order) => {
            const item = document.createElement('div');
            item.className = 'active-order-item';

            const timeStr = order.timestamp
                ? new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

            item.innerHTML = `
        <div>
          <div class="order-num">${escapeHtml(String(order.number))}</div>
          <div class="order-time">Added ${timeStr}</div>
        </div>
        <button class="remove-btn" aria-label="Remove order ${escapeHtml(String(order.number))}">Remove</button>
      `;

            item.querySelector('.remove-btn').addEventListener('click', () => {
                removeOrder(order.key, order.number);
            });

            ordersList.appendChild(item);
        });
    });

    // ── Toast Helper ──

    let toastTimeout;
    function showToast(message, type) {
        toast.textContent = message;
        toast.className = 'toast ' + type + ' show';
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.className = 'toast';
        }, 2500);
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize
    updateDisplay();
})();
