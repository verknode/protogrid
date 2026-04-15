"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitRequest } from "@/app/actions/submitRequest";
import { useSession } from "@/lib/auth-client";
import { useUploadThing } from "@/lib/uploadthing-client";
import { Paperclip, X, Download } from "lucide-react";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;

function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, delay, ease },
  } as const;
}

const schema = z.object({
  name:       z.string().min(2, "Required"),
  email:      z.string().email("Invalid email"),
  message:    z.string().min(10, "Please describe your task"),
  dimensions: z.string().optional(),
  deadline:   z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type UploadedFileInfo = {
  name: string;
  url:  string;
  key:  string;
  size: number;
  type: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const inputClass =
  "w-full h-12 px-4 bg-transparent border border-iris-dusk/40 rounded-sm text-[14px] text-cold-pearl placeholder:text-lavender-smoke/50 focus:outline-none focus:border-lavender-smoke transition-colors duration-150";

const labelClass =
  "block font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke mb-2";

export function Contact() {
  const { data: session, isPending } = useSession();
  const [sent, setSent]                   = useState(false);
  const [sentId, setSentId]               = useState<string | null>(null);
  const [serverError, setServerError]     = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [uploadError, setUploadError]     = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("requestAttachment", {
    onClientUploadComplete(res) {
      const newFiles = res.map((f) => ({
        name: f.name,
        url:  f.url,
        key:  f.key,
        size: f.size,
        type: f.type,
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setUploadError(null);
    },
    onUploadError(err) {
      setUploadError(err.message ?? "Upload failed. Please try again.");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    if (isUploading) {
      setServerError("Please wait for file upload to complete.");
      return;
    }
    const result = await submitRequest({ ...data, files: uploadedFiles });
    if ("error" in result) {
      setServerError(result.error);
      return;
    }
    setSentId(result.id);
    setSent(true);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploadError(null);
    await startUpload(files);
  }

  function removeFile(key: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.key !== key));
  }

  return (
    <section id="contact" className="py-12 lg:py-24 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-16 lg:gap-24">

          {/* Left: header */}
          <div className="lg:sticky lg:top-32 self-start">
            <motion.p
              {...fadeIn(0)}
              className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
            >
              Contact
            </motion.p>
            <motion.h2
              {...fadeIn(0.08)}
              className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-4"
            >
              Send your task
            </motion.h2>
            <motion.p
              {...fadeIn(0.14)}
              className="font-sans text-[15px] leading-[1.68] text-lavender-smoke mb-6"
            >
              Describe what you need. No need to have everything figured out —
              that is what the review step is for.
            </motion.p>
            <motion.p
              {...fadeIn(0.2)}
              className="font-technical text-[12px] tracking-[0.06em] text-iris-dusk"
            >
              Response within 1 business day.
            </motion.p>
          </div>

          {/* Right: form or auth gate */}
          <motion.div {...fadeIn(0.1)}>
            {sent ? (
              <div className="bg-surface border border-iris-dusk/40 rounded-sm p-8">
                <p className="font-display font-bold text-[20px] text-cold-pearl mb-2">
                  Request received.
                </p>
                <p className="font-sans text-[14px] text-lavender-smoke mb-4">
                  We will review it and get back to you within 1 business day.
                </p>
                {sentId && (
                  <Link
                    href={`/account/requests/${sentId}`}
                    className="font-technical text-[12px] tracking-[0.08em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
                  >
                    View in account →
                  </Link>
                )}
              </div>
            ) : !isPending && !session ? (
              <div className="bg-surface border border-iris-dusk/40 rounded-sm p-8">
                <p className="font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke mb-3">
                  Account required
                </p>
                <p className="font-sans text-[15px] leading-[1.68] text-lavender-smoke mb-6">
                  Create a free account to send a request and track its status
                  in your personal dashboard.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/register?from=/contact"
                    className="h-12 px-6 bg-cold-pearl text-ink-shadow text-[13px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-200 inline-flex items-center"
                  >
                    Create account
                  </Link>
                  <Link
                    href="/login?from=/contact"
                    className="h-12 px-6 border border-iris-dusk/50 text-lavender-smoke text-[13px] font-technical tracking-[0.06em] rounded-sm hover:border-lavender-smoke hover:text-cold-pearl transition-colors duration-150 inline-flex items-center"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input {...register("name")} type="text" placeholder="Your name" className={inputClass} />
                    {errors.name && (
                      <p className="mt-1.5 font-technical text-[11px] text-red-400">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input {...register("email")} type="email" placeholder="you@example.com" className={inputClass} />
                    {errors.email && (
                      <p className="mt-1.5 font-technical text-[11px] text-red-400">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Task description */}
                <div>
                  <label className={labelClass}>Task description</label>
                  <textarea
                    {...register("message")}
                    rows={5}
                    placeholder="Describe what you need. Include material, quantity, and any context that helps."
                    className="w-full px-4 py-3 bg-transparent border border-iris-dusk/40 rounded-sm text-[14px] text-cold-pearl placeholder:text-lavender-smoke/50 focus:outline-none focus:border-lavender-smoke transition-colors duration-150 resize-none"
                  />
                  {errors.message && (
                    <p className="mt-1.5 font-technical text-[11px] text-red-400">{errors.message.message}</p>
                  )}
                </div>

                {/* Dimensions + Deadline */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Dimensions{" "}
                      <span className="text-iris-dusk normal-case tracking-normal">optional</span>
                    </label>
                    <input {...register("dimensions")} type="text" placeholder="e.g. 120 × 80 × 40 mm" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Deadline{" "}
                      <span className="text-iris-dusk normal-case tracking-normal">optional</span>
                    </label>
                    <input {...register("deadline")} type="text" placeholder="e.g. end of May, no rush" className={inputClass} />
                  </div>
                </div>

                {/* File attachments */}
                <div>
                  <label className={labelClass}>
                    Files{" "}
                    <span className="text-iris-dusk normal-case tracking-normal">optional</span>
                  </label>
                  <div className="border border-iris-dusk/40 rounded-sm p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-technical text-[11px] tracking-[0.04em] text-iris-dusk">
                        Images, PDF, CAD (.dxf .stl .step…) · Max 32 MB
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 h-8 px-3 border border-iris-dusk/40 rounded-sm font-technical text-[11px] tracking-[0.08em] text-lavender-smoke hover:border-iris-dusk/60 hover:text-cold-pearl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shrink-0"
                      >
                        <Paperclip size={12} />
                        {isUploading ? "Uploading…" : "Attach"}
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.pdf,.dxf,.dwg,.step,.stp,.stl,.iges,.igs,.3dm,.obj"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {uploadError && (
                      <p className="mt-3 font-technical text-[11px] text-red-400">{uploadError}</p>
                    )}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-iris-dusk/15 pt-3">
                        {uploadedFiles.map((file) => (
                          <div key={file.key} className="flex items-center gap-3">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Download size={11} className="text-iris-dusk shrink-0" />
                              <span className="font-technical text-[11px] tracking-[0.04em] text-lavender-smoke truncate">
                                {file.name}
                              </span>
                              <span className="font-technical text-[10px] text-iris-dusk shrink-0">
                                {formatBytes(file.size)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(file.key)}
                              className="text-iris-dusk hover:text-lavender-smoke transition-colors duration-150 shrink-0"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {serverError && (
                  <p className="font-technical text-[11px] text-red-400">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="h-12 px-6 bg-cold-pearl text-ink-shadow text-[13px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 w-full sm:w-auto"
                >
                  {isUploading ? "Uploading files…" : isSubmitting ? "Sending…" : "Send request"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
