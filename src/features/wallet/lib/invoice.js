import { siteConfig } from "@/config/site";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/**
 * Builds a self-contained, print-styled HTML invoice (no packages).
 * The user saves it as PDF from the browser's print dialog.
 * TODO(api): if the backend generates signed PDF invoices, open that URL instead.
 */
export function buildInvoiceHtml(inv, t, locale) {
  const money = (n) => esc(formatCurrency(n, locale));
  const row = (label, value, strong = false) =>
    `<tr${strong ? ' class="total"' : ""}><td>${esc(label)}</td><td class="num">${value}</td></tr>`;

  return `<!doctype html>
<html lang="${esc(locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc("Tax invoice")} ${esc(inv.invoiceNo)}</title>
<style>
  *{box-sizing:border-box} body{font:14px/1.5 Poppins,Inter,system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans Devanagari",sans-serif;color:#2b1608;margin:0;padding:32px;background:#fff}
  .wrap{max-width:720px;margin:0 auto}
  header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #f26b1d;padding-bottom:16px;margin-bottom:24px;gap:16px}
  .brand{font-size:22px;font-weight:700;color:#c2410c;letter-spacing:.02em} .muted{color:#6b4e3d;font-size:12px}
  h1{font-size:18px;margin:0;color:#b45309;text-transform:uppercase;letter-spacing:.08em;text-align:right}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
  .box{border:1px solid #f6dcc6;border-radius:10px;padding:12px}
  .box b{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b4e3d;margin-bottom:4px}
  table{width:100%;border-collapse:collapse} td{padding:10px 8px;border-bottom:1px solid #f6dcc6} .num{text-align:right;font-variant-numeric:tabular-nums}
  thead td{font-weight:600;background:#fff1e5;border-bottom:0}
  tr.total td{font-weight:700;font-size:16px;border-top:2px solid #2b1608;border-bottom:0}
  .note{margin-top:24px;padding:12px;background:#fff8e6;border-radius:10px;font-size:12px}
  .actions{margin:24px 0 0;text-align:center} button{font:inherit;padding:10px 22px;border-radius:999px;border:0;background:#f26b1d;color:#fff;font-weight:600;cursor:pointer}
  @media print{body{padding:0}.actions{display:none}}
</style></head>
<body><div class="wrap">
<header>
  <div><div class="brand">${esc(siteConfig.name)}</div>
  <div class="muted">${esc(inv.seller.name)}<br>${esc(inv.seller.address)}<br>GSTIN: ${esc(inv.seller.gstin)}</div></div>
  <div><h1>${esc("Tax invoice")}</h1>
  <div class="muted" style="text-align:right">${esc("Invoice no.")}: <strong>${esc(inv.invoiceNo)}</strong><br>
  ${esc("Date")}: ${esc(formatDate(inv.date, locale))}</div></div>
</header>
<div class="grid">
  <div class="box"><b>${esc("Billed to")}</b>${esc(inv.customer.name || "—")}<br>${inv.customer.phone ? `+91 ${esc(inv.customer.phone)}` : ""}</div>
  <div class="box"><b>${esc("Payment")}</b>${esc("Order ID")}: ${esc(inv.orderId || "—")}<br>${esc("Method")}: ${esc(inv.method)}</div>
</div>
<table>
  <thead><tr><td>${esc("Description")}</td><td class="num">${esc("Amount")}</td></tr></thead>
  <tbody>
    ${inv.lines.map((l) => row(t(`wallet.invoice.line_${l.description}`), money(l.amount))).join("")}
    ${row("Taxable value", money(inv.taxable))}
    ${inv.igst ? row(`IGST @ ${inv.gstPercent}%`, money(inv.igst)) : inv.cgst || inv.sgst ? `${row(`CGST @ ${inv.gstPercent / 2}%`, money(inv.cgst))}${row(`SGST @ ${inv.gstPercent / 2}%`, money(inv.sgst))}` : ""}
    ${row("Total paid", money(inv.total), true)}
  </tbody>
</table>
<p class="note">${esc(`${formatCurrency(inv.credit, locale)} was credited to your wallet for this payment (including any bonus).`)}</p>
<p class="muted">${esc("This is a computer-generated invoice and does not require a signature.")}</p>
<div class="actions"><button onclick="window.print()">${esc("Print / Save as PDF")}</button></div>
</div></body></html>`;
}

/**
 * Open a blank window synchronously (inside the click handler, so popup blockers
 * allow it), then fill it once the invoice data arrives.
 * @returns {{ fill: (inv, t, locale) => void, fail: () => void } | null}  null if blocked
 */
export function openInvoiceWindow(loadingText) {
  const win = window.open("", "_blank");
  if (!win) return null;
  win.document.write(`<p style="font-family:system-ui;padding:32px;color:#6b4e3d">${esc(loadingText)}</p>`);
  return {
    fill(inv, t, locale) {
      win.document.open();
      win.document.write(buildInvoiceHtml(inv, t, locale));
      win.document.close();
      win.focus();
    },
    fail: () => win.close(),
  };
}
