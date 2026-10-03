/**
 * Fills an empty database with sample content so the site renders end to end.
 * Every entry is a placeholder: edit or replace it from /admin.
 *
 *   pnpm seed            # only seeds collections that are empty
 *   pnpm seed --force    # wipes content tables first (messages and analytics untouched)
 */
import { createClient } from "@supabase/supabase-js";
import { fromRow, toRow } from "../src/lib/rows";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const force = process.argv.includes("--force");

const profile = {
  name: "Gloire Mutaliko",
  role: { en: "Senior software engineer", fr: "Ingénieur logiciel senior" },
  headline: {
    en: "I design and ship TypeScript products end to end, from the React interface to the NestJS API and the infrastructure under it.",
    fr: "Je conçois et livre des produits TypeScript de bout en bout, de l’interface React à l’API NestJS et à l’infrastructure qui les porte.",
  },
  bio: {
    en: "I am a full-stack engineer who cares about the whole path a feature travels: the data model, the API contract, the interface and how it behaves in production.\n\nMost of my work happens in TypeScript. On the front, React and Next.js with a strong eye for performance and accessibility. On the back, NestJS services, MongoDB and PostgreSQL, queues and the CI that keeps it all honest.\n\nI like small teams, written decisions and code that the next person can read without me in the room.",
    fr: "Je suis ingénieur full-stack et je m’intéresse à tout le trajet d’une fonctionnalité : le modèle de données, le contrat d’API, l’interface et son comportement en production.\n\nJe travaille surtout en TypeScript. Côté front, React et Next.js, avec une attention forte à la performance et à l’accessibilité. Côté back, des services NestJS, MongoDB et PostgreSQL, des files de messages et la CI qui garde le tout fiable.\n\nJ’aime les petites équipes, les décisions écrites et un code que la personne suivante peut lire sans moi dans la pièce.",
  },
  location: { en: "Remote, Europe", fr: "À distance, Europe" },
  email: "",
  yearsOfExperience: 8,
  available: true,
  availability: { en: "", fr: "" },
  avatar: null,
  cv: null,
  socials: [
    { label: "GitHub", url: "https://github.com/" },
    { label: "LinkedIn", url: "https://www.linkedin.com/" },
  ],
  calLink: "",
};

const skills: { name: string; category: string; level: number }[] = [
  { name: "TypeScript", category: "frontend", level: 5 },
  { name: "React", category: "frontend", level: 5 },
  { name: "Next.js", category: "frontend", level: 5 },
  { name: "Tailwind CSS", category: "frontend", level: 4 },
  { name: "Three.js", category: "frontend", level: 3 },
  { name: "React Native", category: "frontend", level: 3 },
  { name: "NestJS", category: "backend", level: 5 },
  { name: "Node.js", category: "backend", level: 5 },
  { name: "GraphQL", category: "backend", level: 4 },
  { name: "REST APIs", category: "backend", level: 5 },
  { name: "WebSockets", category: "backend", level: 3 },
  { name: "MongoDB", category: "data", level: 4 },
  { name: "PostgreSQL", category: "data", level: 4 },
  { name: "Redis", category: "data", level: 3 },
  { name: "Prisma", category: "data", level: 4 },
  { name: "Docker", category: "devops", level: 4 },
  { name: "AWS", category: "devops", level: 3 },
  { name: "Vercel", category: "devops", level: 4 },
  { name: "GitHub Actions", category: "devops", level: 4 },
  { name: "Jest", category: "tools", level: 4 },
  { name: "Playwright", category: "tools", level: 4 },
  { name: "Figma", category: "tools", level: 3 },
];

const experiences = [
  {
    company: "Northwind Labs",
    role: { en: "Senior software engineer", fr: "Ingénieur logiciel senior" },
    location: { en: "Remote", fr: "À distance" },
    start: "2022-03",
    end: null,
    summary: {
      en: "Lead engineer on a B2B platform used by logistics teams to plan and track deliveries.",
      fr: "Ingénieur principal sur une plateforme B2B utilisée par des équipes logistiques pour planifier et suivre leurs livraisons.",
    },
    highlights: [
      { en: "Moved the web app from a client-only React SPA to Next.js, halving time to first content.", fr: "Migration de l’application d’une SPA React vers Next.js, divisant par deux le temps d’affichage initial." },
      { en: "Split a monolith into NestJS services behind a typed API gateway.", fr: "Découpage d’un monolithe en services NestJS derrière une passerelle d’API typée." },
      { en: "Mentored four engineers and set up the team’s written review process.", fr: "Accompagnement de quatre ingénieurs et mise en place d’un processus de revue écrit." },
    ],
    stack: ["TypeScript", "Next.js", "NestJS", "PostgreSQL", "AWS"],
  },
  {
    company: "Brightpath",
    role: { en: "Full-stack engineer", fr: "Ingénieur full-stack" },
    location: { en: "Paris, hybrid", fr: "Paris, hybride" },
    start: "2019-01",
    end: "2022-02",
    summary: {
      en: "Built the customer dashboard and billing flows of a subscription product.",
      fr: "Construction du tableau de bord client et des parcours de facturation d’un produit par abonnement.",
    },
    highlights: [
      { en: "Designed the component library shared by three product teams.", fr: "Conception de la bibliothèque de composants partagée par trois équipes produit." },
      { en: "Built the billing service and its payment provider integration.", fr: "Développement du service de facturation et de son intégration au prestataire de paiement." },
    ],
    stack: ["React", "Node.js", "MongoDB", "GraphQL"],
  },
  {
    company: "Studio Kivu",
    role: { en: "Frontend developer", fr: "Développeur frontend" },
    location: { en: "Remote", fr: "À distance" },
    start: "2017-02",
    end: "2018-12",
    summary: {
      en: "Shipped marketing sites and web apps for agency clients.",
      fr: "Livraison de sites et d’applications web pour les clients d’une agence.",
    },
    highlights: [],
    stack: ["JavaScript", "React", "Sass"],
  },
];

const projects = [
  {
    slug: "fleetboard",
    title: { en: "Fleetboard", fr: "Fleetboard" },
    summary: {
      en: "Real-time delivery tracking for logistics teams, with live maps and ETA predictions.",
      fr: "Suivi des livraisons en temps réel pour équipes logistiques, avec cartes en direct et prédiction d’arrivée.",
    },
    description: {
      en: "Fleetboard gives dispatchers one screen to follow every vehicle on the road.\n\nThe web client is built with Next.js and streams positions over WebSockets from a NestJS gateway. Positions are stored in MongoDB time-series collections and summarised every minute.",
      fr: "Fleetboard donne aux répartiteurs un seul écran pour suivre chaque véhicule sur la route.\n\nLe client web est construit avec Next.js et reçoit les positions en WebSocket depuis une passerelle NestJS. Les positions sont stockées dans des collections time-series MongoDB et agrégées chaque minute.",
    },
    tags: ["Next.js", "NestJS", "MongoDB", "WebSockets"],
    year: 2025,
    featured: true,
  },
  {
    slug: "ledgerly",
    title: { en: "Ledgerly", fr: "Ledgerly" },
    summary: {
      en: "Invoicing and expense tracking for freelancers, with automatic VAT reports.",
      fr: "Facturation et suivi des dépenses pour indépendants, avec rapports de TVA automatiques.",
    },
    description: {
      en: "Ledgerly turns bank exports into categorised expenses and produces the quarterly VAT summary in one click.\n\nA NestJS API with PostgreSQL and Prisma, a React front end, and a background worker for imports.",
      fr: "Ledgerly transforme les exports bancaires en dépenses classées et produit le récapitulatif de TVA trimestriel en un clic.\n\nUne API NestJS avec PostgreSQL et Prisma, un front React et un worker pour les imports.",
    },
    tags: ["React", "NestJS", "PostgreSQL", "Prisma"],
    year: 2024,
    featured: true,
  },
  {
    slug: "atlas-ui",
    title: { en: "Atlas UI", fr: "Atlas UI" },
    summary: {
      en: "An accessible React component library with tokens, docs and visual tests.",
      fr: "Une bibliothèque de composants React accessible, avec tokens, documentation et tests visuels.",
    },
    description: {
      en: "Atlas UI is a set of forty components built on design tokens, documented with live examples and covered by Playwright visual tests.",
      fr: "Atlas UI regroupe quarante composants construits sur des design tokens, documentés avec des exemples interactifs et couverts par des tests visuels Playwright.",
    },
    tags: ["React", "TypeScript", "Tailwind CSS", "Playwright"],
    year: 2023,
    featured: true,
  },
  {
    slug: "orbit-3d",
    title: { en: "Orbit", fr: "Orbit" },
    summary: {
      en: "An interactive 3D explorer for dependency graphs of JavaScript monorepos.",
      fr: "Un explorateur 3D interactif des graphes de dépendances de monorepos JavaScript.",
    },
    description: {
      en: "Orbit reads a workspace lockfile and draws every package as a node you can fly around, with cycles and heavy dependencies highlighted.",
      fr: "Orbit lit le lockfile d’un workspace et dessine chaque paquet comme un nœud que l’on peut survoler, en signalant les cycles et les dépendances lourdes.",
    },
    tags: ["Three.js", "React", "Next.js"],
    year: 2024,
    featured: true,
  },
  {
    slug: "pulse-api",
    title: { en: "Pulse API", fr: "Pulse API" },
    summary: {
      en: "A small NestJS service for uptime checks and status pages.",
      fr: "Un petit service NestJS de surveillance de disponibilité et de pages de statut.",
    },
    description: {
      en: "Pulse pings endpoints on a schedule, stores results in Redis and MongoDB, and renders a public status page.",
      fr: "Pulse interroge des endpoints à intervalle régulier, stocke les résultats dans Redis et MongoDB, et affiche une page de statut publique.",
    },
    tags: ["NestJS", "Redis", "MongoDB", "Docker"],
    year: 2023,
    featured: false,
  },
];

type Entity = "profile" | "skill" | "experience" | "project";

async function seedTable(table: string, entity: Entity, items: Record<string, unknown>[], ordered = true) {
  if (force) {
    const { error } = await db.from(table).delete().not("id", "is", null);
    if (error) throw error;
  }
  const { count, error: countError } = await db.from(table).select("id", { count: "exact", head: true });
  if (countError) throw countError;
  if (count) {
    console.log(`- ${table}: already has data, skipped`);
    return;
  }
  const { data, error } = await db
    .from(table)
    .insert(items.map((item, i) => toRow(ordered ? { order: i, ...item } : item)))
    .select();
  if (error) throw error;
  const revisions = data.map((row) => {
    const snapshot = fromRow<Record<string, unknown>>(row);
    const title = snapshot.title as { fr?: string } | undefined;
    return {
      entity,
      entity_id: row.id,
      version: 1,
      action: "create",
      label: String(snapshot.name ?? snapshot.company ?? title?.fr ?? ""),
      snapshot,
    };
  });
  const { error: revError } = await db.from("revisions").insert(revisions);
  if (revError) throw revError;
  console.log(`- ${table}: ${data.length} added`);
}

async function main() {
  if (force) {
    const { error } = await db.from("revisions").delete().not("id", "is", null);
    if (error) throw error;
  }
  await seedTable("profile", "profile", [profile], false);
  await seedTable("skills", "skill", skills);
  await seedTable("experiences", "experience", experiences);
  await seedTable("projects", "project", projects.map((p) => ({ published: true, images: [], ...p })));
  console.log("Done. Restart `pnpm dev` (or save a change in /admin) to refresh cached pages.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
