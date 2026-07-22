import { AnimatePresence, LayoutGroup, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { STORY_PHASES } from '../experience/storyPhases';
import { useActiveStoryPhase } from '../experience/useActiveStoryPhase';

export function Navigation() {
  const { scrollY, scrollYProgress } = useScroll();
  const active = useActiveStoryPhase();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24);
  });

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 800px)');
    const closeBeyondMobile = () => {
      if (mobileQuery.matches) return;
      restoreFocusRef.current = false;
      setOpen(false);
    };
    mobileQuery.addEventListener('change', closeBeyondMobile);
    return () => mobileQuery.removeEventListener('change', closeBeyondMobile);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const backgroundElements = Array.from(document.querySelectorAll<HTMLElement>('[data-navigation-background]'));
    document.documentElement.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : previousOverflow;
    backgroundElements.forEach((element) => {
      if (open) {
        element.setAttribute('inert', '');
        element.setAttribute('aria-hidden', 'true');
      } else {
        element.removeAttribute('inert');
        element.removeAttribute('aria-hidden');
      }
    });

    const focusFrame = requestAnimationFrame(() => {
      if (open) firstLinkRef.current?.focus();
      else if (restoreFocusRef.current) {
        restoreFocusRef.current = false;
        toggleRef.current?.focus();
      }
    });

    const handleDialogKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        restoreFocusRef.current = true;
        setOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !open || !menuRef.current) return;
      const focusable = Array.from(menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => !element.hasAttribute('inert'));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleDialogKeyboard);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.documentElement.classList.remove('menu-open');
      document.body.style.overflow = previousOverflow;
      backgroundElements.forEach((element) => {
        element.removeAttribute('inert');
        element.removeAttribute('aria-hidden');
      });
      window.removeEventListener('keydown', handleDialogKeyboard);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);
  const closeMenuAndRestoreFocus = () => {
    restoreFocusRef.current = true;
    setOpen(false);
  };

  return <>
    <nav
      className={`nav ${scrolled ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`}
      aria-label="Primary"
      inert={open ? true : undefined}
      aria-hidden={open ? true : undefined}
    >
      <a className="brand" href="#hero" aria-label="Back to the beginning" aria-current={active === 0 ? 'page' : undefined}>
        <span className="brand__mark"><b>RL</b><i /><i /></span>
        <span className="brand__word">Ramiz Loki</span>
      </a>
      <LayoutGroup id="primary-navigation">
        <div className="nav__links">
          {STORY_PHASES.slice(1).map((phase, index) => {
            const phaseIndex = index + 1;
            const isActive = phaseIndex === active;

            return (
              <a key={phase.id} href={`#${phase.id}`} className={isActive ? 'is-active' : undefined} aria-current={isActive ? 'page' : undefined}>
                <span className="nav__link-dot" aria-hidden="true" />
                <span className="nav__link-label">{phase.navigationLabel}</span>
                {isActive && (
                  <motion.span
                    className="nav__active-track"
                    layoutId="primary-navigation-active-track"
                    transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 34, mass: .55 }}
                    aria-hidden="true"
                  />
                )}
              </a>
            );
          })}
        </div>
      </LayoutGroup>
      <div className="nav__mobile-status" aria-hidden="true">
        <span><i /> Journey 0{active + 1}</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.strong
            key={STORY_PHASES[active].id}
            initial={reduceMotion ? false : { opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -7 }}
            transition={{ duration: reduceMotion ? 0 : .2 }}
          >
            {STORY_PHASES[active].navigationLabel}
          </motion.strong>
        </AnimatePresence>
      </div>
      <a className="nav__cta" href="mailto:me@ramizloki.com?subject=Technology%20leadership%20conversation">Let’s talk</a>
      <button
        ref={toggleRef}
        className="nav__menu-toggle"
        type="button"
        aria-label={open ? 'Close journey menu' : 'Open journey menu'}
        aria-expanded={open}
        aria-controls="mobile-journey-menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span /><span />
      </button>
      <span className="nav__progress" aria-hidden="true"><motion.i style={{ scaleX: scrollYProgress }} /></span>
    </nav>

    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          id="mobile-journey-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
          initial={reduceMotion ? false : { opacity: 0, clipPath: 'circle(0% at calc(100% - 2rem) 2rem)' }}
          animate={{ opacity: 1, clipPath: 'circle(145% at calc(100% - 2rem) 2rem)' }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, clipPath: 'circle(0% at calc(100% - 2rem) 2rem)' }}
          transition={{ duration: reduceMotion ? 0 : .55, ease: [.16, 1, .3, 1] }}
        >
          <button className="mobile-menu__close" type="button" aria-label="Close journey menu" onClick={closeMenuAndRestoreFocus}>
            <span /><span />
          </button>
          <div className="mobile-menu__ambient" aria-hidden="true" />
          <div className="mobile-menu__header">
            <span>Navigate the system</span>
            <strong id="mobile-menu-title">Your journey</strong>
          </div>
          <ol>
            {STORY_PHASES.map((phase, index) => (
              <motion.li
                key={phase.id}
                initial={reduceMotion ? false : { opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduceMotion ? 0 : .08 + index * .045 }}
              >
                <a ref={index === 0 ? firstLinkRef : undefined} href={`#${phase.id}`} onClick={closeMenu} aria-label={`${index + 1}. ${phase.navigationLabel}`} aria-current={index === active ? 'page' : undefined}>
                  <span>0{index + 1}</span><strong>{phase.navigationLabel}</strong><i aria-hidden="true">↘</i>
                </a>
              </motion.li>
            ))}
          </ol>
          <a className="mobile-menu__contact" href="mailto:me@ramizloki.com?subject=Technology%20leadership%20conversation" onClick={closeMenu}>
            <span>Discuss a leadership mandate</span><i aria-hidden="true">↗</i>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  </>;
}
