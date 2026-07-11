import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const routes = [
  ['hero', 'Origin'],
  ['universe', 'Universe'],
  ['career', 'Career'],
  ['projects', 'Projects'],
  ['architect', 'Architect'],
  ['contact', 'Contact'],
] as const;

export function Navigation() {
  const { scrollY, scrollYProgress } = useScroll();
  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24);
    const viewportCenter = latest + window.innerHeight * .42;
    let next = 0;
    routes.forEach(([id], index) => {
      const section = document.getElementById(id);
      if (section && section.offsetTop <= viewportCenter) next = index;
    });
    setActive((current) => current === next ? current : next);
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.documentElement.classList.toggle('menu-open', open);
    document.body.style.overflow = open ? 'hidden' : previousOverflow;
    if (open) requestAnimationFrame(() => firstLinkRef.current?.focus());
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', closeWithEscape);
    return () => {
      document.documentElement.classList.remove('menu-open');
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeWithEscape);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return <>
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''} ${open ? 'nav--open' : ''}`} aria-label="Primary">
      <a className="brand" href="#hero" aria-label="Back to the beginning">
        <span className="brand__mark"><b>RL</b><i /><i /></span>
        <span className="brand__word">Ramiz Loki</span>
      </a>
      <div className="nav__links">{routes.slice(1).map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</div>
      <div className="nav__mobile-status" aria-hidden="true">
        <span><i /> Journey 0{active + 1}</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.strong key={routes[active][0]} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: .2 }}>
            {routes[active][1]}
          </motion.strong>
        </AnimatePresence>
      </div>
      <a className="nav__cta" href="mailto:me@ramizloki.com">Contact</a>
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
          id="mobile-journey-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
          initial={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 2rem) 2rem)' }}
          animate={{ opacity: 1, clipPath: 'circle(145% at calc(100% - 2rem) 2rem)' }}
          exit={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 2rem) 2rem)' }}
          transition={{ duration: .55, ease: [.16, 1, .3, 1] }}
        >
          <div className="mobile-menu__ambient" aria-hidden="true" />
          <div className="mobile-menu__header">
            <span>Navigate the system</span>
            <strong id="mobile-menu-title">Your journey</strong>
          </div>
          <ol>
            {routes.map(([id, label], index) => (
              <motion.li key={id} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .08 + index * .045 }}>
                <a ref={index === 0 ? firstLinkRef : undefined} href={`#${id}`} onClick={closeMenu} aria-label={`${index + 1}. ${label}`} aria-current={index === active ? 'page' : undefined}>
                  <span>0{index + 1}</span><strong>{label}</strong><i aria-hidden="true">↘</i>
                </a>
              </motion.li>
            ))}
          </ol>
          <a className="mobile-menu__contact" href="mailto:me@ramizloki.com" onClick={closeMenu}>
            <span>Start a conversation</span><i aria-hidden="true">↗</i>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  </>;
}
