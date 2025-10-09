document.addEventListener('DOMContentLoaded', function () {

  // --- Smooth Scroll for all anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // --- Scroll-spy for side navigation ---
  const sections = document.querySelectorAll('.content-section, #home');
  const sideNavLinks = document.querySelectorAll('#side-nav .nav-link');

  function handleScrollSpy() {
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - sectionHeight / 3) {
        currentSectionId = section.getAttribute('id');
      }
    });

    sideNavLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentSectionId) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', handleScrollSpy);
  // Initial check on load
  handleScrollSpy();

});
