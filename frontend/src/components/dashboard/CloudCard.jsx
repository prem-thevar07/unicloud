const user = JSON.parse(localStorage.getItem("user"));


const handleConnect = () => {
  if (!user?._id) {
    alert("User not logged in");
    return;
  }

 window.location.href =
  `${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/api/google/connect?userId=${userId}`;

};
