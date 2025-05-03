import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">☕ Art Coffee</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            href="/order"
            className="p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">☕ Order Coffee</h2>
            <p className="text-gray-600 dark:text-gray-400">Make your own coffee order</p>
          </a>

          <a
            href="/bulk-order"
            className="p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">📦 Bulk Order</h2>
            <p className="text-gray-600 dark:text-gray-400">Order in bulk for your office or event</p>
          </a>

          <a
            href="/gift-card"
            className="p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">🎁 Gift Cards</h2>
            <p className="text-gray-600 dark:text-gray-400">Send a gift card to someone special</p>
          </a>

          <a
            href="/loyalty"
            className="p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">🎯 Loyalty Program</h2>
            <p className="text-gray-600 dark:text-gray-400">Check your points and rewards</p>
          </a>

          <a
            href="/admin"
            className="p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">📋 Admin Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage orders and view analytics</p>
          </a>

          <a
            href="/superadmin"
            className="p-6 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">🛠️ Superadmin Panel</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage users and system settings</p>
          </a>
        </div>
      </main>
    </div>
  );
}
