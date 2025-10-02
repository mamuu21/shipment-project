import { useState, useEffect } from 'react'

export type UserRole = 'admin' | 'staff' | 'customer' | null

export const useAuth = () => {
  const [role, setRole] = useState<UserRole>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get role from localStorage
    const storedRole = localStorage.getItem('role') as UserRole
    setRole(storedRole || null)
    setIsLoading(false)
  }, [])

  const updateRole = (newRole: UserRole) => {
    if (newRole) {
      localStorage.setItem('role', newRole)
    } else {
      localStorage.removeItem('role')
    }
    setRole(newRole)
  }

  const isAdmin = () => role === 'admin'
  const isStaff = () => role === 'staff'
  const isCustomer = () => role === 'customer'
  const isAdminOrStaff = () => role === 'admin' || role === 'staff'

  return {
    role,
    isLoading,
    updateRole,
    isAdmin: isAdmin(),
    isStaff: isStaff(),
    isCustomer: isCustomer(),
    isAdminOrStaff: isAdminOrStaff(),
    canCreate: isAdminOrStaff(),
    canEdit: isAdminOrStaff(),
    canDelete: isAdmin(),
  }
}