import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CATEGORIES, JOB_TYPES, jobStore, useJobs, type JobPosting } from "@/lib/jobs";
import { Modal } from "@/components/Modal";
import { JobForm } from "@/components/JobForm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Noticeboard — Job Postings" },
      { name: "description", content: "Browse, add, edit and manage job postings by category and work type." },
      { property: "og:title", content: "Noticeboard — Job Postings" },
      { property: "og:description", content: "Browse, add, edit and manage job postings by category and work type." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type SortKey = "newest" | "oldest" | "title";

function Index() {
  const jobs = useJobs();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [type, setType] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("newest");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<JobPosting | null>(null);
  const [deleting, setDeleting] = useState<JobPosting | null>(null);
  const [viewing, setViewing] = useState<JobPosting | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    jobs.forEach((j) => (c[j.category] = (c[j.category] ?? 0) + 1));
    return c;
  }, [jobs]);

  const visible = useMemo(() => {
    const s = q.trim().toLowerCase();
    return jobs
      .filter((j) => cat === "All" || j.category === cat)
      .filter((j) => type === "All" || j.type === type)
      .filter((j) => !s || [j.title, j.companyName, j.location, j.description].some((f) => f.toLowerCase().includes(s)))
      .sort((a, b) => sort === "title" ? a.title.localeCompare(b.title) : sort === "oldest" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt);
  }, [jobs, q, cat, type, sort]);

  return (
    <div className="min-h-screen">
      <header className="border-b-2 border-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-6 py-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Est. 2026 · Job Postings</p>
            <h1 className="font-display text-5xl text-foreground md:text-6xl">The Noticeboard</h1>
          </div>
          <button className="btn-primary" onClick={() => setAdding(true)}>+ Add a new job</button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-[220px_1fr]">
        <aside>
          <h2 className="field-label mb-2">Categories</h2>
          <ul className="space-y-1">
            {["All", ...CATEGORIES].map((c) => (
              <li key={c}>
                <button
                  onClick={() => setCat(c)}
                  className={`flex w-full justify-between rounded px-3 py-1.5 text-left text-sm transition ${cat === c ? "bg-foreground text-background" : "hover:bg-muted"}`}
                >
                  <span>{c}</span>
                  <span className="opacity-60">{c === "All" ? jobs.length : counts[c] ?? 0}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section>
          <div className="mb-6 flex flex-wrap gap-3">
            <input className="field min-w-[200px] flex-1" placeholder="Search title, company, location…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search" />
            <select className="field w-auto" value={type} onChange={(e) => setType(e.target.value)} aria-label="Job type filter">
              <option>All</option>{JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select className="field w-auto" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort">
              <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="title">Title A–Z</option>
            </select>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">{visible.length} of {jobs.length} postings</p>

          {visible.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-border p-12 text-center text-muted-foreground">No job postings match your filters.</div>
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {visible.map((j) => (
                <li key={j.id} data-testid="job-card" className="group flex flex-col rounded-lg border border-border bg-card p-5 shadow-paper transition hover:-translate-y-0.5">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="tag tag-accent">{j.category}</span>
                    <span className="tag">{j.type}</span>
                  </div>
                  <h3 className="font-display text-2xl leading-tight text-foreground">{j.title}</h3>
                  <p className="text-sm text-muted-foreground">{j.companyName} · {j.location}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-foreground/80">{j.description}</p>
                  <div className="mt-auto flex gap-2 pt-4">
                    <button className="btn-ghost" onClick={() => setViewing(j)}>View</button>
                    <button className="btn-ghost" onClick={() => setEditing(j)}>Edit</button>
                    <button className="btn-ghost text-destructive" onClick={() => setDeleting(j)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add a new job" wide>
        <JobForm submitLabel="Add job" onCancel={() => setAdding(false)} onSubmit={(v) => { jobStore.add(v); setAdding(false); flash("Job added"); }} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit job" wide>
        {editing && (
          <JobForm key={editing.id} initial={editing} submitLabel="Save changes" onCancel={() => setEditing(null)}
            onSubmit={(v) => { jobStore.update(editing.id, v); setEditing(null); flash("Job updated"); }} />
        )}
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete job?">
        <p className="text-sm text-muted-foreground">“{deleting?.title}” at {deleting?.companyName} will be permanently removed.</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
          <button className="btn-danger" onClick={() => { if (deleting) jobStore.remove(deleting.id); setDeleting(null); flash("Job deleted"); }}>Delete</button>
        </div>
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.title ?? ""} wide>
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2"><span className="tag tag-accent">{viewing.category}</span><span className="tag">{viewing.type}</span><span className="tag">{viewing.location}</span></div>
            {([["Company", `${viewing.companyName}${viewing.companyInfo ? " — " + viewing.companyInfo : ""}`], ["Description", viewing.description], ["Requirements", viewing.requirements], ["Additional info", viewing.additionalInfo], ["How to apply", viewing.howToApply]] as const).map(([k, val]) => val && (
              <div key={k}><h4 className="field-label">{k}</h4><p className="whitespace-pre-line text-foreground">{val}</p></div>
            ))}
          </div>
        )}
      </Modal>

      {toast && <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded bg-foreground px-4 py-2 text-sm text-background shadow-paper">{toast}</div>}
    </div>
  );
}
