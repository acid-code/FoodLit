import { CartItem } from '../types';
import { productMappingDb } from '../db/productMappingDb';

export interface ShufersalItemPayload {
  productCode: string;
  quantity: number;
  nameHe: string;
  barcode: string;
}

/**
 * Prepares cart items for Shufersal by resolving their Hybris internal catalog codes
 * (e.g. P_7290004131074 or internal PLUs) using the product mapping database.
 */
export function getShufersalItemPayloads(cartItems: CartItem[]): ShufersalItemPayload[] {
  return cartItems.map((item) => {
    const code = productMappingDb.resolveStoreCode(item.product.id, 'shufersal', item.product.barcode);
    return {
      productCode: code,
      quantity: Math.max(1, Math.round(item.quantity)),
      nameHe: item.product.nameHe,
      barcode: item.product.barcode,
    };
  });
}

/**
 * Method 1: Shufersal 1-Click In-Page Injector Bookmarklet
 * Inspired by Hybris ACC.cart and eshaham/shufersal-automation.
 * When executed on shufersal.co.il, it opens a floating HUD widget
 * and automatically adds each item into the active user session!
 */
export function generateShufersalBookmarklet(cartItems: CartItem[]): string {
  const items = getShufersalItemPayloads(cartItems);
  const itemsJson = JSON.stringify(items);

  const rawScript = `
javascript:(function(){
  if (!location.hostname.includes('shufersal.co.il')) {
    alert('אנא פתח את אתר שופרסל (shufersal.co.il) ולאחר מכן לחץ על הסימניה להזרקת הסל.');
    window.open('https://www.shufersal.co.il/online/he', '_blank');
    return;
  }
  var items = ${itemsJson};
  var oldHud = document.getElementById('salkal-hud');
  if (oldHud) oldHud.remove();

  var hud = document.createElement('div');
  hud.id = 'salkal-hud';
  hud.dir = 'rtl';
  hud.style.position = 'fixed';
  hud.style.bottom = '20px';
  hud.style.left = '20px';
  hud.style.width = '380px';
  hud.style.maxHeight = '80vh';
  hud.style.background = '#1e293b';
  hud.style.color = '#ffffff';
  hud.style.borderRadius = '16px';
  hud.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
  hud.style.zIndex = '999999';
  hud.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  hud.style.fontSize = '13px';
  hud.style.overflow = 'hidden';
  hud.style.display = 'flex';
  hud.style.flexDirection = 'column';

  var header = document.createElement('div');
  header.style.padding = '14px 16px';
  header.style.background = '#0f172a';
  header.style.borderBottom = '1px solid #334155';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.innerHTML = '<strong style=\"color:#38bdf8;font-size:14px;\">🛒 SalKal - הזרקת סל לשופרסל</strong><button id=\"salkal-close\" style=\"background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;\">✕</button>';
  hud.appendChild(header);

  var body = document.createElement('div');
  body.id = 'salkal-list';
  body.style.padding = '12px 16px';
  body.style.overflowY = 'auto';
  body.style.maxHeight = '300px';
  hud.appendChild(body);

  var footer = document.createElement('div');
  footer.style.padding = '12px 16px';
  footer.style.background = '#0f172a';
  footer.style.borderTop = '1px solid #334155';
  footer.style.display = 'flex';
  footer.style.justifyContent = 'space-between';
  footer.style.alignItems = 'center';
  footer.innerHTML = '<span id=\"salkal-status\" style=\"color:#e2e8f0;font-size:12px;\">מתחיל בהוספת ' + items.length + ' מוצרים...</span>';
  hud.appendChild(footer);

  document.body.appendChild(hud);
  document.getElementById('salkal-close').onclick = function(){ hud.remove(); };

  var getCsrfToken = function() {
    if (window.ACC && window.ACC.config && window.ACC.config.CSRFToken) return window.ACC.config.CSRFToken;
    var meta = document.querySelector('meta[name=\"_csrf\"]');
    if (meta) return meta.getAttribute('content');
    var input = document.querySelector('input[name=\"CSRFToken\"]');
    if (input) return input.value;
    return '';
  };

  var idx = 0;
  function processNext() {
    if (idx >= items.length) {
      document.getElementById('salkal-status').innerHTML = '<span style=\"color:#4ade80;font-weight:bold;\">✓ כל המוצרים נוספו בהצלחה!</span>';
      setTimeout(function(){ location.reload(); }, 2000);
      return;
    }
    var it = items[idx];
    var row = document.createElement('div');
    row.style.padding = '6px 0';
    row.style.borderBottom = '1px solid #334155';
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.innerHTML = '<span>' + it.nameHe + ' (' + it.quantity + ')</span><span id=\"status-' + idx + '\" style=\"color:#fbbf24;\">מוסיף...</span>';
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;

    var csrf = getCsrfToken();
    var formData = new URLSearchParams();
    formData.append('productCodePost', it.productCode);
    formData.append('qty', it.quantity);
    if (csrf) formData.append('CSRFToken', csrf);

    fetch('/online/he/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData.toString()
    }).then(function(res){
      var badge = document.getElementById('status-' + idx);
      if (res.ok) {
        badge.style.color = '#4ade80';
        badge.innerText = '✓ נוסף';
      } else {
        badge.style.color = '#f87171';
        badge.innerText = 'דרוש חיפוש';
      }
      idx++;
      setTimeout(processNext, 450);
    }).catch(function(err){
      var badge = document.getElementById('status-' + idx);
      badge.style.color = '#f87171';
      badge.innerText = 'שגיאה';
      idx++;
      setTimeout(processNext, 450);
    });
  }
  processNext();
})();
  `.replace(/\n\s*/g, ' ').trim();

  return rawScript;
}

/**
 * Method 2: Shufersal MCP (Model Context Protocol) Payload
 * Based on matipojo/shufersal-mcp implementation
 */
export function generateShufersalMcpPayload(cartItems: CartItem[]): string {
  const items = getShufersalItemPayloads(cartItems);
  const mcpPayload = {
    method: 'tools/call',
    params: {
      name: 'shufersal_add_to_cart',
      arguments: {
        items: items.map((it) => ({
          productCode: it.productCode,
          quantity: it.quantity,
          name: it.nameHe,
        })),
      },
    },
  };
  return JSON.stringify(mcpPayload, null, 2);
}

/**
 * Method 3: eshaham/shufersal-automation Node.js / Puppeteer script
 */
export function generateShufersalAutomationScript(cartItems: CartItem[]): string {
  const items = getShufersalItemPayloads(cartItems);
  const itemsArrayStr = JSON.stringify(
    items.map((it) => ({ productCode: it.productCode, qty: it.quantity })),
    null,
    2
  );

  return `/**
 * Shufersal Automated Cart Injector
 * Using eshaham/shufersal-automation & Puppeteer
 */
import { ShufersalClient } from 'shufersal-automation';

const itemsToAdd = ${itemsArrayStr};

async function syncCart() {
  const client = new ShufersalClient({
    headless: false,
  });

  console.log('Connecting to Shufersal session...');
  await client.init();

  for (const item of itemsToAdd) {
    console.log(\`Adding product: \${item.productCode} x\${item.qty}\`);
    await client.addToCart(item.productCode, item.qty);
  }

  console.log('Successfully injected all items into Shufersal cart!');
}

syncCart().catch(console.error);`;
}

/**
 * Method 4: Console One-Liner for Chrome DevTools
 */
export function generateShufersalConsoleScript(cartItems: CartItem[]): string {
  const items = getShufersalItemPayloads(cartItems);
  const itemsJson = JSON.stringify(items);
  return `(async function() {
  const items = ${itemsJson};
  console.log('SalKal: Adding ' + items.length + ' items to Shufersal cart...');
  const csrf = window.ACC?.config?.CSRFToken || document.querySelector('input[name="CSRFToken"]')?.value || '';
  for (const it of items) {
    const body = new URLSearchParams({ productCodePost: it.productCode, qty: it.quantity, CSRFToken: csrf });
    await fetch('/online/he/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
      body
    });
    console.log('✓ Added ' + it.nameHe);
  }
  location.reload();
})();`;
}
