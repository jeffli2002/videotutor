import { supabase } from '../config/supabase'

let authServiceInstance = null

class AuthService {
  constructor() {
    if (authServiceInstance) {
      return authServiceInstance
    }
    
    this.user = null
    this.session = null
    this.initialized = false
    this.authSubscription = null
    this.onAuthChange = null // Callback for app component
    this.initPromise = null // Prevent concurrent initializations
    
    authServiceInstance = this
  }

  // Initialize auth state
  async initialize() {
    if (this.initialized) {
      console.log('Auth service already initialized')
      return true
    }

    if (this.initPromise) {
      console.log('Auth service initialization in progress, waiting...')
      return this.initPromise
    }

    this.initPromise = this._doInitialize()
    return this.initPromise
  }

  async _doInitialize() {
    try {
      console.log('Initializing auth service...')
      
      // Check for existing session first
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return false
      }

      this.session = session
      this.user = session?.user || null
      this.initialized = true

      console.log('Auth service initialized:', {
        hasSession: !!session,
        hasUser: !!this.user,
        userEmail: this.user?.email
      })

      // Set up auth state listener (only once)
      if (!this.authSubscription) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email || 'no user')
          this.session = session
          this.user = session?.user || null
          
          // Notify app component of auth change
          if (this.onAuthChange) {
            this.onAuthChange(this.user)
          }
          
          if (event === 'SIGNED_IN') {
            await this.onSignIn(session.user)
          } else if (event === 'SIGNED_OUT') {
            this.onSignOut()
          }
        })
        this.authSubscription = subscription
      }

      return true
    } catch (error) {
      console.error('Error initializing auth:', error)
      return false
    }
  }

  // Sign up with email and password
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName || '',
            role: metadata.role || 'student',
            grade_level: metadata.gradeLevel || ''
          }
        }
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: 'Account created successfully! Please check your email to verify your account.'
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        user: data.user,
        session: data.session
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        throw error
      }

      console.log('Google OAuth initiated successfully')
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Sign out error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.'
      }
    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Password updated successfully!'
      }
    } catch (error) {
      console.error('Update password error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get current user
  getCurrentUser() {
    return this.user
  }

  // Get current session
  getCurrentSession() {
    return this.session
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.user
  }

  // Get user profile
  async getUserProfile() {
    if (!this.user) return null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Update user profile
  async updateUserProfile(updates) {
    if (!this.user) return { success: false, error: 'Not authenticated' }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.user.id)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Profile updated successfully!'
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Handle sign in actions
  async onSignIn(user) {
    try {
      // 使用upsert保证无论有无profile都能同步
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          role: user.user_metadata?.role || 'student',
          grade_level: user.user_metadata?.grade_level || '',
          avatar_url: user.user_metadata?.avatar_url || ''
        }, { onConflict: ['id'] })

      if (upsertError) {
        console.error('Error upserting profile:', upsertError)
      }

      // Create default user preferences if they don't exist
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (prefError && prefError.code === 'PGRST116') {
        const { error: createPrefError } = await supabase
          .from('user_preferences')
          .insert([{
            user_id: user.id,
            preferred_language: 'zh',
            difficulty_preference: 'intermediate',
            favorite_topics: []
          }])

        if (createPrefError) {
          console.error('Error creating preferences:', createPrefError)
        }
      }

    } catch (error) {
      console.error('Error in onSignIn:', error)
    }
  }

  // Handle sign out actions
  onSignOut() {
    this.user = null
    this.session = null
    // Clear any cached data
    localStorage.removeItem('supabase.auth.token')
    console.log('User signed out successfully')
  }

  // Get auth headers for API calls
  getAuthHeaders() {
    if (!this.session?.access_token) {
      return {}
    }

    return {
      'Authorization': `Bearer ${this.session.access_token}`
    }
  }

  // Manual session check for debugging
  async checkSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('Manual session check:', {
        session,
        error,
        hasUser: !!session?.user,
        userEmail: session?.user?.email
      })
      return { session, error }
    } catch (error) {
      console.error('Error checking session:', error)
      return { session: null, error }
    }
  }

  // Force refresh session
  async refreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      console.log('Session refresh result:', { session, error })
      
      if (session?.user) {
        this.session = session
        this.user = session.user
        if (this.onAuthChange) {
          this.onAuthChange(this.user)
        }
      }
      
      return { session, error }
    } catch (error) {
      console.error('Error refreshing session:', error)
      return { session: null, error }
    }
  }
}

export default new AuthService()