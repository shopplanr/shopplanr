import { Link } from 'react-router'

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-2xl">
                <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
                <h2 className="text-3xl font-bold text-text mb-4">Page Not Found</h2>
                <p className="text-xl text-text mb-8 opacity-80">
                    Oops! The page you're looking for doesn't exist.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    )
}
