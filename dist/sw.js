self.addEventListener('push', function(event) {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'https://picsum.photos/seed/love/192/192',
    badge: 'https://picsum.photos/seed/love/192/192'
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
