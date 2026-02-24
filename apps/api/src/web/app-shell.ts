export const buildWebShell = (): string => {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>SalesApp Role Console</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;600;700&display=swap');
      :root {
        --bg: #0d1319;
        --card: #17222d;
        --card-strong: #1e2d3b;
        --line: #335064;
        --text: #f4f7fb;
        --muted: #9eb1c2;
        --accent: #ff9f43;
        --accent-2: #3ddc97;
        --danger: #ff5c5c;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(circle at 8% 10%, rgba(255, 159, 67, 0.18), transparent 30%),
          radial-gradient(circle at 88% 92%, rgba(61, 220, 151, 0.14), transparent 30%),
          var(--bg);
        color: var(--text);
        font-family: 'Manrope', sans-serif;
      }
      .layout { width: min(1100px, 92vw); margin: 32px auto 48px; }
      .headline {
        font-family: 'Bebas Neue', sans-serif;
        font-size: clamp(38px, 7vw, 74px);
        letter-spacing: 1.8px;
        margin: 0 0 8px;
      }
      .sub { color: var(--muted); margin: 0 0 26px; }
      .card {
        background: linear-gradient(160deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005));
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 18px;
        margin-bottom: 16px;
      }
      .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); }
      .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
      label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .8px; display: block; margin-bottom: 6px; }
      input, select, button, textarea {
        font: inherit;
        border-radius: 10px;
        border: 1px solid var(--line);
        background: var(--card);
        color: var(--text);
        padding: 10px 12px;
      }
      button { cursor: pointer; background: var(--card-strong); font-weight: 700; }
      button.primary { background: linear-gradient(140deg, var(--accent), #ff7a3c); border-color: transparent; color: #111; }
      button.ghost { background: transparent; }
      button.warn { background: linear-gradient(140deg, var(--danger), #ff8f8f); border-color: transparent; color: #111; }
      .pill { border: 1px solid var(--line); border-radius: 999px; padding: 4px 10px; font-size: 12px; color: var(--muted); }
      .role-panel { display: none; }
      .role-panel.active { display: block; }
      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        background: #0a1015;
        border: 1px solid #223646;
        border-radius: 12px;
        padding: 12px;
        min-height: 120px;
        color: #b9d0df;
      }
      @media (max-width: 760px) {
        .layout { width: min(1100px, 96vw); }
        .headline { font-size: 44px; }
      }
    </style>
  </head>
  <body>
    <div class="layout">
      <h1 class="headline">B2B ROLE CONSOLE</h1>
      <p class="sub">Web front + auth + role flows in one operator cockpit.</p>

      <section class="card">
        <div class="grid">
          <div>
            <label>Tenant</label>
            <input id="tenantId" value="tenant-demo" />
          </div>
          <div>
            <label>Demo User</label>
            <select id="userId"></select>
          </div>
          <div>
            <label>Password</label>
            <input id="password" value="demo12345" type="password" />
          </div>
          <div>
            <label>Action</label>
            <div class="row">
              <button id="refreshUsers" class="ghost">Refresh Users</button>
              <button id="login" class="primary">Login</button>
            </div>
          </div>
        </div>
        <div class="row" style="margin-top: 12px">
          <span class="pill" id="sessionRole">Role: anonymous</span>
          <span class="pill" id="sessionUser">User: -</span>
        </div>
      </section>

      <section class="card role-panel" data-role="CLIENT">
        <h3>Client Flow</h3>
        <div class="row">
          <button id="clientLoadCatalog">Load Catalog</button>
          <button id="clientCreateOrder" class="primary">Create Self Order</button>
          <button id="clientStatus">Load Order Status</button>
          <button id="clientConfirm">Confirm Fulfillment</button>
        </div>
      </section>

      <section class="card role-panel" data-role="SALES_AGENT">
        <h3>Sales Agent Flow</h3>
        <div class="grid">
          <div>
            <label>Target Client Id</label>
            <input id="agentClientId" value="client-1" />
          </div>
        </div>
        <div class="row" style="margin-top: 12px">
          <button id="agentCreateOrder" class="primary">Create Assisted Order</button>
          <button id="agentStatus">Load Order Status</button>
        </div>
      </section>

      <section class="card role-panel" data-role="IN_STORE_MANAGER">
        <h3>In-Store Manager Flow</h3>
        <div class="grid">
          <div>
            <label>Target Client Id</label>
            <input id="managerClientId" value="client-1" />
          </div>
          <div>
            <label>Order Id To Cancel</label>
            <input id="managerOrderToCancel" />
          </div>
        </div>
        <div class="row" style="margin-top: 12px">
          <button id="managerCreateOrder" class="primary">Create Assisted Order</button>
          <button id="managerCancel" class="warn">Cancel Order</button>
        </div>
      </section>

      <section class="card role-panel" data-role="ADMIN">
        <h3>Admin Flow</h3>
        <div class="grid">
          <div>
            <label>Target User Id</label>
            <input id="adminTargetUser" value="agent-1" />
          </div>
          <div>
            <label>New Role</label>
            <select id="adminRole">
              <option>CLIENT</option>
              <option>SALES_AGENT</option>
              <option>IN_STORE_MANAGER</option>
              <option>ADMIN</option>
            </select>
          </div>
          <div>
            <label>Status</label>
            <select id="adminStatus">
              <option>ACTIVE</option>
              <option>DISABLED</option>
            </select>
          </div>
        </div>
        <div class="row" style="margin-top: 12px">
          <button id="adminListUsers">List Users</button>
          <button id="adminUpdateAccess" class="primary">Update Access</button>
        </div>
      </section>

      <section class="card">
        <label>Trace Output</label>
        <pre id="out"></pre>
      </section>
    </div>

    <script>
      const state = { token: '', user: null, tenantId: 'tenant-demo', lastOrderId: '' };
      const out = document.getElementById('out');
      const write = (value) => { out.textContent = JSON.stringify(value, null, 2); };
      const setSession = () => {
        document.getElementById('sessionRole').textContent = 'Role: ' + (state.user?.role || 'anonymous');
        document.getElementById('sessionUser').textContent = 'User: ' + (state.user?.userId || '-');
        document.querySelectorAll('.role-panel').forEach((node) => {
          node.classList.toggle('active', node.dataset.role === state.user?.role);
        });
      };
      const request = async (path, options = {}) => {
        const headers = Object.assign({ 'content-type': 'application/json', 'x-tenant-id': state.tenantId }, options.headers || {});
        if (state.token) headers.authorization = 'Bearer ' + state.token;
        const response = await fetch(path, Object.assign({}, options, { headers }));
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw body;
        return body;
      };
      const loadUsers = async () => {
        state.tenantId = document.getElementById('tenantId').value;
        const data = await request('/api/v1/auth/demo-users?tenantId=' + encodeURIComponent(state.tenantId), { headers: {} });
        const select = document.getElementById('userId');
        select.innerHTML = '';
        for (const user of data.users) {
          const option = document.createElement('option');
          option.value = user.userId;
          option.textContent = user.displayName + ' (' + user.role + ')';
          select.appendChild(option);
        }
        write(data);
      };

      document.getElementById('refreshUsers').onclick = () => loadUsers().catch(write);
      document.getElementById('login').onclick = () => request('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: document.getElementById('tenantId').value,
          userId: document.getElementById('userId').value,
          password: document.getElementById('password').value
        })
      }).then((data) => { state.token = data.accessToken; state.user = data.user; state.tenantId = data.user.tenantId; setSession(); write(data); }).catch(write);

      document.getElementById('clientLoadCatalog').onclick = () => request('/api/v1/catalog/items').then(write).catch(write);
      document.getElementById('clientCreateOrder').onclick = () => request('/api/v1/orders', {
        method: 'POST',
        headers: { 'Idempotency-Key': 'web-client-' + Date.now() },
        body: JSON.stringify({ clientUserId: state.user.userId, lines: [{ productId: 'sku-100', qty: 2, unitPrice: 18 }] })
      }).then((data) => { state.lastOrderId = data.orderId; write(data); }).catch(write);
      document.getElementById('clientStatus').onclick = () => request('/api/v1/orders/' + state.lastOrderId).then(write).catch(write);
      document.getElementById('clientConfirm').onclick = () => request('/api/v1/orders/' + state.lastOrderId + '/confirm-fulfillment', { method: 'POST' }).then(write).catch(write);

      document.getElementById('agentCreateOrder').onclick = () => request('/api/v1/orders/assisted', {
        method: 'POST',
        headers: {
          'Idempotency-Key': 'web-agent-' + Date.now(),
          'x-target-client-id': document.getElementById('agentClientId').value
        },
        body: JSON.stringify({
          clientUserId: document.getElementById('agentClientId').value,
          lines: [{ productId: 'sku-200', qty: 1, unitPrice: 42 }]
        })
      }).then((data) => { state.lastOrderId = data.orderId; write(data); }).catch(write);
      document.getElementById('agentStatus').onclick = () => request('/api/v1/orders/' + state.lastOrderId).then(write).catch(write);

      document.getElementById('managerCreateOrder').onclick = () => request('/api/v1/orders/assisted', {
        method: 'POST',
        headers: {
          'Idempotency-Key': 'web-manager-' + Date.now(),
          'x-target-client-id': document.getElementById('managerClientId').value
        },
        body: JSON.stringify({
          clientUserId: document.getElementById('managerClientId').value,
          lines: [{ productId: 'sku-300', qty: 3, unitPrice: 11 }]
        })
      }).then((data) => { state.lastOrderId = data.orderId; document.getElementById('managerOrderToCancel').value = data.orderId; write(data); }).catch(write);
      document.getElementById('managerCancel').onclick = () => request('/api/v1/orders/' + document.getElementById('managerOrderToCancel').value + '/cancel', { method: 'POST' }).then(write).catch(write);

      document.getElementById('adminListUsers').onclick = () => request('/api/v1/admin/users/access').then(write).catch(write);
      document.getElementById('adminUpdateAccess').onclick = () => request('/api/v1/admin/users/access/' + document.getElementById('adminTargetUser').value, {
        method: 'PATCH',
        body: JSON.stringify({
          role: document.getElementById('adminRole').value,
          status: document.getElementById('adminStatus').value
        })
      }).then(write).catch(write);

      setSession();
      loadUsers().catch(write);
    </script>
  </body>
</html>`;
};
