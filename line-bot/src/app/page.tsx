export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '40px', maxWidth: 720 }}>
      <h1 style={{ color: '#1D9E75' }}>RIDEN LINE Bot</h1>
      <p>This is the LINE Messaging API service for RIDEN.</p>
      <p>
        Webhook endpoint: <code>/api/webhook</code>
      </p>
      <p>Admin endpoints (require Bearer token):</p>
      <ul>
        <li>
          <code>POST /api/menus/setup</code> — rebuild all rich menus
        </li>
        <li>
          <code>POST /api/menus/image</code> — upload custom menu image
        </li>
        <li>
          <code>POST /api/menus/link</code> — link menu to user
        </li>
        <li>
          <code>POST /api/push</code> — send test push message
        </li>
      </ul>
    </main>
  );
}
