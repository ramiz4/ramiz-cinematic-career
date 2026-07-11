import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { Chapter } from '../components/Chapter';
const nodes = ['Angular','TypeScript','Java','Spring Boot','.NET','REST','OpenAPI','Docker','Kubernetes','PostgreSQL','GitHub Actions','AI Agents'];
export function Universe() { return <Chapter id="universe" index="01" eyebrow="The system expands" title="Architecture is a living network."><p className="chapter__story">The core opens. Individual technologies stop being isolated tools and become one connected engineering universe.</p><p className="lead">Frontend, domain logic, APIs, infrastructure and delivery are not separate disciplines. They are connected decisions.</p><div className="constellation">{nodes.map((node,index)=><motion.span key={node} style={{'--i':index} as CSSProperties} initial={{scale:.7}} whileInView={{scale:1}} viewport={{once:true}} transition={{delay:Math.min(index*.035,.35),duration:.45}}>{node}</motion.span>)}</div></Chapter>; }
