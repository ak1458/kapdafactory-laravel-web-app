import BottomNav from './BottomNav';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Main Content */}
            <main className="animate-fade-in">
                {children}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
