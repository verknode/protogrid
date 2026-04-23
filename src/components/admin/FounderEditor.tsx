"use client";

import { useState, useTransition, useRef } from "react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { upsertFounderProfile } from "@/app/actions/founderActions";
import { Upload, X, Check } from "lucide-react";
import Image from "next/image";

type Profile = {
  id: string;
  name: string;
  title: string;
  shortBio: string;
  longText: string;
  imageUrl: string | null;
  imageKey: string | null;
};

const inputClass =
  "w-full h-11 px-4 bg-transparent border border-iris-dusk/40 rounded-sm text-[13px] text-cold-pearl placeholder:text-iris-dusk focus:outline-none focus:border-lavender-smoke transition-colors duration-150";

const labelClass =
  "block font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk mb-2";

export function FounderEditor({ initial }: { initial: Profile | null }) {
  const [name,     setName]     = useState(initial?.name     ?? "Andrii Ustymenko");
  const [title,    setTitle]    = useState(initial?.title    ?? "Founder · ProtoGrid");
  const [shortBio, setShortBio] = useState(initial?.shortBio ?? "");
  const [longText, setLongText] = useState(initial?.longText ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? null as string | null);
  const [imageKey, setImageKey] = useState(initial?.imageKey ?? null as string | null);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("founderPhoto", {
    onClientUploadComplete(res) {
      const f = res[0];
      if (f) { setImageUrl(f.url); setImageKey(f.key); }
      setUploadError(null);
    },
    onUploadError(err) {
      setUploadError(err.message?.includes("{") ? "Upload failed. Try a smaller image." : (err.message ?? "Upload failed"));
    },
  });

  function handleSave() {
    setError(null);
    setSaved(false);
    if (!shortBio.trim() || !longText.trim()) {
      setError("Short bio and description are required.");
      return;
    }
    startTransition(async () => {
      const result = await upsertFounderProfile({
        name: name.trim(),
        title: title.trim(),
        shortBio: shortBio.trim(),
        longText: longText.trim(),
        ...(imageUrl ? { imageUrl } : {}),
        ...(imageKey ? { imageKey } : {}),
      });
      if ("error" in result) { setError(result.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Photo */}
      <div>
        <p className={labelClass}>Founder photo</p>
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-sm border border-iris-dusk/40 overflow-hidden shrink-0 bg-iris-dusk/10 flex items-center justify-center">
            {imageUrl ? (
              <Image src={imageUrl} alt="Founder" width={80} height={80} className="w-full h-full object-cover" />
            ) : (
              <Upload size={16} className="text-iris-dusk" />
            )}
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              className="h-9 px-4 border border-iris-dusk/40 rounded-sm font-technical text-[11px] tracking-[0.08em] text-lavender-smoke hover:border-iris-dusk/60 hover:text-cold-pearl disabled:opacity-40 transition-colors duration-150"
            >
              {isUploading ? "Uploading..." : imageUrl ? "Replace photo" : "Upload photo"}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => { setImageUrl(null); setImageKey(null); }}
                className="flex items-center gap-1.5 font-technical text-[10px] tracking-[0.06em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
              >
                <X size={11} /> Remove
              </button>
            )}
            <p className="font-technical text-[10px] text-iris-dusk/60">JPG, PNG — max 4 MB</p>
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (files.length) startUpload(files);
          }}
        />
        <div className="min-h-[16px] mt-2">
          {uploadError && <p className="font-technical text-[11px] text-red-400">{uploadError}</p>}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className={labelClass}>Founder name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Andrii Ustymenko" className={inputClass} />
      </div>

      {/* Title */}
      <div>
        <label className={labelClass}>Founder title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Founder · ProtoGrid" className={inputClass} />
      </div>

      {/* Short bio */}
      <div>
        <label className={labelClass}>Short bio <span className="text-iris-dusk/60 normal-case tracking-normal">shown in homepage preview</span></label>
        <textarea
          value={shortBio}
          onChange={(e) => setShortBio(e.target.value)}
          rows={3}
          placeholder="One to two sentences — visible in the short preview."
          className="w-full px-4 py-3 bg-transparent border border-iris-dusk/40 rounded-sm text-[13px] text-cold-pearl placeholder:text-iris-dusk focus:outline-none focus:border-lavender-smoke transition-colors duration-150 resize-none"
        />
      </div>

      {/* Long text */}
      <div>
        <label className={labelClass}>Full founder text <span className="text-iris-dusk/60 normal-case tracking-normal">shown on /about</span></label>
        <textarea
          value={longText}
          onChange={(e) => setLongText(e.target.value)}
          rows={10}
          placeholder="Full founder description shown on the About page."
          className="w-full px-4 py-3 bg-transparent border border-iris-dusk/40 rounded-sm text-[13px] text-cold-pearl placeholder:text-iris-dusk focus:outline-none focus:border-lavender-smoke transition-colors duration-150 resize-none"
        />
      </div>

      {error   && <p className="font-technical text-[11px] text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending || isUploading}
        className="h-11 px-6 bg-cold-pearl text-ink-shadow text-[13px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
      >
        {saved && <Check size={13} />}
        {isPending ? "Saving..." : saved ? "Saved" : "Save changes"}
      </button>
    </div>
  );
}
