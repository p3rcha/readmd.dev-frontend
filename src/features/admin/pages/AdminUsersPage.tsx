import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { usersApi, type CreateUserInput, type UpdateUserInput } from '../../../api/users';
import { GlassCard, Button, Input } from '../../../components/ui';
import type { User } from '../../../types/user';
import { useAuth } from '../../auth/hooks/useAuth';

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  
  // Create form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Edit form fields
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  
  // Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: usersApi.getAllUsers,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.createUser(input),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowCreateForm(false);
      resetCreateForm();
      setSuccess(`User "${newUser.email}" created successfully!`);
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err: unknown) => {
      setError(extractErrorMessage(err, 'Failed to create user'));
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateUserInput }) =>
      usersApi.updateUser(userId, input),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setEditingUser(null);
      setSuccess(`User "${updatedUser.email}" updated successfully!`);
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err: unknown) => {
      setError(extractErrorMessage(err, 'Failed to update user'));
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => usersApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      const deletedEmail = deletingUser?.email;
      setDeletingUser(null);
      setSuccess(`User "${deletedEmail}" deleted successfully!`);
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err: unknown) => {
      setError(extractErrorMessage(err, 'Failed to delete user'));
    },
  });

  // Toggle admin mutation
  const toggleAdminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      usersApi.toggleAdmin(userId, isAdmin),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setSuccess(`${updatedUser.email} is now ${updatedUser.isAdmin ? 'an admin' : 'a regular user'}!`);
      setTimeout(() => setSuccess(''), 5000);
    },
    onError: (err: unknown) => {
      setError(extractErrorMessage(err, 'Failed to toggle admin status'));
    },
  });

  const extractErrorMessage = (err: unknown, defaultMessage: string): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: { error?: string; message?: string } } };
      if (axiosError.response?.data?.error) {
        return axiosError.response.data.error;
      } else if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
      }
    }
    return defaultMessage;
  };

  const resetCreateForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setIsAdmin(false);
    setError('');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    await createUserMutation.mutateAsync({
      email,
      password,
      name: name || undefined,
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditName(user.name || '');
    setEditPassword('');
    setEditIsAdmin(user.isAdmin);
    setError('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError('');

    if (editPassword && editPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const input: UpdateUserInput = {};
    if (editEmail !== editingUser.email) input.email = editEmail;
    if (editName !== (editingUser.name || '')) input.name = editName || null;
    if (editPassword) input.password = editPassword;
    if (editIsAdmin !== editingUser.isAdmin) input.isAdmin = editIsAdmin;

    if (Object.keys(input).length === 0) {
      setError('No changes to save');
      return;
    }

    await updateUserMutation.mutateAsync({ userId: editingUser.id, input });
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    await deleteUserMutation.mutateAsync(deletingUser.id);
  };

  const handleToggleAdmin = async (user: User) => {
    await toggleAdminMutation.mutateAsync({ userId: user.id, isAdmin: !user.isAdmin });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
              User <span className="gradient-text">Management</span>
            </h1>
            <p className="text-[var(--text-tertiary)]">
              Create, edit, and manage user accounts
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              if (!showCreateForm) resetCreateForm();
            }}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Create User
          </Button>
        </div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <GlassCard className="border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[var(--text-primary)]">{success}</p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create User Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-10 overflow-hidden"
          >
            <GlassCard padding="lg">
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
                Create New User
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                  />

                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    helperText="At least 6 characters"
                  />

                  <Input
                    label="Name (optional)"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetCreateForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={createUserMutation.isPending}
                  >
                    Create User
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <GlassCard padding="lg">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
                  Edit User
                </h2>
                <form onSubmit={handleUpdateUser} className="space-y-5">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <Input
                    label="Email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    placeholder="user@example.com"
                  />

                  <Input
                    label="Name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="John Doe"
                  />

                  <Input
                    label="New Password (leave blank to keep current)"
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="••••••••"
                    helperText="At least 6 characters"
                  />

                  {/* Admin Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-tertiary)]/50">
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">Admin Access</p>
                      <p className="text-sm text-[var(--text-tertiary)]">
                        Grant this user admin privileges
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditIsAdmin(!editIsAdmin)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        editIsAdmin ? 'bg-violet-500' : 'bg-[var(--bg-tertiary)]'
                      }`}
                      disabled={editingUser.id === currentUser?.id}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          editIsAdmin ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingUser(null);
                        setError('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={updateUserMutation.isPending}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeletingUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassCard padding="lg">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                    Delete User
                  </h2>
                  <p className="text-[var(--text-tertiary)] mb-6">
                    Are you sure you want to delete <strong className="text-[var(--text-primary)]">{deletingUser.email}</strong>? This will also delete all their files. This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="secondary"
                      onClick={() => setDeletingUser(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleDeleteUser}
                      isLoading={deleteUserMutation.isPending}
                      className="!bg-red-500 hover:!bg-red-600"
                    >
                      Delete User
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users List */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {isLoading ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full"
            />
            <p className="mt-4 text-[var(--text-tertiary)]">Loading users...</p>
          </div>
        ) : users && users.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-[var(--text-tertiary)]">
              {users.length} user{users.length !== 1 ? 's' : ''} total
            </div>
            <div className="space-y-3">
              {users.map((user: User, index: number) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard className="hover:border-violet-500/30 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[var(--text-primary)] truncate">
                            {user.name || 'No name'}
                          </h3>
                          {user.isAdmin && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30 shrink-0">
                              Admin
                            </span>
                          )}
                          {user.id === currentUser?.id && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--text-tertiary)] truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Created Date */}
                      <div className="hidden md:block text-right shrink-0">
                        <p className="text-xs text-[var(--text-muted)]">Joined</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Toggle Admin */}
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => handleToggleAdmin(user)}
                            disabled={toggleAdminMutation.isPending}
                            className={`p-2 rounded-lg transition-colors ${
                              user.isAdmin
                                ? 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-violet-400 hover:bg-violet-500/20'
                            }`}
                            title={user.isAdmin ? 'Remove admin' : 'Make admin'}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="Edit user"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        {/* Delete */}
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Delete user"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <GlassCard padding="xl" className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              No users yet
            </h3>
            <p className="text-[var(--text-tertiary)] mb-8 max-w-sm mx-auto">
              Create your first user account to get started.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowCreateForm(true)}
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Create First User
            </Button>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
}
