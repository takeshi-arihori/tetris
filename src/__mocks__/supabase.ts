// Supabaseクライアントのモック

export const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    abortSignal: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
    csv: jest.fn(() => Promise.resolve({ data: '', error: null })),
    geojson: jest.fn(() => Promise.resolve({ data: null, error: null })),
    explain: jest.fn(() => Promise.resolve({ data: null, error: null })),
    rollback: jest.fn(() => Promise.resolve({ data: null, error: null })),
    returns: jest.fn().mockReturnThis(),
    then: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),

  auth: {
    getUser: jest.fn(() => Promise.resolve({ 
      data: { user: null }, 
      error: null 
    })),
    getSession: jest.fn(() => Promise.resolve({ 
      data: { session: null }, 
      error: null 
    })),
    signUp: jest.fn(() => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: null 
    })),
    signInWithPassword: jest.fn(() => Promise.resolve({ 
      data: { user: null, session: null }, 
      error: null 
    })),
    signInWithOAuth: jest.fn(() => Promise.resolve({ 
      data: { provider: 'github', url: 'https://example.com' }, 
      error: null 
    })),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    resetPasswordForEmail: jest.fn(() => Promise.resolve({ 
      data: {}, 
      error: null 
    })),
    updateUser: jest.fn(() => Promise.resolve({ 
      data: { user: null }, 
      error: null 
    })),
    setSession: jest.fn(() => Promise.resolve({ 
      data: { session: null }, 
      error: null 
    })),
    refreshSession: jest.fn(() => Promise.resolve({ 
      data: { session: null }, 
      error: null 
    })),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: {} },
      unsubscribe: jest.fn(),
    })),
    admin: {
      deleteUser: jest.fn(() => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      })),
      createUser: jest.fn(() => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      })),
      updateUserById: jest.fn(() => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      })),
      listUsers: jest.fn(() => Promise.resolve({ 
        data: { users: [] }, 
        error: null 
      })),
    },
  },

  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ 
        data: { path: 'test-path' }, 
        error: null 
      })),
      download: jest.fn(() => Promise.resolve({ 
        data: new Blob(), 
        error: null 
      })),
      remove: jest.fn(() => Promise.resolve({ 
        data: [], 
        error: null 
      })),
      list: jest.fn(() => Promise.resolve({ 
        data: [], 
        error: null 
      })),
      update: jest.fn(() => Promise.resolve({ 
        data: { path: 'test-path' }, 
        error: null 
      })),
      move: jest.fn(() => Promise.resolve({ 
        data: { message: 'Successfully moved' }, 
        error: null 
      })),
      copy: jest.fn(() => Promise.resolve({ 
        data: { path: 'test-path' }, 
        error: null 
      })),
      createSignedUrl: jest.fn(() => Promise.resolve({ 
        data: { signedUrl: 'https://example.com/signed-url' }, 
        error: null 
      })),
      createSignedUrls: jest.fn(() => Promise.resolve({ 
        data: [], 
        error: null 
      })),
      getPublicUrl: jest.fn(() => ({ 
        data: { publicUrl: 'https://example.com/public-url' } 
      })),
    })),
  },

  realtime: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(() => Promise.resolve()),
      unsubscribe: jest.fn(() => Promise.resolve()),
      send: jest.fn(() => Promise.resolve()),
    })),
    removeChannel: jest.fn(),
    removeAllChannels: jest.fn(),
    getChannels: jest.fn(() => []),
  },

  functions: {
    invoke: jest.fn(() => Promise.resolve({ 
      data: null, 
      error: null 
    })),
  },
}

export const supabase = mockSupabaseClient

export default mockSupabaseClient