const profile = {
  name: "胡惠哲",
  role: "数字经济专业学生",
  email: "355343413@qq.com",
  phone: "18989879608",
  website: window.location.href,
};

const themeButton = document.querySelector(".theme-toggle");
const preferredTheme = localStorage.getItem("theme");

if (preferredTheme === "dark") document.body.classList.add("dark");

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const toast = document.querySelector(".toast");
document.querySelectorAll(".contact-copy").forEach((button) => {
  button.addEventListener("click", async (event) => {
    const target = event.currentTarget;
    await navigator.clipboard.writeText(target.dataset.copy);
    toast.textContent = `${target.dataset.label}已复制`;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1800);
  });
});

document.querySelector("#download-vcard").addEventListener("click", () => {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.name}`,
    `TITLE:${profile.role}`,
    `EMAIL:${profile.email}`,
    profile.phone ? `TEL:${profile.phone}` : "",
    `URL:${profile.website}`,
    "END:VCARD",
  ].filter(Boolean).join("\n");

  const file = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = `${profile.name}-数字名片.vcf`;
  link.click();
  URL.revokeObjectURL(link.href);
});

const tiltCard = document.querySelector("[data-tilt]");
if (window.matchMedia("(pointer: fine)").matches) {
  tiltCard.addEventListener("pointermove", (event) => {
    const bounds = tiltCard.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    tiltCard.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  tiltCard.addEventListener("pointerleave", () => {
    tiltCard.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
  });
}
