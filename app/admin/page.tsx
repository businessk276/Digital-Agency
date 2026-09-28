"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AdminShell, Field, inputClass } from "@/components/AdminShell";
import { isFirebaseConfigured } from "@/lib/firebase";
import { defaultHeroTitles } from "@/lib/content";
import { getHeroTitles, saveHeroTitles } from "@/lib/firestore";
import type { HeroTitles } from "@/lib/types";

export default function AdminHome() {
  const [heroTitles, setHeroTitles] = useState<HeroTitles>({ ...defaultHeroTitles });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const cards = [
    { href: "/admin/services", title: "Services", body: "Manage the services shown on the public site." },
    { href: "/admin/projects", title: "Projects", body: "Publish portfolio work with a live website link. The landing page preview is generated automatically." },
    { href: "/admin/tasks", title: "Tasks", body: "Publish work updates and campaign tasks." },
    { href: "/admin/videos", title: "Video Editing", body: "Showcase previous video editing work from YouTube or Google Drive." },
    { href: "/admin/designs", title: "Poster & Banners", body: "Add poster and banner designs from Google Drive." },
  ];

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    getHeroTitles()
      .then((titles) => {
        if (titles) setHeroTitles((current) => ({ ...current, ...titles }));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load hero titles."))
      .finally(() => setLoading(false));
  }, []);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await saveHeroTitles({
        en: heroTitles.en.trim(),
        bn: heroTitles.bn.trim(),
        ar: heroTitles.ar.trim(),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save hero titles.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-slate-500">Manage everything that appears on the public site.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:border-accent">
            <h2 className="text-xl font-medium">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{card.body}</p>
          </Link>
        ))}
      </div>
      <section className="mt-8 max-w-4xl rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
        <h2 className="text-2xl font-semibold">Hero section title</h2>
        <p className="mt-2 text-sm text-slate-500">Edit the title shown on the homepage in each language.</p>
        <form onSubmit={onSave} className="mt-6 grid gap-4">
          <Field label="English title">
            <textarea className={`${inputClass} !rounded-xl`} rows={3} required value={heroTitles.en} disabled={loading || saving} onChange={(event) => setHeroTitles({ ...heroTitles, en: event.target.value })} />
          </Field>
          <Field label="বাংলা শিরোনাম (Bengali)">
            <textarea className={`${inputClass} !rounded-xl`} rows={3} required value={heroTitles.bn} disabled={loading || saving} onChange={(event) => setHeroTitles({ ...heroTitles, bn: event.target.value })} />
          </Field>
          <Field label="العنوان بالعربية (Arabic)">
            <textarea className={`${inputClass} !rounded-xl`} rows={3} required dir="rtl" value={heroTitles.ar} disabled={loading || saving} onChange={(event) => setHeroTitles({ ...heroTitles, ar: event.target.value })} />
          </Field>
          {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
          {saved ? <p role="status" className="text-sm text-green-700">Hero titles saved.</p> : null}
          <div>
            <button type="submit" disabled={loading || saving || !isFirebaseConfigured} className="rounded-full bg-accent px-5 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Loading titles…" : saving ? "Saving…" : "Save hero titles"}
            </button>
          </div>
        </form>
      </section>
    </AdminShell>
  );
}
