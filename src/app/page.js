import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="py-12 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 text-primary">Art Coffee</h1>
          <p className="text-xl text-secondary">Crafting the perfect cup, one bean at a time</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Order Coffee Card */}
          <a
            href="/order"
            className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">☕</div>
              <h2 className="text-2xl font-bold text-primary">Order Coffee</h2>
            </div>
            <p className="text-secondary">Create your perfect coffee order with our premium selection</p>
          </a>

          {/* Bulk Order Card */}
          <a
            href="/bulk-order"
            className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">📦</div>
              <h2 className="text-2xl font-bold text-primary">Bulk Order</h2>
            </div>
            <p className="text-secondary">Order in bulk for your office or special events</p>
          </a>

          {/* Gift Cards Card */}
          <a
            href="/gift-card"
            className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">🎁</div>
              <h2 className="text-2xl font-bold text-primary">Gift Cards</h2>
            </div>
            <p className="text-secondary">Share the joy of coffee with our digital gift cards</p>
          </a>

          {/* Loyalty Program Card */}
          <a
            href="/loyalty"
            className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">🎯</div>
              <h2 className="text-2xl font-bold text-primary">Loyalty Program</h2>
            </div>
            <p className="text-secondary">Earn points with every purchase and unlock rewards</p>
          </a>

          {/* Admin Dashboard Card */}
          <a
            href="/admin"
            className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">📋</div>
              <h2 className="text-2xl font-bold text-primary">Admin Dashboard</h2>
            </div>
            <p className="text-secondary">Manage orders and view business analytics</p>
          </a>

          {/* Superadmin Panel Card */}
          <a
            href="/superadmin"
            className="card-hover bg-card-bg border border-card-border rounded-xl p-6 hover:border-primary transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl">🛠️</div>
              <h2 className="text-2xl font-bold text-primary">Superadmin Panel</h2>
            </div>
            <p className="text-secondary">Manage users and system settings</p>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-secondary">
        <p>© 2024 Art Coffee. All rights reserved.</p>
      </footer>
    </div>
  );
}
