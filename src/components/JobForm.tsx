import { useState } from "react";
import { CATEGORIES, JOB_TYPES, type JobInput } from "@/lib/jobs";

const empty: JobInput = {
  title: "", type: "Onsite", category: "IT", location: "", companyName: "", companyInfo: "",
  description: "", requirements: "", additionalInfo: "", howToApply: "",
};

const required: (keyof JobInput)[] = ["title", "location", "companyName", "description", "howToApply"];

export function JobForm({ initial, onSubmit, onCancel, submitLabel }: {
  initial?: JobInput; onSubmit: (j: JobInput) => void; onCancel: () => void; submitLabel: string;
}) {
  const [v, setV] = useState<JobInput>(initial ?? empty);
  const [errors, setErrors] = useState<Partial<Record<keyof JobInput, string>>>({});
  const set = <K extends keyof JobInput>(k: K, val: JobInput[K]) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = Object.fromEntries(
      Object.entries(v).map(([k, x]) => [k, typeof x === "string" ? x.trim() : x]),
    ) as JobInput;
    const errs: typeof errors = {};
    required.forEach((k) => { if (!trimmed[k]) errs[k] = "Required"; });
    if (trimmed.title.length > 120) errs.title = "Max 120 characters";
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit(trimmed);
  };

  const text = (k: keyof JobInput, label: string, area = false) => (
    <label className="block">
      <span className="field-label">{label}{required.includes(k) && " *"}</span>
      {area ? (
        <textarea rows={3} className="field" value={v[k] as string} onChange={(e) => set(k, e.target.value as never)} maxLength={2000} />
      ) : (
        <input className="field" value={v[k] as string} onChange={(e) => set(k, e.target.value as never)} maxLength={200} aria-label={label} />
      )}
      {errors[k] && <span className="text-xs text-destructive">{errors[k]}</span>}
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      {text("title", "Job title")}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="field-label">Job type</span>
          <select className="field" value={v.type} onChange={(e) => set("type", e.target.value as JobInput["type"])}>
            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="field-label">Category</span>
          <select className="field" value={v.category} onChange={(e) => set("category", e.target.value as JobInput["category"])}>
            {CATEGORIES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        {text("location", "Location")}
      </div>
      {text("companyName", "Company name")}
      {text("companyInfo", "Company info", true)}
      {text("description", "Job description", true)}
      {text("requirements", "Requirements (one per line)", true)}
      {text("additionalInfo", "Additional info (salary, bonuses, benefits)", true)}
      {text("howToApply", "How to apply", true)}
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        <button type="submit" className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
