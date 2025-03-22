import { useEffect } from "react";

export function useScrollAnimation() {
  useEffect(() => {
    let lastScrollTop = 0;
    let isAtTop = true;

    const handleScroll = () => {
      const currentScrollTop = window.scrollY;
      if (currentScrollTop < 50) {
        isAtTop = true;
      } else if (isAtTop && currentScrollTop > lastScrollTop) {
        resetAndStartAnimations();
        isAtTop = false;
      }
      lastScrollTop = currentScrollTop;
    };

    const createObserver = (className, visibleClassName, staggered = false) => {
      return new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            if (staggered) {
              setTimeout(() => {
                entry.target.classList.add(visibleClassName);
              }, index * 50);
            } else {
              entry.target.classList.add(visibleClassName);
            }
          } else {
            entry.target.classList.remove(visibleClassName);
          }
        });
      }, {});
    };

    const fadeObserver = createObserver("fade-in", "fade-in-visible");
    const slideObserver = createObserver("slide-in", "slide-in-visible");
    const staggerObserver = createObserver(
      "stagger-in",
      "stagger-in-visible",
      true
    );

    const observeElements = () => {
      const fadeElements = document.querySelectorAll(
        ".mission-block, .problem-block, .contact-block"
      );
      const slideElements = document.querySelectorAll(
        ".mission-left, .mission-icon, .problem-header, .contact-header"
      );
      const staggerElements = document.querySelectorAll(
        ".software-item, .problem-item"
      );

      fadeElements.forEach((el) => {
        el.classList.add("fade-in");
        fadeObserver.observe(el);
      });

      slideElements.forEach((el) => {
        el.classList.add("slide-in");
        slideObserver.observe(el);
      });

      staggerElements.forEach((el) => {
        el.classList.add("stagger-in");
        staggerObserver.observe(el);
      });
    };

    const resetAndStartAnimations = () => {
      const animatedElements = document.querySelectorAll(
        ".fade-in, .slide-in, .stagger-in"
      );
      animatedElements.forEach((el) => {
        el.classList.remove("fade-in-visible");
        el.classList.remove("slide-in-visible");
        el.classList.remove("stagger-in-visible");
      });
    };

    observeElements();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      fadeObserver.disconnect();
      slideObserver.disconnect();
      staggerObserver.disconnect();
    };
  }, []);
}
