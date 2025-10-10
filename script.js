// Navigation functionality - removed showPage function as it's not needed for multi-page navigation

import { WEBSITE_CONSTANTS, DOMAIN } from "./js/config.js";


function resetPopupForm() {
  const form = document.getElementById("interest-form");
  const status = document.getElementById("form-status");
  if (form) form.reset();
  if (status) status.textContent = "";
}


function initNavHandlers() {
  const toggle = document.querySelector(".mobile-menu-toggle");
  if (toggle) {
    // Remove existing event listeners to prevent duplicates
    toggle.removeEventListener("click", toggleClickHandler);
    toggle.addEventListener("click", toggleClickHandler);
  }

  // Set active nav item based on URL path
  const path = location.pathname.replace(/\/index\.html?$/, "/");
  document.querySelectorAll('.nav-menu .nav-item').forEach((a) => {
    try {
      const href = a.getAttribute('href') || '';
      // Exact match for root, startsWith for section pages
      const isActive = (href === '/' && path === '/') || (href !== '/' && path.startsWith(href));
      a.classList.toggle('active', !!isActive);
    } catch (_) { }
  });

  // Remove existing event listeners to prevent duplicates
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.removeEventListener("click", navItemClickHandler);
    item.addEventListener("click", navItemClickHandler);
  });
}

// Separate handler functions to prevent duplicate event listeners
function toggleClickHandler() {
  const menu = document.querySelector(".nav-menu");
  if (menu) menu.classList.toggle("active");
}

function navItemClickHandler(event) {
  // Close mobile menu if open
  document.querySelector(".nav-menu").classList.remove("active");
  // Let the default link behavior handle navigation
}

// Navigation click handlers

// Carousel functionality
const carouselState = {
  slides: [],
  dots: [],
  currentSlide: 0,
  intervalId: null,
};

function showSlide(index) {
  if (!carouselState.slides.length) return;
  const total = carouselState.slides.length;
  const next = ((index % total) + total) % total;
  // Hide all
  carouselState.slides.forEach((s) => s.classList.remove("active"));
  carouselState.dots.forEach((d) => d.classList.remove("active"));
  // Show selected
  carouselState.slides[next].classList.add("active");
  if (carouselState.dots[next]) carouselState.dots[next].classList.add("active");
  carouselState.currentSlide = next;
}

function initCarousel() {
  carouselState.slides = Array.from(document.querySelectorAll(".carousel-slide"));
  carouselState.dots = Array.from(document.querySelectorAll(".carousel-dot"));
  if (!carouselState.slides.length) {
    // No carousel on this page
    if (carouselState.intervalId) {
      clearInterval(carouselState.intervalId);
      carouselState.intervalId = null;
    }
    return;
  }

  // Ensure first slide is active
  showSlide(0);

  // Wire up dot clicks (works even if inline onclick exists)
  carouselState.dots.forEach((dot, i) => {
    dot.addEventListener("click", () => showSlide(i));
  });

  // (Re)start auto-rotate
  if (carouselState.intervalId) clearInterval(carouselState.intervalId);
  carouselState.intervalId = setInterval(() => {
    showSlide(carouselState.currentSlide + 1);
  }, 5000);
}

// Smooth scrolling for CTA button
document.addEventListener("DOMContentLoaded", function () {
  // HTML partial include loader
  const includeTargets = document.querySelectorAll('[data-include]');
  if (includeTargets.length > 0) {
    const loads = Array.from(includeTargets).map(async (el) => {
      const src = el.getAttribute('data-include');
      try {
        const res = await fetch(src, { cache: 'no-cache' });
        const html = await res.text();
        el.outerHTML = html;
      } catch (e) {
        console.error('Failed to include', src, e);
      }
    });

    Promise.all(loads).then(() => {
      // re-init features that rely on included markup
      initNavHandlers();
      initScrollObserver();
      initCarousel();
    });
  } else {
    // If no includes, still init
    initNavHandlers();
    initScrollObserver();
    initCarousel();
  }

  // Add scroll-to-top functionality
  function initHeaderScroll() {
    window.addEventListener("scroll", function () {
      const header = document.querySelector(".header");
      if (!header) return;
      if (window.scrollY > 100) {
        header.style.backgroundColor = "rgba(44, 62, 80, 0.95)";
      } else {
        header.style.backgroundColor = "";
      }
    });
  }
  initHeaderScroll();

  // Add animation to cards on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  function initScrollObserver() {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animation = "fadeInUp 0.6s ease forwards";
        }
      });
    }, observerOptions);

    document.querySelectorAll(".card").forEach((card) => {
      observer.observe(card);
    });
  }
});

// Form validation and interaction
function enrollNow(program) {
  alert(
    `Enrolling in ${program} program! Redirecting to enrollment form...`
  );
  // Here you would typically redirect to an enrollment form or payment page
}

// SEO and Analytics helper functions
function trackEvent(action, category, label) {
  // Google Analytics tracking would go here
  console.log(
    `Event tracked: ${action} in ${category} with label: ${label}`
  );
}

// Add click tracking to important buttons
document.querySelectorAll(".cta-button, .card").forEach((element) => {
  element.addEventListener("click", function () {
    const action = this.classList.contains("cta-button")
      ? "CTA Click"
      : "Card Click";
    trackEvent(
      action,
      "User Interaction",
      this.textContent.trim().substring(0, 50)
    );
  });
});


// Popup form with proper state management
let currentPopupType = null;
let popupLoading = false;

// Remove any existing popup from DOM
function removeExistingPopup() {
  const existingPopup = document.getElementById("global-popup");
  if (existingPopup) {
    existingPopup.remove();
  }
  currentPopupType = null;
}

// Setup form submission handler
function setupFormSubmission(form, status) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get the source parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const applySource = urlParams.get('src') || WEBSITE_CONSTANTS.EXPRESS_INTEREST_SOURCE;

    const data = {
      studentName: form.studentName.value.trim(),
      email: form.email.value.trim(),
      mobile: form.mobile.value.trim(),
      interestType: form.interestType.value,
      courseType: form.courseType.value,
      applySource: applySource
    };

    // Basic client validation
    if (!data.studentName || !data.email || !data.mobile || !data.interestType || !data.courseType) {
      status.textContent = "Please fill all required fields.";
      status.style.color = "red";
      return;
    }

    const submitBtn = document.getElementById("popup-submit-btn");
    submitBtn.disabled = true;
    status.textContent = "Submitting...";
    status.style.color = "gray";

    try {
      const res = await fetch(`${DOMAIN}/public/dms/api/expressInterest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const responseData = await res.json().catch(() => null);

      if (res.ok) {
        status.innerHTML = `<span style="
                                      color: green;
                                      font-weight: 600;
                                      font-size: 1rem;
                                      display: inline-block;
                                      margin-top: 8px;
                                      ">
                                      Thanks for your submission!<br>
                                      Next set of instructions will be sent to your Email ID.
                                      </span>`;
        form.reset();

      } else {
        const errorMsg = responseData?.message || "Submission failed. Please try again.";
        status.textContent = errorMsg;
        status.style.color = "red";
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error("Submission error:", err);
      status.textContent = "Network error. Please check your connection and try again.";
      status.style.color = "red";
      submitBtn.disabled = false;
    }
  });
}

// Load and show paid popup
function loadPaidPopup() {
  if (popupLoading) return;

  popupLoading = true;
  removeExistingPopup();

  fetch("popup-paid.html")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load popup");
      return res.text();
    })
    .then(html => {
      document.body.insertAdjacentHTML("beforeend", html);
      currentPopupType = "paid";

      const popup = document.getElementById("global-popup");
      const closeBtn = popup.querySelector(".popup-close");
      const form = document.getElementById("interest-form");
      const status = document.getElementById("form-status");

      closeBtn.addEventListener("click", () => {
        popup.style.display = "none";
        document.body.style.overflow = "auto";
        resetPopupForm();
      });

      popup.addEventListener("click", (e) => {
        if (e.target === popup) {
          popup.style.display = "none";
          document.body.style.overflow = "auto";
          resetPopupForm();
        }
      });

      // Setup form
      setupFormSubmission(form, status);

      // Show popup
      popup.style.display = "flex";
      document.body.style.overflow = "hidden";
      popupLoading = false;
    })
    .catch(err => {
      console.error("Error loading paid popup:", err);
      alert("Failed to load registration form. Please refresh and try again.");
      popupLoading = false;
    });
}

// Load and show unpaid popup
function loadUnpaidPopup() {
  if (popupLoading) return;

  popupLoading = true;
  removeExistingPopup();

  fetch("popup-unpaid.html")
    .then(res => {
      if (!res.ok) throw new Error("Failed to load popup");
      return res.text();
    })
    .then(html => {
      document.body.insertAdjacentHTML("beforeend", html);
      currentPopupType = "unpaid";

      const popup = document.getElementById("global-popup");
      const closeBtn = popup.querySelector(".popup-close");
      const form = document.getElementById("interest-form");
      const status = document.getElementById("form-status");

      closeBtn.addEventListener("click", () => {
        popup.style.display = "none";
        document.body.style.overflow = "auto";
        resetPopupForm();
      });

      popup.addEventListener("click", (e) => {
        if (e.target === popup) {
          popup.style.display = "none";
          document.body.style.overflow = "auto";
          resetPopupForm();
        }
      });


      // Setup form
      setupFormSubmission(form, status);

      // Show popup
      popup.style.display = "flex";
      document.body.style.overflow = "hidden";
      popupLoading = false;
    })
    .catch(err => {
      console.error("Error loading unpaid popup:", err);
      alert("Failed to load registration form. Please refresh and try again.");
      popupLoading = false;
    });
}

// Public functions
function showPaidPopup() {
  if (popupLoading) return;

  const existingPopup = document.getElementById("global-popup");

  if (existingPopup && currentPopupType === "paid") {
    // Already loaded, just show it
    existingPopup.style.display = "flex";
    document.body.style.overflow = "hidden";
  } else {
    // Load fresh
    loadPaidPopup();
  }
}

function showUnpaidPopup() {
  if (popupLoading) return;

  const existingPopup = document.getElementById("global-popup");

  if (existingPopup && currentPopupType === "unpaid") {
    // Already loaded, just show it
    existingPopup.style.display = "flex";
    document.body.style.overflow = "hidden";
  } else {
    // Load fresh
    loadUnpaidPopup();
  }
}

// Expose to global scope
window.showPaidPopup = showPaidPopup;
window.showUnpaidPopup = showUnpaidPopup;


// Blog fetching functionality
class BlogManager {
  constructor() {
    this.blogs = [];
    this.loading = false;
    this.error = null;
    this.cursor = null;
    this.hasNextPage = true;
    this.searchTerm = '';
    this.postsPerPage = 9;

    // Hashnode API configuration from config.js
    this.API_URL = window.HASHNODE_CONFIG?.API_URL || 'https://api.hashnode.com';
    this.USERNAME = window.HASHNODE_CONFIG?.USERNAME || 'techeazy';
    this.HASHNODE_API_KEY = window.HASHNODE_CONFIG?.API_KEY || 'your-hashnode-api-key';
    this.postsPerPage = window.HASHNODE_CONFIG?.POSTS_PER_PAGE || 9;

    console.log('BlogManager constructor called');
    console.log('API Config:', {
      API_URL: this.API_URL,
      USERNAME: this.USERNAME,
      API_KEY: this.HASHNODE_API_KEY ? '***configured***' : 'not configured',
      POSTS_PER_PAGE: this.postsPerPage
    });

    this.init();
  }

  init() {
    // Only initialize if we're on the blogs page
    if (document.getElementById('blogsContainer')) {
      console.log('BlogManager initialized on blogs page');
      this.setupSearch();
      this.fetchBlogs();
    } else {
      console.log('BlogManager: Not on blogs page, skipping initialization');
    }
  }

  setupSearch() {
    const searchInput = document.getElementById('blogSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.renderBlogs();
      });
    }
  }

  async fetchBlogs(after = null) {
    this.loading = true;
    this.showLoading(true);
    this.showError(false);

    // Check if API key is configured
    if (!this.HASHNODE_API_KEY || this.HASHNODE_API_KEY === 'your-hashnode-api-key' || this.HASHNODE_API_KEY === 'your-hashnode-api-key-here') {
      console.warn('Hashnode API key not configured. Loading fallback blogs.');
      this.loadFallbackBlogs();
      return;
    }

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.HASHNODE_API_KEY}`,
        },
        body: JSON.stringify({
          query: `
            query GetUserPublications($username: String!, $after: String) {
              user(username: $username) {
                publications(first: 5) {
                  edges {
                    node {
                      posts(first: ${this.postsPerPage}, after: $after) {
                        edges {
                          node { 
                            slug 
                            title 
                            brief 
                            publishedAt
                            url
                          }
                        }
                        pageInfo {
                          endCursor
                          hasNextPage
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { username: this.USERNAME, after },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data && data.data.user && data.data.user.publications && data.data.user.publications.edges[0]?.node) {
        const publication = data.data.user.publications.edges[0].node;
        const fetchedBlogs = publication.posts.edges.map((post) => post.node) || [];
        const newCursor = publication.posts.pageInfo.endCursor || null;
        const hasMorePages = publication.posts.pageInfo.hasNextPage || false;

        // Filter out duplicates
        const newBlogs = fetchedBlogs.filter(b => !this.blogs.some(existing => existing.slug === b.slug));
        this.blogs = [...this.blogs, ...newBlogs];
        this.cursor = newCursor;
        this.hasNextPage = hasMorePages;

        console.log('Fetched Blogs:', fetchedBlogs);
        console.log('New Cursor:', newCursor);
        console.log('Has More Pages:', hasMorePages);

        this.renderBlogs();
        this.updateLoadMoreButton();
        this.updateExploreMoreButton();
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error('Error fetching blogs:', err);
      this.error = 'Error fetching blogs';
      this.showError(true);
    } finally {
      this.loading = false;
      this.showLoading(false);
    }
  }

  loadFallbackBlogs() {
    // Show API notice
    this.showApiNotice(true);

    // Fallback blogs when API is not configured
    const fallbackBlogs = [
      {
        slug: 'aws-elastic-load-balancer-elb-beginners-guide',
        title: 'AWS Elastic Load Balancer (ELB) – Beginner\'s Guide',
        brief: '🌍 Introduction When you run an application on AWS, having just one server (EC2 instance) is risky: If that server fails → your app goes down ❌ If too many users visit → server may crash ❌ 👉 That\'s where Elastic Load Balancer (ELB) comes in. AWS E...',
        publishedAt: '2025-09-08T00:00:00Z',
        url: 'https://blog.techeazyconsulting.com/aws-elastic-load-balancer-elb-beginners-guide'
      },
      {
        slug: 'securely-host-website-with-aws-cloudfront-private-s3-route-53',
        title: 'Securely Host Website with AWS CloudFront + Private S3 + Route 53',
        brief: '🌍 Introduction If you directly host a static site on AWS S3 (public), your files are exposed to the internet. This is fine for simple hosting, but not secure for production. The best practice is: Keep your S3 bucket private Serve content via CloudF...',
        publishedAt: '2025-08-26T00:00:00Z',
        url: 'https://blog.techeazyconsulting.com/securely-host-website-with-aws-cloudfront-private-s3-route-53-custom-domain-https'
      },
      {
        slug: 'connect-custom-domain-to-aws-s3-website-using-route-53',
        title: 'Connect Custom Domain to AWS S3 Website using Route 53',
        brief: '🚀 Introduction Hosting your static website on AWS S3 is simple, but by default you get a long AWS URL like: http://myapp.com.s3-website-us-east-1.amazonaws.com To make your site look professional, you need a custom domain (like myapp.com). In this g...',
        publishedAt: '2025-08-25T00:00:00Z',
        url: 'https://blog.techeazyconsulting.com/connect-custom-domain-to-aws-s3-website-using-route-53'
      },
      {
        slug: 'deploy-static-htmlcss-website-to-aws-s3-with-cicd-github-actions',
        title: 'Deploy Static HTML/CSS Website to AWS S3 with CI/CD (GitHub Actions)',
        brief: '🌍 Introduction If you\'re tired of manually uploading files to AWS S3 for hosting your static site, then CI/CD with GitHub Actions is the perfect solution. In this guide, we\'ll set up: An S3 bucket for static hosting IAM user with permissions GitHub...',
        publishedAt: '2025-08-21T00:00:00Z',
        url: 'https://blog.techeazyconsulting.com/deploy-static-htmlcss-website-to-aws-s3-with-cicd-github-actions'
      },
      {
        slug: 'how-to-host-a-static-website-on-aws-s3-step-by-step-guide',
        title: 'How to Host a Static Website on AWS S3 (Step-by-Step Guide)',
        brief: '🚀 Introduction If you\'ve built a static website using HTML, CSS, and images, the next step is getting it online. One of the simplest and most cost-effective ways is to use Amazon S3 (Simple Storage Service). With just a few clicks, you can deploy yo...',
        publishedAt: '2025-09-05T00:00:00Z',
        url: 'https://blog.techeazyconsulting.com/how-to-host-a-static-website-on-aws-s3-step-by-step-guide'
      }
    ];

    this.blogs = fallbackBlogs;
    this.hasNextPage = false;
    this.renderBlogs();
    this.updateLoadMoreButton();
    this.updateExploreMoreButton();
    this.loading = false;
    this.showLoading(false);
  }

  get filteredBlogs() {
    if (!this.searchTerm) return this.blogs;
    return this.blogs.filter(blog =>
      blog.title.toLowerCase().includes(this.searchTerm) ||
      blog.brief.toLowerCase().includes(this.searchTerm)
    );
  }

  renderBlogs() {
    const container = document.getElementById('blogsContainer');
    if (!container) return;

    const blogsToShow = this.filteredBlogs;

    if (blogsToShow.length === 0 && !this.loading) {
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #666;">
          <p>No blogs found${this.searchTerm ? ' matching your search.' : '.'}</p>
        </div>
      `;
      // Hide both buttons when no blogs are found
      this.updateLoadMoreButton();
      this.updateExploreMoreButton();
      return;
    }

    container.innerHTML = blogsToShow.map(blog => `
      <article class="blog-post">
        <h2>${blog.title}</h2>
        <div class="blog-meta">
          ${blog.publishedAt ? `Published on ${new Date(blog.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}` : 'Recently Published'} | Technical Guide
        </div>
        <p>
          ${blog.brief || 'Read more about this topic...'}
        </p>
        <a
          href="${blog.url || `https://blog.techeazyconsulting.com/${blog.slug}`}"
          target="_blank"
          style="color: #ff6b35; text-decoration: none"
        >Read More →</a>
      </article>
    `).join('');

    // Update explore more button after rendering
    this.updateExploreMoreButton();
  }

  updateLoadMoreButton() {
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
      loadMoreContainer.style.display = this.hasNextPage ? 'block' : 'none';
    }
  }

  updateExploreMoreButton() {
    const exploreMoreContainer = document.getElementById('exploreMoreContainer');
    if (exploreMoreContainer) {
      // Show "Explore More" button only if we have blogs loaded and no more pages to load
      const shouldShow = this.blogs.length > 0 && !this.hasNextPage && !this.loading;
      exploreMoreContainer.style.display = shouldShow ? 'block' : 'none';
    }
  }

  showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
      spinner.style.display = show ? 'block' : 'none';
    }
  }

  showError(show) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
      errorMessage.style.display = show ? 'block' : 'none';
    }
  }

  showApiNotice(show) {
    const apiNotice = document.getElementById('apiNotice');
    if (apiNotice) {
      apiNotice.style.display = show ? 'block' : 'none';
    }
  }
}

// Global functions for HTML onclick handlers
function fetchBlogs() {
  if (window.blogManager) {
    window.blogManager.fetchBlogs();
  }
}

function loadMoreBlogs() {
  if (window.blogManager && window.blogManager.hasNextPage && !window.blogManager.loading) {
    window.blogManager.fetchBlogs(window.blogManager.cursor);
  }
}

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  window.blogManager = new BlogManager();
});