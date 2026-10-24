import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ allowedRole }) {
    const { user, role, loading } = useAuth();

    if (loading) {
        return <p>Memeriksa akses pengguna...</p>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (role !== allowedRole) {
        if (role === "owner") {
            return <Navigate to="/dashboard" replace />
        }

        if (role === "cashier") {
            return <Navigate to="/kasir" replace />
        }

        return <p>Akses ditolak. Role pengguna tidak valid</p>
    }

    return <Outlet />
}