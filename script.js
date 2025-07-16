window.addEventListener("load", function () {
  const loader = document.getElementById("loader");
  loader.style.display = "none";
});


const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, {
  threshold: 0.2
});

document.querySelectorAll(".section, .card").forEach((el) => {
  observer.observe(el);
});

const toggleBtn = document.createElement("button");
toggleBtn.id = "darkToggle";
toggleBtn.innerText = "🌙";
toggleBtn.style.position = "fixed";
toggleBtn.style.top = "20px";
toggleBtn.style.right = "20px";
toggleBtn.style.padding = "10px";
toggleBtn.style.border = "none";
toggleBtn.style.borderRadius = "50%";
toggleBtn.style.background = "#eee";
toggleBtn.style.cursor = "pointer";
document.body.appendChild(toggleBtn);

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});