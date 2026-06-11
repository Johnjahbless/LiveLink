import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal top bar */}
      <header className="px-6 py-4 border-b border-gray-100 bg-white">
        <div className="max-w-sm mx-auto w-full">
          <Link
            href="/"
            className="font-bold text-green-700 text-lg syne"
          >
            LiveLink
          </Link>
        </div>
      </header>

      {/* Vertically centre the form in the remaining space */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  )
}
