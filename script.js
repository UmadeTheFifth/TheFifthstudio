function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('active');
}
document.querySelectorAll('.lightbox').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const src = link.href;
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `<div class="lightbox-content">
      <img src="${src}" />
      <span class="close">&times;</span>
    </div>`;
    document.body.appendChild(overlay);

    overlay.querySelector('.close').onclick = () => overlay.remove();
    overlay.onclick = e => {
      if (e.target === overlay) overlay.remove();
    };
  });
});

let currentSlide = 0;
const slides = document.querySelectorAll('.photo-carousel img');

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.style.display = i === index ? 'block' : 'none';
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}

document.addEventListener('DOMContentLoaded', () => {
  showSlide(currentSlide);
  setInterval(nextSlide, 3000); // Change slide every 4s
});
function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('show');
}
