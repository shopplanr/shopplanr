import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { supabase } from '../lib/supabase'
import LoadingScreen from './LoadingScreen'
import AppLayout from '../layouts/AppLayout'
import AdminLayout from '../layouts/AdminLayout'

const COMMON_ROUTES = ['/settings']
const ADMIN_ROUTES = [...COMMON_ROUTES, '/stats', '/users']
const USER_ROUTE_PREFIXES = ['/dashboard', '/lists', '/list', '/history']

export default function ProtectedRoute() {
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const location = useLocation()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.user) {
                setLoading(false)
                return
            }

            setIsAuthenticated(true)

            const { data, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single()

            if (!error && data?.is_admin) {
                setIsAdmin(true)
            }
        } catch (err) {
            console.error('Error checking auth:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingScreen />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    const currentPath = location.pathname

    if (isAdmin && !ADMIN_ROUTES.includes(currentPath)) {
        return <Navigate to="/stats" replace />
    }

    const isUserRoute = USER_ROUTE_PREFIXES.some((prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`))
    const isCommonRoute = COMMON_ROUTES.includes(currentPath)

    if (!isAdmin && !isCommonRoute && !isUserRoute) {
        return <Navigate to="/dashboard" replace />
    }

    if (isAdmin) {
        return <AdminLayout />
    }

    return <AppLayout />
}