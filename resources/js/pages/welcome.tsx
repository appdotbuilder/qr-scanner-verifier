import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { QrCodeScanner } from '@/components/qr-code-scanner';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="QR Scanner - Instant Ticket Verification">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
                <meta name="csrf-token" content={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
                {/* Header */}
                <header className="bg-white shadow-sm dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">📱</div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                    QR Scanner
                                </h1>
                            </div>
                            <nav className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="inline-block rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* Scanner */}
                        <div className="order-2 lg:order-1">
                            <QrCodeScanner />
                        </div>

                        {/* Info Section */}
                        <div className="order-1 lg:order-2 space-y-6">
                            <div>
                                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                    🎫 Instant Ticket Verification
                                </h2>
                                <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                                    Fast, reliable QR code scanning for event tickets and access codes.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="grid gap-4">
                                <div className="bg-white rounded-lg p-4 shadow-sm dark:bg-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">⚡</div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Lightning Fast
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Instant scanning and verification with real-time feedback
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm dark:bg-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">📱</div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Mobile Optimized
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Works perfectly on phones, tablets, and desktop devices
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm dark:bg-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">🔒</div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Secure Verification
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Real-time API validation ensures ticket authenticity
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 shadow-sm dark:bg-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">✨</div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Visual Feedback
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Clear green/red indicators for valid/invalid tickets
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Demo Instructions */}
                            <div className="bg-blue-50 rounded-lg p-4 dark:bg-blue-900/20">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                    🧪 Try the Demo
                                </h3>
                                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                                    Create a test QR code to see the scanner in action:
                                </p>
                                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                                    <li>• QR codes starting with "VALID" will show as ✅ valid</li>
                                    <li>• All other QR codes will show as ❌ invalid</li>
                                    <li>• Use any QR code generator online to test</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t bg-white dark:bg-gray-800 dark:border-gray-700 mt-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Built with ❤️ using React, Laravel & HTML5 QR Code Scanner
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}