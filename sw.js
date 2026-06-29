// Service worker do PWA Rotina: recebe o web push e mostra a notificação
// com SEU ícone/nome + botões Feito / Soneca. Não guarda nenhum segredo
// (a URL de ações vem dentro do payload do push, que é criptografado).

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data.json(); } catch (e) { d = {}; }
  const title = (d.titulo || 'Lembrete') + (d.horario ? ' — ' + d.horario : '');
  const options = {
    body: d.frase || 'Lembrete da rotina',
    icon: d.icon || 'icon.png',
    badge: d.icon || 'icon.png',
    tag: 'rotina',
    renotify: true,
    requireInteraction: !d.semBotoes,
    data: { acoesUrl: d.acoesUrl || null },
    actions: d.semBotoes ? [] : [
      { action: 'done', title: 'Feito' },
      { action: 'snooze', title: 'Soneca 5 min' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  const action = event.action; // 'done' | 'snooze' | '' (tocou no corpo)
  const acoesUrl = event.notification.data && event.notification.data.acoesUrl;
  event.notification.close();
  if ((action === 'done' || action === 'snooze') && acoesUrl) {
    event.waitUntil(fetch(acoesUrl, { method: 'POST', body: action }).catch(() => {}));
  } else {
    event.waitUntil(self.clients.openWindow('./'));
  }
});
