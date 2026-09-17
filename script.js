// Single source of truth for social/resource links reused across the footer
// and in-page resource cards (e.g. join.html "Resource access"). Update the
// URL here once and every [data-social] link on the site picks it up.
const SOCIAL_LINKS = {
  github: 'https://github.com/ucb-control-intelligence-systems-lab',
  youtube: 'https://www.youtube.com/channel/UC4SEVhgzDmUEG7NVm2mjdPA'
};

// Scroll reveal
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-social]').forEach(el => {
    const key = el.dataset.social;
    if (SOCIAL_LINKS[key]) el.href = SOCIAL_LINKS[key];
  });

  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const navlinks = document.querySelector('.navlinks');
  if (toggle && navlinks) {
    toggle.addEventListener('click', () => navlinks.classList.toggle('open'));
  }

  // Hero carousel
  const carousel = document.getElementById('hero-carousel');
  if (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const dots = Array.from(document.querySelectorAll('.carousel-dots .dot'));
    let index = 0;
    let timer;
    const SLIDE_DURATION_MS = 10000; // every slide, video or image, stays up this long

    function next() { goTo(index + 1); }

    function scheduleNext() {
      clearTimeout(timer);
      const duration = parseInt(slides[index].dataset.duration, 10) || SLIDE_DURATION_MS;
      timer = setTimeout(next, duration);
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, si) => s.classList.toggle('active', si === index));
      dots.forEach((d, di) => d.classList.toggle('active', di === index));

      // Play the active slide's video (if any), pause the rest to save resources
      slides.forEach((s, si) => {
        const video = s.querySelector('video');
        if (!video) return;
        if (si === index) {
          video.muted = true; // belt-and-suspenders: some browsers (Safari) only
                               // honor autoplay on the muted *property*, not just
                               // the markup attribute.
          const startPlay = () => video.play().catch(() => {});
          // Setting currentTime before the browser has loaded any metadata can
          // throw (InvalidStateError) in some browsers, which would otherwise
          // abort this whole block and leave the video frozen on its poster/
          // first frame with playback never attempted. Guard it so a throw here
          // can't prevent the play() call below.
          try { video.currentTime = 0; } catch (e) {}
          // 'seeked' doesn't fire reliably in every browser/case (e.g. currentTime
          // was already 0, or the event just gets dropped), so don't gate playback
          // behind it exclusively — try right away too. Calling play() twice is
          // harmless; this just makes sure at least one of them lands.
          video.addEventListener('seeked', startPlay, { once: true });
          startPlay();
        } else {
          video.pause();
        }
      });

      scheduleNext();
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => goTo(i));
    });

    // Browsers pause background video when the tab/window loses focus, which can
    // leave a slide frozen on its last frame. Simplest fix: just restart the
    // carousel from the first slide whenever the page becomes visible again.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) goTo(0);
    });
    window.addEventListener('focus', () => goTo(0));

    goTo(0);
  }
});
