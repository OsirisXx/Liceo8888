import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [userDepartment, setUserDepartment] = useState(null)
  const [isStudent, setIsStudent] = useState(false)
  const [studentProfile, setStudentProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    let isInitialized = false
    
    // Timeout helper to prevent hanging
    const withTimeout = (promise, ms = 8000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), ms)
        )
      ])
    }

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await withTimeout(supabase.auth.getSession())
        if (isMounted && session?.user) {
          setUser(session.user)
          await withTimeout(handleUserSession(session.user))
        }
        isInitialized = true
      } catch (err) {
        console.error('Auth init error:', err)
        isInitialized = true
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    
    initAuth()

    // Listen for auth changes - but skip initial session to prevent duplicate processing
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      // Skip INITIAL_SESSION event - we already handle this in initAuth
      // Only process SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
      if (event === 'INITIAL_SESSION') {
        return
      }
      
      // If not initialized yet, skip to avoid race condition
      if (!isInitialized) {
        return
      }
      
      try {
        if (session?.user) {
          setUser(session.user)
          // Only re-fetch profile on actual sign in, not token refresh
          if (event === 'SIGNED_IN') {
            await withTimeout(handleUserSession(session.user))
          }
        } else {
          setUser(null)
          setUserRole(null)
          setUserDepartment(null)
          setIsStudent(false)
          setStudentProfile(null)
        }
      } catch (err) {
        console.error('Auth state change error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleUserSession = async (authUser) => {
    // Check if user is a student (Google OAuth with @liceo.edu.ph)
    const email = authUser.email || ''
    if (email.endsWith('@liceo.edu.ph') && authUser.app_metadata?.provider === 'google') {
      setIsStudent(true)
      setUserRole('student')
      // Fetch or create student profile
      await fetchOrCreateStudentProfile(authUser)
    } else {
      // Check for admin/department role
      await fetchUserRole(authUser.id)
    }
  }

  const fetchOrCreateStudentProfile = async (authUser) => {
    try {
      // Check if student exists in students table
      let { data: student, error: fetchError } = await supabase
        .from('students')
        .select('*')
        .eq('email', authUser.email)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - that's ok, we'll create one
        console.error('Error fetching student:', fetchError)
      }

      if (!student) {
        // Create new student profile
        const { data: newStudent, error: insertError } = await supabase
          .from('students')
          .insert({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Student',
            avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture,
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating student profile:', insertError)
        } else if (newStudent) {
          student = newStudent
        }
      }

      setStudentProfile(student)
    } catch (err) {
      console.error('fetchOrCreateStudentProfile error:', err)
      // Still set a basic profile from auth data
      setStudentProfile({
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Student',
      })
    }
  }

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, department')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error)
        return
      }

      if (data) {
        setUserRole(data.role)
        setUserDepartment(data.department)
        setIsStudent(false)
      }
    } catch (err) {
      console.error('fetchUserRole error:', err)
    }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          hd: 'liceo.edu.ph', // Restrict to liceo.edu.ph domain
          prompt: 'select_account', // Force account selection
        },
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    // Clear state immediately
    setUser(null)
    setUserRole(null)
    setUserDepartment(null)
    setIsStudent(false)
    setStudentProfile(null)
    
    // Force clear all Supabase storage FIRST
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key)
      }
    })
    sessionStorage.clear()
    
    try {
      // Sign out from Supabase - wait for completion
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) console.error('Sign out error:', error)
    } catch (err) {
      console.error('Sign out error:', err)
    }
    
    // Force page reload after signout completes
    window.location.replace('/')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      userDepartment, 
      isStudent,
      studentProfile,
      loading, 
      signIn, 
      signInWithGoogle,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  )
}
