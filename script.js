// Navigation functionality
function showPage(pageId) {
  // Hide all pages
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => page.classList.remove("active"));

  // Show selected page
  document.getElementById(pageId).classList.add("active");

  // Update navigation
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => item.classList.remove("active"));
  document
    .querySelector(`[data-page="${pageId}"]`)
    .classList.add("active");

  // Close mobile menu if open
  document.querySelector(".nav-menu").classList.remove("active");
}

// Mobile menu toggle
document
  .querySelector(".mobile-menu-toggle")
  .addEventListener("click", function () {
    document.querySelector(".nav-menu").classList.toggle("active");
  });

// Navigation click handlers
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", function () {
    const page = this.getAttribute("data-page");
    showPage(page);
  });
});

// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".carousel-dot");

function showSlide(index) {
  // Hide all slides
  slides.forEach((slide) => slide.classList.remove("active"));
  dots.forEach((dot) => dot.classList.remove("active"));

  // Show selected slide
  slides[index].classList.add("active");
  dots[index].classList.add("active");

  currentSlide = index;
}

// Auto-rotate carousel
setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}, 5000);

// Smooth scrolling for CTA button
document.addEventListener("DOMContentLoaded", function () {
  // Add scroll-to-top functionality
  window.addEventListener("scroll", function () {
    const header = document.querySelector(".header");
    if (window.scrollY > 100) {
      header.style.backgroundColor = "rgba(44, 62, 80, 0.95)";
    } else {
      header.style.backgroundColor = "";
    }
  });

  // Add animation to cards on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

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
  }

  updateLoadMoreButton() {
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
      loadMoreContainer.style.display = this.hasNextPage ? 'block' : 'none';
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
document.addEventListener('DOMContentLoaded', function() {
  window.blogManager = new BlogManager();
});