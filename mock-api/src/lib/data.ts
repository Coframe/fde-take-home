export type Status = 'ready_for_review' | 'approved' | 'launched' | 'cancelled' | 'need_fixes';

export interface CopyChange {
  selector: string;
  original: string;
  variant: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Variant {
  id: string;
  slug: string;
  experimentId: string;
  experimentName: string;
  customerSlug: string;
  projectId: string;
  token: string;
  status: Status;
  idea: string;
  copyChanges: CopyChange[];
  previewUrl: string;
  comments: Comment[];
  updatedAt: string;
}

const seed: Omit<Variant, 'comments'>[] = [
  {
    id: 'CLNT-001',
    slug: 'hero-cta-free-trial',
    experimentId: 'exp_homepage_hero',
    experimentName: 'Homepage Hero',
    customerSlug: 'CLNT',
    projectId: 'proj_clnt_website',
    token: 'tok_demo_clnt_123',
    status: 'ready_for_review',
    idea: 'Lower friction by switching the primary CTA from a passive "Learn more" to an action-oriented free trial offer.',
    copyChanges: [{ selector: 'hero .cta-primary', original: 'Learn more', variant: 'Start your free trial' }],
    previewUrl: 'https://www.acmecorp.com/?variant_id=CLNT-001&slug=hero-cta-free-trial',
    updatedAt: '2025-05-28T09:00:00Z',
  },
  {
    id: 'CLNT-002',
    slug: 'hero-headline-ai-testing',
    experimentId: 'exp_homepage_hero',
    experimentName: 'Homepage Hero',
    customerSlug: 'CLNT',
    projectId: 'proj_clnt_website',
    token: 'tok_demo_clnt_123',
    status: 'ready_for_review',
    idea: 'Replace the abstract tagline with a concrete, benefit-driven statement that speaks directly to the ICP.',
    copyChanges: [{ selector: 'hero h1', original: 'The future of web', variant: 'AI-powered A/B testing that actually works' }],
    previewUrl: 'https://www.acmecorp.com/?variant_id=CLNT-002&slug=hero-headline-ai-testing',
    updatedAt: '2025-05-28T09:01:00Z',
  },
  {
    id: 'CLNT-003',
    slug: 'hero-subheadline-social-proof',
    experimentId: 'exp_homepage_hero',
    experimentName: 'Homepage Hero',
    customerSlug: 'CLNT',
    projectId: 'proj_clnt_website',
    token: 'tok_demo_clnt_123',
    status: 'ready_for_review',
    idea: 'Add social proof to the hero subheadline to increase trust before the first scroll.',
    copyChanges: [{ selector: 'hero .subheadline', original: 'Optimize your website with AI', variant: 'Trusted by 500+ growth teams to ship winning variants faster' }],
    previewUrl: 'https://www.acmecorp.com/?variant_id=CLNT-003&slug=hero-subheadline-social-proof',
    updatedAt: '2025-05-28T09:02:00Z',
  },
  {
    id: 'CLNT-004',
    slug: 'pricing-enterprise-savings',
    experimentId: 'exp_pricing_section',
    experimentName: 'Pricing Section',
    customerSlug: 'CLNT',
    projectId: 'proj_clnt_website',
    token: 'tok_demo_clnt_123',
    status: 'ready_for_review',
    idea: 'Lead with the annual savings amount to reduce sticker shock on the enterprise tier.',
    copyChanges: [{ selector: '.pricing-card.enterprise h3', original: 'Enterprise plan', variant: 'Save 40% with annual billing' }],
    previewUrl: 'https://www.acmecorp.com/pricing?variant_id=CLNT-004&slug=pricing-enterprise-savings',
    updatedAt: '2025-05-28T09:03:00Z',
  },
  {
    id: 'CLNT-005',
    slug: 'pricing-cta-see-included',
    experimentId: 'exp_pricing_section',
    experimentName: 'Pricing Section',
    customerSlug: 'CLNT',
    projectId: 'proj_clnt_website',
    token: 'tok_demo_clnt_123',
    status: 'ready_for_review',
    idea: "Replace the commitment-heavy 'Contact us' CTA with a value-discovery framing to reduce drop-off.",
    copyChanges: [{ selector: '.pricing-card.enterprise .cta', original: 'Contact us', variant: "See what's included" }],
    previewUrl: 'https://www.acmecorp.com/pricing?variant_id=CLNT-005&slug=pricing-cta-see-included',
    updatedAt: '2025-05-28T09:04:00Z',
  },
  {
    id: 'CLNT-006',
    slug: 'nav-cta-no-credit-card',
    experimentId: 'exp_nav_cta',
    experimentName: 'Nav Bar CTA',
    customerSlug: 'CLNT',
    projectId: 'proj_clnt_website',
    token: 'tok_demo_clnt_123',
    status: 'ready_for_review',
    idea: 'Address the implicit credit card objection upfront to remove hesitation at the top of the funnel.',
    copyChanges: [{ selector: 'nav .cta-button', original: 'Get Started', variant: 'Start for free — no credit card' }],
    previewUrl: 'https://www.acmecorp.com/?variant_id=CLNT-006&slug=nav-cta-no-credit-card',
    updatedAt: '2025-05-28T09:05:00Z',
  },
];

// Persist state across Next.js hot reloads in development
const g = global as typeof globalThis & { __variantStore?: Variant[] };
if (!g.__variantStore) {
  g.__variantStore = seed.map(v => ({ ...v, comments: [] }));
}
const store = g.__variantStore;

export function getVariants(token: string, projectId: string, all = false): Variant[] {
  return store.filter(
    v =>
      v.token === token &&
      v.projectId === projectId &&
      (all || v.status === 'ready_for_review')
  );
}

export function getVariantById(id: string): Variant | undefined {
  return store.find(v => v.id === id);
}

export function setVariantStatus(id: string, token: string, status: Status): Variant | null {
  const v = store.find(v => v.id === id && v.token === token);
  if (!v) return null;
  v.status = status;
  v.updatedAt = new Date().toISOString();
  return v;
}

export function getComments(id: string): Comment[] | null {
  const v = store.find(v => v.id === id);
  return v ? v.comments : null;
}

export function addComment(id: string, author: string, text: string): Comment | null {
  const v = store.find(v => v.id === id);
  if (!v) return null;
  const comment: Comment = { id: `cmt_${Date.now()}`, author, text, createdAt: new Date().toISOString() };
  v.comments.push(comment);
  return comment;
}

const RANDOM_POOL: Array<Omit<Variant, 'id' | 'customerSlug' | 'projectId' | 'token' | 'status' | 'previewUrl' | 'comments' | 'updatedAt'>> = [
  { slug: 'footer-cta-get-demo', experimentId: 'exp_footer', experimentName: 'Footer', idea: 'Replace passive footer CTA with a demo request to capture high-intent visitors.', copyChanges: [{ selector: 'footer .cta', original: 'Learn more', variant: 'Get a demo' }] },
  { slug: 'signup-headline-time-to-value', experimentId: 'exp_signup', experimentName: 'Sign Up Page', idea: 'Lead with time-to-value to reduce drop-off on the sign-up form.', copyChanges: [{ selector: '.signup h1', original: 'Create your account', variant: 'Start seeing results in 10 minutes' }] },
  { slug: 'features-subheading-outcome', experimentId: 'exp_features', experimentName: 'Features Section', idea: 'Reframe feature names as customer outcomes rather than product capabilities.', copyChanges: [{ selector: '.features h2', original: 'Powerful integrations', variant: 'Connect your stack in minutes, not months' }] },
  { slug: 'testimonials-social-proof-number', experimentId: 'exp_testimonials', experimentName: 'Testimonials', idea: 'Anchor the testimonials section with a hard number to increase credibility.', copyChanges: [{ selector: '.testimonials h2', original: 'What our customers say', variant: 'Join 2,400+ teams already shipping faster' }] },
  { slug: 'pricing-toggle-annual-default', experimentId: 'exp_pricing_section', experimentName: 'Pricing Section', idea: 'Default the billing toggle to annual to anchor users on the lower monthly number.', copyChanges: [{ selector: '.billing-toggle .label', original: 'Monthly', variant: 'Annual (save 40%)' }] },
  { slug: 'nav-login-secondary', experimentId: 'exp_nav_cta', experimentName: 'Nav Bar CTA', idea: 'Reduce visual competition between Login and primary CTA by making Login a text link.', copyChanges: [{ selector: 'nav .login', original: 'Log in', variant: 'Sign in' }] },
  { slug: 'hero-subheading-pain-point', experimentId: 'exp_homepage_hero', experimentName: 'Homepage Hero', idea: 'Lead with a pain point instead of a solution to create stronger initial resonance.', copyChanges: [{ selector: 'hero .subheadline', original: 'Optimize your website with AI', variant: 'Stop guessing which copy converts' }] },
];

export function deleteVariant(id: string, token: string): boolean {
  const idx = store.findIndex(v => v.id === id && v.token === token);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}

export function createRandomVariant(): Variant {
  const maxNum = store.reduce((max, v) => {
    const n = parseInt(v.id.split('-')[1] ?? '0', 10);
    return n > max ? n : max;
  }, 0);
  const id = `CLNT-${String(maxNum + 1).padStart(3, '0')}`;
  const tpl = RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)];

  const variant: Variant = {
    id,
    slug: tpl.slug,
    experimentId: tpl.experimentId,
    experimentName: tpl.experimentName,
    customerSlug: 'CLNT',
    projectId: 'proj_clnt_website',
    token: 'tok_demo_clnt_123',
    status: 'draft',
    idea: tpl.idea,
    copyChanges: tpl.copyChanges,
    previewUrl: `https://www.acmecorp.com/?variant_id=${id}&slug=${tpl.slug}`,
    comments: [],
    updatedAt: new Date().toISOString(),
  };
  store.push(variant);
  return variant;
}
