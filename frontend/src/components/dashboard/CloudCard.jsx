const user = JSON.parse(localStorage.getItem("user"));

const handleConnect = () => {
  if (!user?._id) {
    alert("User not logged in");
    return;
  }

  window.location.href =
    `http://localhost:5000/api/google/connect?userId=${user._id}`;
};
