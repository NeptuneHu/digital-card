"use strict";

/* ================================================================
   Galaxy Canvas Animation
   - requestAnimationFrame 驱动逐帧渲染
   - 高分屏像素适配与星点数量控制
   - 鼠标靠近时产生青色辉光和连线
   - 页面不可见或用户偏好低动态时自动节能
   ================================================================ */

const canvas = document.querySelector("#galaxy");
const context = canvas?.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let stars = [];
let animationFrameId = 0;
let resizeFrameId = 0;
let lastTimestamp = 0;
let pointer = { x: -1000, y: -1000 };

const STAR_COLOR = "210, 220, 255";
const GLOW_COLOR = "89, 239, 255";
const INTERACTION_RADIUS = 140;

function createStar(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.25 + 0.2,
    phase: Math.random() * Math.PI * 2,
    twinkleSpeed: Math.random() * 1.4 + 0.35,
    driftSpeed: Math.random() * 5 + 2,
  };
}

function resizeGalaxy() {
  if (!canvas || !context) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // 画布按设备像素比放大，绘制坐标仍使用 CSS 像素。
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const starCount = Math.min(280, Math.max(90, Math.floor(width / 5)));
  stars = Array.from({ length: starCount }, () => createStar(width, height));
}

function drawStar(star, elapsedSeconds) {
  if (!context) return;

  // 正弦函数让每颗星按不同相位闪烁。
  star.phase += star.twinkleSpeed * elapsedSeconds;
  star.y += star.driftSpeed * elapsedSeconds;
  if (star.y > window.innerHeight + 4) star.y = -4;

  const distance = Math.hypot(star.x - pointer.x, star.y - pointer.y);
  const glow = Math.max(0, 1 - distance / INTERACTION_RADIUS);
  const opacity = Math.min(1, 0.35 + Math.sin(star.phase) * 0.2 + glow * 0.55);
  const radius = star.radius + glow * 2.2;
  const color = glow > 0 ? GLOW_COLOR : STAR_COLOR;

  // radialGradient 生成由亮到透明的柔和星芒滤镜效果。
  const halo = context.createRadialGradient(
    star.x,
    star.y,
    0,
    star.x,
    star.y,
    radius * 3.5,
  );
  halo.addColorStop(0, `rgba(${color}, ${opacity})`);
  halo.addColorStop(0.25, `rgba(${color}, ${opacity * 0.5})`);
  halo.addColorStop(1, `rgba(${color}, 0)`);

  context.beginPath();
  context.fillStyle = halo;
  context.arc(star.x, star.y, radius * 3.5, 0, Math.PI * 2);
  context.fill();

  // 鼠标附近的星点与指针之间形成能量连线。
  if (glow > 0.22) {
    context.beginPath();
    context.strokeStyle = `rgba(${GLOW_COLOR}, ${glow * 0.18})`;
    context.lineWidth = 0.7;
    context.moveTo(star.x, star.y);
    context.lineTo(pointer.x, pointer.y);
    context.stroke();
  }
}

function animate(timestamp = performance.now()) {
  if (!canvas || !context) return;

  // 限制单帧时间，避免切回页面时星点突然大幅跳动。
  const elapsedSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const star of stars) drawStar(star, elapsedSeconds);

  animationFrameId = window.requestAnimationFrame(animate);
}

function startAnimation() {
  if (animationFrameId || document.hidden || reducedMotion.matches) return;
  lastTimestamp = performance.now();
  animationFrameId = window.requestAnimationFrame(animate);
}

function stopAnimation() {
  window.cancelAnimationFrame(animationFrameId);
  animationFrameId = 0;
}

function renderStaticFrame() {
  if (!context) return;
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  for (const star of stars) drawStar(star, 0);
}

function handleMotionPreference() {
  stopAnimation();
  if (reducedMotion.matches) renderStaticFrame();
  else startAnimation();
}

if (canvas && context) {
  resizeGalaxy();
  handleMotionPreference();

  window.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY };
  });

  window.addEventListener("pointerleave", () => {
    pointer = { x: -1000, y: -1000 };
  });

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrameId);
    resizeFrameId = window.requestAnimationFrame(resizeGalaxy);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAnimation();
    else handleMotionPreference();
  });

  reducedMotion.addEventListener?.("change", handleMotionPreference);
}

/* 元素进入视口时渐显；旧浏览器使用直接显示的降级方案。 */
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12 },
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

/* 复制邮箱：优先使用 Clipboard API，失败时提供兼容性降级。 */
const toast = document.querySelector(".toast");
let toastTimerId = 0;

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimerId);
  toastTimerId = window.setTimeout(() => toast.classList.remove("show"), 1600);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
}

document.querySelectorAll(".copy").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.dataset.copy;
    if (!text) return;

    try {
      await copyText(text);
      showToast("邮箱已复制");
    } catch {
      showToast("复制失败，请手动复制");
    }
  });
});
