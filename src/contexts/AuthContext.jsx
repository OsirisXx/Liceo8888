import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userDepartment, setUserDepartment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchUserRole(session.user.id)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchUserRole(session.user.id)
      } else {
        setUser(null)
        setUserRole(null)
        setUserDepartment(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserRole = async (userId) => {
    const { data } = await supabase
      .from('users')
      .select('role, department')
      .eq('id', userId)
      .single()

    if (data) {
      setUserRole(data.role)
      setUserDepartment(data.department)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    // Clear state first
    setUser(null)
    setUserRole(null)
    setUserDepartment(null)
    // Then sign out from Supabase
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, userRole, userDepartment, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
