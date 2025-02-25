import { createClient } from '@supabase/supabase-js'

// Mock storage object for file operations
const mockStorage = {
  files: new Map(),
  buckets: ['user_documents', 'resumes', 'profile_images'],
  from: function(bucket) {
    return {
      upload: jest.fn().mockImplementation((path, file) => {
        this.files.set(`${bucket}/${path}`, file)
        return { error: null, data: { path } }
      }),
      list: jest.fn().mockResolvedValue({
        data: Array.from(this.files.keys())
          .filter(key => key.startsWith(bucket))
          .map(key => ({ name: key.split('/').pop() })),
        error: null
      }),
      remove: jest.fn().mockImplementation((paths) => {
        paths.forEach(path => this.files.delete(`${bucket}/${path}`))
        return { error: null }
      }),
      getPublicUrl: jest.fn().mockImplementation((path) => ({
        data: { publicUrl: `https://mock-storage.com/${bucket}/${path}` },
        error: null
      }))
    }
  },
  listBuckets: jest.fn().mockResolvedValue({
    data: this.buckets.map(name => ({ name })),
    error: null
  })
}

// Mock auth object for authentication operations
const mockAuth = {
  user: null,
  session: null,
  signUp: jest.fn(),
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
  onAuthStateChange: jest.fn(),
  setSession: function(session) {
    this.session = session
    this.user = session?.user
  }
}

// Mock database operations
const mockDatabase = {
  data: new Map(),
  from: function(table) {
    return {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockImplementation((data) => {
        const tableData = this.data.get(table) || []
        tableData.push(...data)
        this.data.set(table, tableData)
        return { data, error: null }
      }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        const tableData = this.data.get(table)
        return { data: tableData?.[0], error: null }
      })
    }
  },
  clearData: function() {
    this.data.clear()
  }
}

// Create mock Supabase client
export const createMockSupabaseClient = () => {
  return {
    auth: mockAuth,
    storage: mockStorage,
    from: mockDatabase.from.bind(mockDatabase),
    _database: mockDatabase, // Exposed for test manipulation
    _resetMocks: function() {
      mockStorage.files.clear()
      mockDatabase.clearData()
      mockAuth.user = null
      mockAuth.session = null
      jest.clearAllMocks()
    }
  }
}

// Helper function to setup mock auth session
export const setupMockSession = (client, userData) => {
  const session = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      ...userData
    },
    access_token: 'mock-token'
  }
  client.auth.setSession(session)
  client.auth.getSession.mockResolvedValue({ data: { session } })
  return session
}

// Helper function to setup mock skills data
export const setupMockSkills = (client, skills) => {
  client._database.data.set('skills', skills)
}

// Helper function to setup mock profile data
export const setupMockProfile = (client, profile) => {
  client._database.data.set('profiles', [profile])
}