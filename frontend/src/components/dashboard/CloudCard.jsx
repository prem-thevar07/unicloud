

const handleConnect = () => {
  const backendBaseUrl =
    import.meta.env.VITE_API_BASE_URL.replace("/api", "");

  window.location.href = `${backendBaseUrl}/api/auth/google`;
};
