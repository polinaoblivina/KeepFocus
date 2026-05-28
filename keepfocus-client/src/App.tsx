import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardsPage from './pages/BoardsPage';
import BoardPage from './pages/BoardPage';
import AnalyticsPage from './pages/AnalyticsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    if (isAuthenticated) return <Navigate to="/boards" replace />;
    return <>{children}</>;
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/boards" replace />} />

                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                <Route path="/boards" element={<PrivateRoute><BoardsPage /></PrivateRoute>} />
                <Route path="/boards/:boardId" element={<PrivateRoute><BoardPage /></PrivateRoute>} />
                <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/boards" replace />} />
            </Routes>
        </BrowserRouter>
    );
}