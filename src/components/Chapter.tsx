import type { PropsWithChildren } from 'react';
type Props = PropsWithChildren<{ id: string; index: string; eyebrow: string; title: string; className?: string }>;
export function Chapter({ id, index, eyebrow, title, className = '', children }: Props) {
  return <section id={id} className={`chapter ${className}`} aria-labelledby={`${id}-title`}><div className="chapter__meta"><span>{index}</span><span>{eyebrow}</span></div><div className="chapter__body"><h2 id={`${id}-title`}>{title}</h2>{children}</div></section>;
}
