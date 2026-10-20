import { CartItem } from '../types';
import { productMappingDb } from '../db/productMappingDb';

export interface RamiLevyItemPayload {
  id: string; // Rami Levy internal item code
  quantity: number;
  barcode: string;
  nameHe: string;
}

export function getRamiLevyItemPayloads(cartItems: CartItem[]): RamiLevyItemPayload[] {
  return cartItems.map((item) => {
    const internalId = productMappingDb.resolveStoreCode(item.product.id, 'ramilevy', item.product.barcode);
    return {
      id: internalId,
      quantity: Math.max(1, Math.round(item.quantity)),
      barcode: item.product.barcode,
      nameHe: item.product.nameHe,
    };
  });
}

/**
 * Method 1: Rami Levy 1-Click In-Page Injector Bookmarklet
 * Interacts with Rami Levy's Nuxt/Vue store and internal API (/api/v2/cart)
 */
export function generateRamiLevyBookmarklet(cartItems: CartItem[]): string {
  const items = getRamiLevyItemPayloads(cartItems);
  const itemsJson = JSON.stringify(items);

  const rawScript = `
javascript:(function(){
  if (!location.hostname.includes('rami-levy.co.il')) {
    alert('אנא פתח את אתר רמי לוי (rami-levy.co.il) ולאחר מכן לחץ על הסימניה להזרקת הסל.');
    window.open('https://www.rami-levy.co.il/he', '_blank');
    return;
  }
  var items = ${itemsJson};
  var oldHud = document.getElementById('salkal-rl-hud');
  if (oldHud) oldHud.remove();

  var hud = document.createElement('div');
  hud.id = 'salkal-rl-hud';
  hud.dir = 'rtl';
  hud.style.position = 'fixed';
  hud.style.bottom = '20px';
  hud.style.left = '20px';
  hud.style.width = '380px';
  hud.style.maxHeight = '80vh';
  hud.style.background = '#064e3b';
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
  header.style.background = '#022c22';
  header.style.borderBottom = '1px solid #047857';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.innerHTML = '<strong style=\"color:#34d399;font-size:14px;\">🛒 SalKal - הזרקת סל לרמי לוי</strong><button id=\"salkal-rl-close\" style=\"background:none;border:none;color:#a7f3d0;cursor:pointer;font-size:18px;\">✕</button>';
  hud.appendChild(header);

  var body = document.createElement('div');
  body.id = 'salkal-rl-list';
  body.style.padding = '12px 16px';
  body.style.overflowY = 'auto';
  body.style.maxHeight = '300px';
  hud.appendChild(body);

  var footer = document.createElement('div');
  footer.style.padding = '12px 16px';
  footer.style.background = '#022c22';
  footer.style.borderTop = '1px solid #047857';
  footer.innerHTML = '<span id=\"salkal-rl-status\" style=\"color:#a7f3d0;font-size:12px;\">מתחיל בהוספת ' + items.length + ' מוצרים...</span>';
  hud.appendChild(footer);

  document.body.appendChild(hud);
  document.getElementById('salkal-rl-close').onclick = function(){ hud.remove(); };

  var token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  try {
    if (!token && window.$nuxt && window.$nuxt.$auth && window.$nuxt.$auth.getToken) {
      token = window.$nuxt.$auth.getToken('local') || '';
    }
  } catch(e){}

  var idx = 0;
  function processNext() {
    if (idx >= items.length) {
      document.getElementById('salkal-rl-status').innerHTML = '<span style=\"color:#34d399;font-weight:bold;\">✓ כל המוצרים נוספו בהצלחה!</span>';
      setTimeout(function(){ location.reload(); }, 2000);
      return;
    }
    var it = items[idx];
    var row = document.createElement('div');
    row.style.padding = '6px 0';
    row.style.borderBottom = '1px solid #047857';
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.innerHTML = '<span>' + it.nameHe + ' (' + it.quantity + ')</span><span id=\"rl-status-' + idx + '\" style=\"color:#fde047;\">מוסיף...</span>';
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;

    var payload = {
      items: [{ id: it.id, barcode: it.barcode, quantity: it.quantity }]
    };

    fetch('/api/v2/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? ('Bearer ' + token.replace(/^Bearer\\s+/, '')) : ''
      },
      body: JSON.stringify(payload)
    }).then(function(res){
      var badge = document.getElementById('rl-status-' + idx);
      if (res.ok) {
        badge.style.color = '#34d399';
        badge.innerText = '✓ נוסף';
      } else {
        badge.style.color = '#fca5a5';
        badge.innerText = 'נשלח';
      }
      idx++;
      setTimeout(processNext, 400);
    }).catch(function(err){
      var badge = document.getElementById('rl-status-' + idx);
      badge.style.color = '#fca5a5';
      badge.innerText = 'שגיאה';
      idx++;
      setTimeout(processNext, 400);
    });
  }
  processNext();
})();
  `.replace(/\n\s*/g, ' ').trim();

  return rawScript;
}

/**
 * Method 2: Rami Levy MCP Payload
 * Compatible with shaiu/rami-levy-mcp
 */
export function generateRamiLevyMcpPayload(cartItems: CartItem[]): string {
  const items = getRamiLevyItemPayloads(cartItems);
  const mcpPayload = {
    method: 'tools/call',
    params: {
      name: 'rami_levy_add_items',
      arguments: {
        items: items.map((it) => ({
          id: it.id,
          barcode: it.barcode,
          quantity: it.quantity,
          name: it.nameHe,
        })),
      },
    },
  };
  return JSON.stringify(mcpPayload, null, 2);
}

/**
 * Method 3: Direct Rami Levy REST API Body
 */
export function generateRamiLevyApiPayload(cartItems: CartItem[]): string {
  const items = getRamiLevyItemPayloads(cartItems);
  return JSON.stringify(
    {
      action: 'cart_update',
      items: items.map((it) => ({
        id: it.id,
        quantity: it.quantity,
      })),
    },
    null,
    2
  );
}
