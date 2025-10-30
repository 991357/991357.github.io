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

  // --- Typing Effect ---
  const typingText = document.getElementById('typing-text');
  const text = "도전, 개발 그리고 창의성을 상징하는 개발자";
  let index = 0;
  let isDeleting = false;

  function type() {
    const fullText = text;
    let currentText = '';

    if (isDeleting) {
      currentText = fullText.substring(0, index - 1);
      index--;
    } else {
      currentText = fullText.substring(0, index + 1);
      index++;
    }

    if(typingText) {
      typingText.textContent = currentText;
    }

    let typeSpeed = isDeleting ? 100 : 200;

    if (!isDeleting && index === fullText.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && index === 0) {
      isDeleting = false;
    }
    
    setTimeout(type, typeSpeed);
  }

  type();
});
