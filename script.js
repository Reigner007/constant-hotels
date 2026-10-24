/* ============================================================
   Constant Hotel & Suites — Demo Script
   ============================================================ */

/* ---------- CONFIG — update these when real details arrive ---------- */
const CONFIG = {
  // Replace with the hotel's real WhatsApp number in international format
  // Example: "2348012345678" (no +, no spaces)
  whatsappNumber: "2348000000000",
  whatsappDefaultMessage:
    "Hello Constant Hotel & Suites! I found your website and would like to enquire about a stay.",

  // Social profiles — replace "#" with real URLs
  social: {
    instagram: "#",
    facebook: "#",
    twitter: "#",
  },
};

/* ---------- Helpers ---------- */
const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];

function buildWhatsAppUrl(message) {
  const text = encodeURIComponent(message || CONFIG.whatsappDefaultMessage);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
}

/* ---------- WhatsApp + social links ---------- */
$$(".whatsapp-link").forEach((el) => {
  el.href = buildWhatsAppUrl();
  if (!el.hasAttribute("target")) {
    el.target = "_blank";
    el.rel = "noopener";
  }
});

$$(".phone-link").forEach((el) => {
  if (el.textContent.includes("XXX")) {
    el.href = "#";
    el.title = "Phone number placeholder — update in index.html";
  }
});

/* Matches CTA → WhatsApp with prefilled question */
const matchesCta = $("#matches-cta");
if (matchesCta) {
  matchesCta.href = buildWhatsAppUrl(
    "Hello Constant Hotel & Suites! Are there any upcoming football matches being shown at the bar?"
  );
  matchesCta.target = "_blank";
  matchesCta.rel = "noopener";
}

/* Menu CTA → WhatsApp with prefilled question */
const menuCta = $("#menu-cta");
if (menuCta) {
  menuCta.href = buildWhatsAppUrl(
    "Hello Constant Hotel & Suites! Do you currently serve ukwa, ofe onugbu, catfish pepper soup or other local dishes? Please share today's menu."
  );
  menuCta.target = "_blank";
  menuCta.rel = "noopener";
}

/* ---------- Sticky header ---------- */
const header = $("#site-header");
const onScrollHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
};
window.addEventListener("scroll", onScrollHeader, { passive: true });
onScrollHeader();

/* ---------- Mobile navigation ---------- */
const navToggle = $("#nav-toggle");
const siteNav = $("#site-nav");

function setNav(open) {
  document.body.classList.toggle("nav-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

navToggle.addEventListener("click", () => {
  setNav(!document.body.classList.contains("nav-open"));
});

$$(".nav-list a, .nav-cta", siteNav).forEach((link) => {
  link.addEventListener("click", () => setNav(false));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
    setNav(false);
    navToggle.focus();
  }
});

document.addEventListener("click", (e) => {
  if (
    document.body.classList.contains("nav-open") &&
    !siteNav.contains(e.target) &&
    !navToggle.contains(e.target)
  ) {
    setNav(false);
  }
});

/* ---------- Active nav link on scroll ---------- */
const sectionIds = [
  "about",
  "rooms",
  "bar",
  "kitchen",
  "december",
  "amenities",
  "gallery",
  "contact",
];
const navLinks = $$(".nav-list a");

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${id}`)
      );
    });
  },
  { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
);

sectionIds.forEach((id) => {
  const el = document.getElementById(id);
  if (el) spy.observe(el);
});

/* ---------- Reveal on scroll ---------- */
const revealEls = $$(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 3, 3) * 90}ms`;
    revealObserver.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add("visible"));
}

/* ---------- Room enquiry shortcuts ---------- */
$$("[data-room]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const room = btn.getAttribute("data-room");
    const topic = $("#cf-topic");
    const message = $("#cf-message");
    if (topic) topic.value = "Room Enquiry";
    if (message && !message.value.trim()) {
      message.value = `I would like to enquire about the ${room}.`;
    }
  });
});

$$("[data-topic]").forEach((el) => {
  el.addEventListener("click", () => {
    const topic = el.getAttribute("data-topic");
    const select = $("#cf-topic");
    if (select) {
      const match = [...select.options].find((o) => o.text === topic);
      if (match) select.value = match.value || match.text;
    }
  });
});

/* ---------- Date defaults + validation helpers ---------- */
function toISODate(d) {
  return d.toISOString().split("T")[0];
}

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

$$('input[type="date"]').forEach((input) => {
  input.min = toISODate(today);
});

/* Keep check-out after check-in */
function linkDates(checkinEl, checkoutEl) {
  if (!checkinEl || !checkoutEl) return;
  checkinEl.addEventListener("change", () => {
    if (!checkinEl.value) return;
    const next = new Date(checkinEl.value);
    next.setDate(next.getDate() + 1);
    checkoutEl.min = toISODate(next);
    if (checkoutEl.value && checkoutEl.value <= checkinEl.value) {
      checkoutEl.value = toISODate(next);
    }
  });
}
linkDates($("#book-checkin"), $("#book-checkout"));
linkDates($("#cf-checkin"), $("#cf-checkout"));

/* ---------- Booking bar → contact form ---------- */
const bookingForm = $("#booking-form");
if (bookingForm) {
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const checkin = $("#book-checkin").value;
    const checkout = $("#book-checkout").value;
    const guests = $("#book-guests").value;

    if (!checkin || !checkout) {
      alert("Please select both check-in and check-out dates.");
      return;
    }
    if (checkout <= checkin) {
      alert("Check-out date must be after check-in date.");
      return;
    }

    $("#cf-checkin").value = checkin;
    $("#cf-checkout").value = checkout;
    $("#cf-topic").value = "Room Enquiry";
    const msg = $("#cf-message");
    msg.value = `Room enquiry: ${guests} guest(s), checking in ${checkin} and out ${checkout}.`;

    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => $("#cf-name").focus(), 700);
  });
}

/* ---------- Contact form (demo validation only) ---------- */
const contactForm = $("#contact-form");
const formSuccess = $("#form-success");

function showError(input, message) {
  input.classList.add("invalid");
  const err = input.closest(".field")?.querySelector(".field-error");
  if (err) err.textContent = message;
}

function clearError(input) {
  input.classList.remove("invalid");
  const err = input.closest(".field")?.querySelector(".field-error");
  if (err) err.textContent = "";
}

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = $("#cf-name");
    const phone = $("#cf-phone");
    const email = $("#cf-email");
    const message = $("#cf-message");
    let valid = true;

    [name, phone, email, message].forEach(clearError);

    if (!name.value.trim()) {
      showError(name, "Please enter your name.");
      valid = false;
    }
    if (!phone.value.trim()) {
      showError(phone, "Please enter a phone number.");
      valid = false;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailOk) {
      showError(email, "Please enter a valid email address.");
      valid = false;
    }
    if (!message.value.trim()) {
      showError(message, "Please tell us how we can help.");
      valid = false;
    }

    if (!valid) {
      contactForm.querySelector(".invalid")?.focus();
      return;
    }

    // Demo only — no backend. Offer WhatsApp as the real channel.
    const waMessage = [
      `Hello Constant Hotel & Suites!`,
      `Name: ${name.value.trim()}`,
      `Phone: ${phone.value.trim()}`,
      `Email: ${email.value.trim()}`,
      `Enquiry: ${$("#cf-topic").value}`,
      $("#cf-checkin").value ? `Check-in: ${$("#cf-checkin").value}` : "",
      $("#cf-checkout").value ? `Check-out: ${$("#cf-checkout").value}` : "",
      `Message: ${message.value.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");

    const waUrl = buildWhatsAppUrl(waMessage);
    $$(".whatsapp-link", formSuccess).forEach((a) => {
      a.href = waUrl;
    });

    // Send via WhatsApp — opens the chat with the enquiry prefilled
    window.open(waUrl, "_blank", "noopener");

    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const sendBtn = contactForm.querySelector('button[type="submit"]');
    if (sendBtn) {
      sendBtn.textContent = "Sent ✓";
      sendBtn.disabled = true;
      setTimeout(() => {
        sendBtn.textContent = "Send Enquiry";
        sendBtn.disabled = false;
      }, 4000);
    }
  });

  $$("#contact-form input, #contact-form textarea").forEach((input) => {
    input.addEventListener("input", () => clearError(input));
  });
}

/* ---------- Gallery lightbox ---------- */
const lightbox = $("#lightbox");
const lightboxImg = $("#lightbox-img");
const lightboxCaption = $("#lightbox-caption");
const galleryItems = $$(".gallery-item");
let lightboxIndex = 0;
let lastFocused = null;

function openLightbox(index) {
  lightboxIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[lightboxIndex];
  const img = $("img", item);
  const cap = $("figcaption", item);

  lightboxImg.src = img.src.replace(/w=\d+/, "w=1600");
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = cap ? cap.textContent : "";

  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add("open"));
  document.body.style.overflow = "hidden";
  $("#lightbox-close").focus();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
  setTimeout(() => {
    lightbox.hidden = true;
    lightboxImg.src = "";
  }, 280);
  if (lastFocused) lastFocused.focus();
}

galleryItems.forEach((item, i) => {
  item.addEventListener("click", () => {
    lastFocused = item;
    openLightbox(i);
  });
  item.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      lastFocused = item;
      openLightbox(i);
    }
  });
});

$("#lightbox-close").addEventListener("click", closeLightbox);
$("#lightbox-prev").addEventListener("click", () => openLightbox(lightboxIndex - 1));
$("#lightbox-next").addEventListener("click", () => openLightbox(lightboxIndex + 1));

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") openLightbox(lightboxIndex - 1);
  if (e.key === "ArrowRight") openLightbox(lightboxIndex + 1);
});

/* ---------- Footer year ---------- */
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
