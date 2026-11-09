// Service worker do CRM: recebe os avisos mesmo com o CRM fechado.
// Não guarda a página em cache de propósito: o CRM sempre abre na versão nova.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (x) {}
  e.waitUntil(self.registration.showNotification(d.titulo || 'CRM Automy', {
    body: d.corpo || 'Novidade no CRM.',
    icon: 'icone-192.png',
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const abertas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const crm = abertas.find(c => new URL(c.url).pathname.startsWith(new URL(self.registration.scope).pathname));
    if (crm) { await crm.focus(); crm.postMessage('atualizar'); return; }
    await self.clients.openWindow(self.registration.scope);
  })());
});
