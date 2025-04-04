// Add proper error handling in your auth provider
const checkAuth = async () => {
  setLoading(true);
  try {
    const response = await authAPI.getProfile();
    setUser(response.data);
    setAuthenticated(true);
  } catch (error) {
    // Clear any stale auth state
    setUser(null);
    setAuthenticated(false);
    // Don't redirect here - let the API interceptor handle it
  } finally {
    setLoading(false);
  }
};