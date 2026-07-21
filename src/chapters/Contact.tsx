import { Chapter } from '../components/Chapter';

export function Contact() {
  return (
    <Chapter id="contact" index="05" eyebrow="The next system starts with alignment" title="Let’s turn complexity into leverage.">
      <p className="chapter__story">
        I’m open to CTO and Head of Engineering conversations, technical leadership mandates and keynotes on pragmatic architecture and AI-enabled engineering.
      </p>
      <div className="contact-paths">
        <a href="mailto:me@ramizloki.com?subject=CTO%20or%20Head%20of%20Engineering%20conversation">
          <span>Leadership mandate</span><strong>Discuss the next system</strong><i aria-hidden="true">↗</i>
        </a>
        <a href="mailto:me@ramizloki.com?subject=Keynote%20or%20technical%20leadership%20session">
          <span>Keynote or session</span><strong>Bring the ideas to your team</strong><i aria-hidden="true">↗</i>
        </a>
      </div>
      <div className="terminal">
        <div className="terminal__bar"><i /><i /><i /><span>leadership.connection.ready</span></div>
        <p><span>$</span> contact --channel email</p>
        <a href="mailto:me@ramizloki.com">me@ramizloki.com</a>
        <p><span>$</span> location</p>
        <strong>Wettingen, Switzerland</strong>
        <div className="terminal__links">
          <a href="https://www.linkedin.com/in/ramiz-loki/">LinkedIn ↗</a>
          <a href="https://github.com/ramiz4">GitHub ↗</a>
          <a href="https://stackoverflow.com/users/3466032/ramiz4">Stack Overflow ↗</a>
        </div>
      </div>
    </Chapter>
  );
}
