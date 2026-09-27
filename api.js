/**
 * api.js — Shared API client for all frontend pages.
 * All calls go to http://localhost:3001/api
 */

// In production the frontend is served by the same Express server,
// so we use a relative path. In local dev (file://) we fall back to localhost.
const API_BASE = (window.location.protocol === "file:")
  ? "http://localhost:3001/api"
  : "/api";

// ── Token helpers ──────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("choko_token");
}

function setToken(token) {
  localStorage.setItem("choko_token", token);
}

function clearToken() {
  localStorage.removeItem("choko_token");
  localStorage.removeItem("choko_user");
}

function setUser(user) {
  localStorage.setItem("choko_user", JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("choko_user")) || null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!getToken();
}

// ── Base fetch wrapper ─────────────────────────────────────────────────────
async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

// ── Auth ───────────────────────────────────────────────────────────────────
async function register(username, email, password) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password })
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

async function login(email, password) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

function logout() {
  clearToken();
  window.location.href = "login.html";
}

// ── Profile ────────────────────────────────────────────────────────────────
async function getProfile() {
  return apiRequest("/profile");
}

async function updateProfile(fields) {
  return apiRequest("/profile", {
    method: "PUT",
    body: JSON.stringify(fields)
  });
}

async function changePassword(currentPassword, newPassword) {
  return apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

// ── Products ───────────────────────────────────────────────────────────────
async function getProducts(channel) {
  const qs = channel ? `?channel=${encodeURIComponent(channel)}` : "";
  return apiRequest(`/products${qs}`);
}

// ── Orders ────────────────────────────────────────────────────────────────
async function placeOrder(orderData) {
  return apiRequest("/orders", {
    method: "POST",
    body: JSON.stringify(orderData)
  });
}

async function getMyOrders() {
  return apiRequest("/orders/my");
}

// ── Guestbook ─────────────────────────────────────────────────────────────
async function getGuestbook() {
  return apiRequest("/guestbook");
}

async function postGuestbookMessage(name, message) {
  return apiRequest("/guestbook", {
    method: "POST",
    body: JSON.stringify({ name, message })
  });
}

// ── Blog ──────────────────────────────────────────────────────────────────
async function getBlogPosts() {
  return apiRequest("/blog");
}

async function getBlogPost(slug) {
  return apiRequest(`/blog/${encodeURIComponent(slug)}`);
}

// ── Nav bar: show/hide Login vs Profile link ───────────────────────────────
function updateNav() {
  const loginLink  = document.getElementById("nav-login-link");
  const profileLink = document.getElementById("nav-profile-link");
  if (isLoggedIn()) {
    if (loginLink)   loginLink.style.display   = "none";
    if (profileLink) profileLink.style.display = "inline-block";
  } else {
    if (loginLink)   loginLink.style.display   = "inline-block";
    if (profileLink) profileLink.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", updateNav);
