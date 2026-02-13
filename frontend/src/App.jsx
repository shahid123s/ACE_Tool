import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to ACE Platform
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            A scalable, feature-based React application built with Clean Architecture principles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">⚛️ React + Vite</h2>
              <p className="text-gray-600">Lightning-fast development with Hot Module Replacement</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">🎨 Tailwind CSS</h2>
              <p className="text-gray-600">Utility-first CSS for rapid UI development</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">📦 Feature-Based</h2>
              <p className="text-gray-600">Modular architecture for scalable applications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
