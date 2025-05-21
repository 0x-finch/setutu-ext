export function toast(message: string) {
  // Remove any existing toast
  const existing = document.querySelector(".setutu-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "setutu-toast";
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    top: "32px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#222",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    zIndex: "99999",
    fontSize: "16px",
    opacity: "0",
    transition: "opacity 0.3s",
  });
  document.body.appendChild(toast);
  // Fade in
  setTimeout(() => (toast.style.opacity = "1"), 10);
  // Remove after 2 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}
