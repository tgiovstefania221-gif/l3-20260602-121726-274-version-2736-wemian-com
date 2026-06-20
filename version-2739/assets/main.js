(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  const filterInput = document.querySelector('[data-card-filter]');
  const filterList = document.querySelector('[data-filter-list]');

  function applyQueryToInput() {
    if (!filterInput) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query) {
      filterInput.value = query;
    }
  }

  function filterCards() {
    if (!filterInput || !filterList) {
      return;
    }

    const keyword = filterInput.value.trim().toLowerCase();
    const cards = Array.from(filterList.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      const haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' ').toLowerCase();

      card.classList.toggle('is-hidden', keyword && !haystack.includes(keyword));
    });
  }

  applyQueryToInput();

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
    filterCards();
  }
})();
