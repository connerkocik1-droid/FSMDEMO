import { SEO } from "@/components/SEO";

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found" noIndex={true} />
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="max-w-lg w-full text-center">
          <h1 className="text-7xl font-bold text-[#185FA5] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <nav className="flex flex-wrap justify-center gap-4">
            <a
              href="/"
              className="px-6 py-3 bg-[#185FA5] text-white rounded-lg font-medium hover:bg-[#14508a] transition-colors"
            >
              Home
            </a>
            <a
              href="/pricing"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Pricing
            </a>
            <a
              href="/demo"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Book a Demo
            </a>
            <a
              href="/blog"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Read the Blog
            </a>
          </nav>
        </div>
      </div>
    </>
  );
}
