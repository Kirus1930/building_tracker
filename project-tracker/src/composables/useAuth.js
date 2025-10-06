import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabase';

const user = ref(null);
const profile = ref(null);
const session = ref(null);
const loading = ref(true);

async function initAuth() {
  try {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    session.value = currentSession;
    user.value = currentSession?.user ?? null;

    if (user.value) {
      await loadProfile();
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
  } finally {
    loading.value = false;
  }
}

async function loadProfile() {
  if (!user.value) return;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.value.id)
    .maybeSingle();

  if (error) {
    console.error('Error loading profile:', error);
  } else {
    profile.value = data;
  }
}

supabase.auth.onAuthStateChange((event, currentSession) => {
  (async () => {
    session.value = currentSession;
    user.value = currentSession?.user ?? null;

    if (user.value) {
      await loadProfile();
    } else {
      profile.value = null;
    }
  })();
});

async function signUp({ email, password, fullName, role = 'engineer' }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullName,
        role: role,
      });

    if (profileError) throw profileError;
  }

  return data;
}

async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  user.value = null;
  profile.value = null;
  session.value = null;
}

async function updateProfile(updates) {
  if (!user.value) throw new Error('No user logged in');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.value.id)
    .select()
    .single();

  if (error) throw error;

  profile.value = data;
  return data;
}

const isAuthenticated = computed(() => !!user.value);
const userRole = computed(() => profile.value?.role);
const isManager = computed(() => userRole.value === 'manager');
const isEngineer = computed(() => userRole.value === 'engineer');
const isObserver = computed(() => userRole.value === 'observer');

export function useAuth() {
  return {
    user,
    profile,
    session,
    loading,
    isAuthenticated,
    userRole,
    isManager,
    isEngineer,
    isObserver,
    initAuth,
    signUp,
    signIn,
    signOut,
    updateProfile,
    loadProfile,
  };
}
