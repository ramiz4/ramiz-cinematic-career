import { decisionFilters } from '../content/operatingModel';

export function EngineeringOperatingVisual() {
  return (
    <aside className="operating-visual" data-operating-visual aria-label="Engineering operating system live model">
      <header className="operating-visual__header">
        <span>engineering.os</span>
        <div><strong data-operating-index>01 / 05</strong><em data-operating-label>Evidence model</em></div>
        <b>LIVE MODEL</b>
      </header>

      <div className="operating-visual__canvas" aria-hidden="true">
        <svg viewBox="0 0 900 580" role="presentation">
          <defs>
            <pattern id="operating-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M50 0H0V50" className="os-grid-line" />
            </pattern>
            <marker id="operating-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10Z" className="os-arrow" />
            </marker>
          </defs>
          <rect className="os-grid" width="900" height="580" fill="url(#operating-grid)" />

          <g data-operating-group="analyze" className="os-stage os-stage--initial">
            <g className="os-node"><rect x="70" y="120" width="190" height="78" rx="12" /><text x="165" y="153">BUSINESS INTENT</text><text className="os-detail" x="165" y="174">VALUE · OUTCOMES</text></g>
            <g className="os-node"><rect x="70" y="374" width="190" height="78" rx="12" /><text x="165" y="407">SYSTEM EVIDENCE</text><text className="os-detail" x="165" y="428">RUNTIME · USERS</text></g>
            <path data-operating-path className="os-path" d="M260 159C340 159 340 262 395 278" markerEnd="url(#operating-arrow)" />
            <path data-operating-path className="os-path" d="M260 413C340 413 340 310 395 294" markerEnd="url(#operating-arrow)" />
            <g className="os-core"><circle cx="460" cy="286" r="72" /><circle cx="460" cy="286" r="54" /><text x="460" y="281">EVIDENCE</text><text x="460" y="301">MODEL</text></g>
            <path data-operating-path className="os-path" d="M532 286H635" markerEnd="url(#operating-arrow)" />
            <g className="os-stack"><rect x="648" y="150" width="175" height="64" rx="10" /><text x="735" y="178">CONSTRAINTS</text><text className="os-detail" x="735" y="197">TIME · RISK · COST</text></g>
            <g className="os-stack"><rect x="648" y="254" width="175" height="64" rx="10" /><text x="735" y="282">DOMAIN REALITY</text><text className="os-detail" x="735" y="301">RULES · CONTEXT</text></g>
            <g className="os-stack"><rect x="648" y="358" width="175" height="64" rx="10" /><text x="735" y="386">TECHNICAL STATE</text><text className="os-detail" x="735" y="405">COUPLING · FLOW</text></g>
          </g>

          <g data-operating-group="verify" className="os-stage">
            <g className="os-agent"><circle cx="120" cy="286" r="58" /><circle cx="120" cy="286" r="10" /><text x="120" y="373">AI / DRAFT</text></g>
            <path data-operating-path className="os-path" d="M178 286H286" markerEnd="url(#operating-arrow)" />
            <g className="os-document">
              <rect x="300" y="84" width="270" height="404" rx="14" />
              <text x="330" y="126">REQUIREMENT / 01</text>
              <line x1="330" y1="158" x2="530" y2="158" /><line x1="330" y1="191" x2="510" y2="191" />
              <rect x="330" y="228" width="210" height="72" rx="8" /><text className="os-detail" x="350" y="256">SUCCESS CRITERIA</text><text x="350" y="281">MEASURABLE</text>
              <rect x="330" y="324" width="210" height="72" rx="8" /><text className="os-detail" x="350" y="352">BOUNDARIES</text><text x="350" y="377">EXPLICIT</text>
              <text className="os-detail" x="330" y="445">RISK · SCOPE · OWNERSHIP</text>
            </g>
            <path data-operating-path className="os-path" d="M570 286H676" markerEnd="url(#operating-arrow)" />
            <g className="os-gate"><rect x="690" y="198" width="150" height="176" rx="14" /><circle cx="765" cy="246" r="22" /><path d="M754 246L762 254L779 236" /><text x="765" y="305">HUMAN</text><text x="765" y="326">VERIFIED</text><text className="os-detail" x="765" y="351">ACCOUNTABLE GATE</text></g>
          </g>

          <g data-operating-group="structure" className="os-stage">
            <g className="os-node"><rect x="50" y="246" width="160" height="80" rx="12" /><text x="130" y="280">VERIFIED</text><text x="130" y="302">REQUIREMENT</text></g>
            <path data-operating-path className="os-path" d="M210 286H312" markerEnd="url(#operating-arrow)" />
            <g className="os-node os-node--accent"><rect x="326" y="236" width="160" height="100" rx="12" /><text x="406" y="276">EPIC</text><text className="os-detail" x="406" y="302">OUTCOME BOUNDARY</text></g>
            <path data-operating-path className="os-path" d="M486 286C546 286 526 128 610 128" markerEnd="url(#operating-arrow)" />
            <path data-operating-path className="os-path" d="M486 286H610" markerEnd="url(#operating-arrow)" />
            <path data-operating-path className="os-path" d="M486 286C546 286 526 444 610 444" markerEnd="url(#operating-arrow)" />
            <g className="os-ticket"><rect x="610" y="80" width="230" height="96" rx="10" /><text x="635" y="116">TICKET / A</text><text className="os-detail" x="635" y="141">INDEPENDENT · READY</text></g>
            <g className="os-ticket os-ticket--dependent"><rect x="610" y="238" width="230" height="96" rx="10" /><text x="635" y="274">TICKET / B</text><text className="os-detail" x="635" y="299">DEPENDS ON A</text></g>
            <g className="os-ticket"><rect x="610" y="396" width="230" height="96" rx="10" /><text x="635" y="432">TICKET / C</text><text className="os-detail" x="635" y="457">INDEPENDENT · READY</text></g>
            <path data-operating-path className="os-dependency" d="M725 176V238" markerEnd="url(#operating-arrow)" />
          </g>

          <g data-operating-group="parallelize" className="os-stage">
            <text className="os-caption" x="64" y="57">EXECUTABLE WORK</text><text className="os-caption" x="367" y="57">ISOLATED GIT WORKTREES</text><text className="os-caption" x="735" y="57">INTEGRATE</text>
            <g className="os-ticket"><rect x="55" y="102" width="170" height="78" rx="10" /><text x="80" y="136">TICKET / A</text><text className="os-detail" x="80" y="158">READY</text></g>
            <g className="os-ticket os-ticket--dependent"><rect x="55" y="247" width="170" height="78" rx="10" /><text x="80" y="281">TICKET / B</text><text className="os-detail" x="80" y="303">WAITING ON A</text></g>
            <g className="os-ticket"><rect x="55" y="392" width="170" height="78" rx="10" /><text x="80" y="426">TICKET / C</text><text className="os-detail" x="80" y="448">READY</text></g>
            <path data-operating-path className="os-path" d="M225 141H356" markerEnd="url(#operating-arrow)" />
            <path data-operating-path className="os-path" d="M225 286H356" markerEnd="url(#operating-arrow)" />
            <path data-operating-path className="os-path" d="M225 431H356" markerEnd="url(#operating-arrow)" />
            <g className="os-lane"><rect x="356" y="91" width="260" height="100" rx="10" /><circle cx="389" cy="141" r="16" /><text x="425" y="132">WORKTREE / A</text><text className="os-detail" x="425" y="157">AI AGENT · CHECKS GREEN</text></g>
            <g className="os-lane os-lane--waiting"><rect x="356" y="236" width="260" height="100" rx="10" /><circle cx="389" cy="286" r="16" /><text x="425" y="277">WORKTREE / B</text><text className="os-detail" x="425" y="302">DEPENDENCY GATE</text></g>
            <g className="os-lane"><rect x="356" y="381" width="260" height="100" rx="10" /><circle cx="389" cy="431" r="16" /><text x="425" y="422">WORKTREE / C</text><text className="os-detail" x="425" y="447">AI AGENT · CHECKS GREEN</text></g>
            <path data-operating-path className="os-path" d="M616 141C684 141 660 254 730 270" markerEnd="url(#operating-arrow)" />
            <path data-operating-path className="os-path" d="M616 431C684 431 660 318 730 302" markerEnd="url(#operating-arrow)" />
            <g className="os-gate"><rect x="730" y="214" width="125" height="144" rx="12" /><circle cx="792" cy="252" r="16" /><path d="M784 252L790 258L801 245" /><text x="792" y="299">PULL</text><text x="792" y="318">REQUEST</text><text className="os-detail" x="792" y="339">HUMAN REVIEW</text></g>
          </g>

          <g data-operating-group="deliver" className="os-stage">
            <path data-operating-path className="os-path os-path--pipeline" d="M118 334H197" markerEnd="url(#operating-arrow)" />
            <path data-operating-path className="os-path os-path--pipeline" d="M253 334H332" markerEnd="url(#operating-arrow)" />
            <path data-operating-path className="os-path os-path--pipeline" d="M388 334H467" markerEnd="url(#operating-arrow)" />
            <path data-operating-path className="os-path os-path--pipeline" d="M523 334H602" markerEnd="url(#operating-arrow)" />
            <path data-operating-path className="os-path os-path--pipeline" d="M658 334H737" markerEnd="url(#operating-arrow)" />
            <g className="os-pipeline-node"><circle cx="90" cy="334" r="28" /><text x="90" y="390">GITHUB</text><text className="os-detail" x="90" y="406">ACTIONS</text></g>
            <g className="os-pipeline-node"><circle cx="225" cy="334" r="28" /><text x="225" y="390">DOCKER</text><text className="os-detail" x="225" y="406">IMAGE</text></g>
            <g className="os-pipeline-node"><circle cx="360" cy="334" r="28" /><text x="360" y="390">PR</text><text className="os-detail" x="360" y="406">PREVIEW</text></g>
            <g className="os-pipeline-node"><circle cx="495" cy="334" r="28" /><text x="495" y="390">STAGING</text><text className="os-detail" x="495" y="406">VERIFIED</text></g>
            <g className="os-pipeline-node"><circle cx="630" cy="334" r="28" /><text x="630" y="390">FLUX</text><text className="os-detail" x="630" y="406">RECONCILE</text></g>
            <g className="os-pipeline-node os-pipeline-node--active"><circle cx="765" cy="334" r="28" /><text x="765" y="390">KUBERNETES</text><text className="os-detail" x="765" y="406">HA PROD</text></g>
            <g className="os-cluster">
              <rect x="680" y="116" width="170" height="116" rx="14" /><text x="765" y="145">ROLLING UPDATE</text>
              <rect x="704" y="169" width="30" height="34" rx="5" /><rect x="750" y="169" width="30" height="34" rx="5" /><rect x="796" y="169" width="30" height="34" rx="5" />
              <text className="os-detail" x="765" y="220">3 / 3 HEALTHY</text>
            </g>
            <path data-operating-path className="os-path" d="M765 306V232" markerEnd="url(#operating-arrow)" />
            <g className="os-feedback-node"><rect x="45" y="142" width="150" height="66" rx="10" /><text x="120" y="171">EVIDENCE</text><text className="os-detail" x="120" y="190">NEXT CYCLE</text></g>
            <path data-operating-path className="os-feedback" d="M680 152C555 112 332 110 195 175" markerEnd="url(#operating-arrow)" />
            <g className="os-flow-callout os-flow-callout--feedback">
              <rect x="315" y="50" width="300" height="64" rx="10" />
              <circle cx="337" cy="73" r="3" />
              <text className="os-flow-callout__label" x="352" y="77">TELEMETRY LOOP</text>
              <text className="os-flow-callout__value" x="337" y="101">EVIDENCE → NEXT DECISION</text>
              <path d="M465 114V124" />
            </g>
            <g className="os-flow-callout os-flow-callout--artifact">
              <rect x="120" y="238" width="210" height="58" rx="10" />
              <circle cx="142" cy="260" r="3" />
              <text className="os-flow-callout__label" x="157" y="264">DOCKER OUTPUT</text>
              <text className="os-flow-callout__value" x="142" y="287">IMMUTABLE IMAGE</text>
              <path d="M225 296V306" />
            </g>
            <g className="os-outcome"><rect x="275" y="482" width="350" height="62" rx="31" /><circle cx="311" cy="513" r="6" /><text x="455" y="518">PRODUCTION HEALTHY · FEEDBACK OPEN</text></g>
          </g>
        </svg>
      </div>

      <section className="decision-console" aria-label="Engineering decision filters">
        <header className="decision-console__header" aria-hidden="true">
          <span>decision.filters</span>
          <strong><i />04 GUARDRAILS ACTIVE</strong>
        </header>
        <dl className="operating-visual__principles">
          {decisionFilters.map((filter, index) => (
            <div key={filter.principle}>
              <span>0{index + 1}</span>
              <dt>{filter.principle}</dt>
              <dd className="decision-filter__meaning">{filter.meaning}</dd>
              <dd className="decision-filter__effect">{filter.effect}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="operating-visual__rail" aria-hidden="true">
        <div><span>Analyze</span><span>Verify</span><span>Structure</span><span>Parallelize</span><span>Deliver</span></div>
        <i><b data-operating-progress /></i>
      </div>
    </aside>
  );
}
