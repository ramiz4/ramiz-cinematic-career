import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { canOfferIosInstall, IOS_INSTALL_DISMISS_KEY, IOS_INSTALL_PROMPT_DELAY } from '../pwa/install';

function hasBeenDismissed() {
  try {
    return window.localStorage.getItem(IOS_INSTALL_DISMISS_KEY) === 'dismissed';
  } catch {
    return false;
  }
}

function isEligible() {
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return canOfferIosInstall({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    standalone: iosNavigator.standalone === true,
    displayModeStandalone: window.matchMedia('(display-mode: standalone)').matches,
    dismissed: hasBeenDismissed(),
  });
}

const copy = {
  de: {
    eyebrow: 'iPhone · Web App',
    title: 'Diese Story als App.',
    description: 'Vollbild, schneller Zugriff und die ganze Experience direkt auf deinem Home-Bildschirm.',
    steps: ['Teilen öffnen', 'Zum Home-Bildschirm', 'Als Web-App öffnen + Hinzufügen'],
    dismiss: 'Verstanden',
    close: 'Installationshinweis schließen',
  },
  en: {
    eyebrow: 'iPhone · Web App',
    title: 'Keep this story as an app.',
    description: 'Full screen, faster access, and the complete experience right from your Home Screen.',
    steps: ['Open Share', 'Add to Home Screen', 'Open as Web App + Add'],
    dismiss: 'Got it',
    close: 'Close installation hint',
  },
} as const;

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const language = navigator.language.toLowerCase().startsWith('de') ? copy.de : copy.en;

  useEffect(() => {
    if (!isEligible()) return;

    const reveal = () => setVisible(true);
    const timer = window.setTimeout(reveal, IOS_INSTALL_PROMPT_DELAY);
    const revealAfterScroll = () => {
      if (window.scrollY < Math.max(280, window.innerHeight * .35)) return;
      window.clearTimeout(timer);
      reveal();
      window.removeEventListener('scroll', revealAfterScroll);
    };

    window.addEventListener('scroll', revealAfterScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', revealAfterScroll);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(IOS_INSTALL_DISMISS_KEY, 'dismissed');
    } catch {
      // Private browsing or restrictive storage settings should not block dismissal.
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          className="install-prompt"
          role="dialog"
          aria-labelledby="install-prompt-title"
          initial={{ opacity: 0, y: 32, scale: .97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 22, scale: .98 }}
          transition={{ duration: .45, ease: [.16, 1, .3, 1] }}
        >
          <div className="install-prompt__glow" aria-hidden="true" />
          <header>
            <span className="install-prompt__mark" aria-hidden="true">RL<i /></span>
            <div>
              <span className="install-prompt__eyebrow">{language.eyebrow}</span>
              <h2 id="install-prompt-title">{language.title}</h2>
            </div>
            <button className="install-prompt__close" type="button" aria-label={language.close} onClick={dismiss}>×</button>
          </header>
          <p>{language.description}</p>
          <ol>
            {language.steps.map((step, index) => (
              <li key={step}><span>0{index + 1}</span><strong>{step}</strong></li>
            ))}
          </ol>
          <button className="install-prompt__dismiss" type="button" onClick={dismiss}>{language.dismiss}<span aria-hidden="true">↘</span></button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
