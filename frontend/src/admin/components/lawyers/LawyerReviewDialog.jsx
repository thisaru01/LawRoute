import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Award,
  Globe2,
  Scale,
  Copy,
  Check,
  ChevronRight,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { toast } from "sonner";

// ── helpers ──────────────────────────────────────────────────────────────────

function statusClass(s) {
  if (s === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "rejected") return "bg-red-50 text-red-600 border-red-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

// ── small building blocks ─────────────────────────────────────────────────────

const Section = ({ icon: Icon, title, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-gray-400" />
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, value, copyable = false }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value ?? "");
    setCopied(true);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="group flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
      <div className="flex items-center gap-1.5 min-h-5">
        <span className="text-sm text-gray-900 font-medium break-all">{value || <span className="text-gray-300 italic">—</span>}</span>
        {copyable && value && (
          <button onClick={copy} className="p-0.5 rounded text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-600 transition-all">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
};

const Tag = ({ children }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
    {children}
  </span>
);

const CopyBarId = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Bar Registration ID copied");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-[11px] font-medium bg-amber-100 hover:bg-amber-200 text-amber-700 hover:text-amber-900 px-2.5 py-1 rounded-md transition-all duration-150 border border-amber-200"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

// ── main component ────────────────────────────────────────────────────────────

export default function LawyerReviewDialog({
  open,
  onOpenChange,
  lawyer,
  onApprove,
  onReject,
  isBusy,
}) {
  if (!lawyer) return null;

  const user = lawyer.user || {};
  const userId = user.id;
  const basic = lawyer.basicInfo || {};
  const contact = basic.contactInfo || {};
  const edu = lawyer.educationQualifications || {};
  const exp = lawyer.experience || {};
  const status = String(lawyer.verificationStatus || "pending").toLowerCase();

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("") || "L";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 px-6 py-5 border-b bg-white">
          <Avatar className="w-24 h-24 border-2 border-gray-200 flex-shrink-0">
            <AvatarImage src={user.profilePhoto} className="object-cover" />
            <AvatarFallback className="bg-gray-100 text-gray-600 font-bold text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h2>
            <p className="text-sm text-gray-500 truncate">{basic.professionalTitle || "Attorney at Law"}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {lawyer.expertise && (
                <Tag>{lawyer.expertise.replace("_", " ")}</Tag>
              )}
              {lawyer.isFree && <Tag>Free Consultation</Tag>}
            </div>
          </div>
          <Badge variant="outline" className={`flex-shrink-0 capitalize text-xs px-3 py-1 ${statusClass(status)}`}>
            {status}
          </Badge>
        </div>

        {/* ── Body — two-column ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

            {/* Left — main details */}
            <div className="lg:col-span-2 p-6 space-y-8">

              {/* Bio */}
              <Section icon={Briefcase} title="About">
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {basic.bio || <span className="italic text-gray-400">No biography provided.</span>}
                </p>
              </Section>

              {/* Skills */}
              <div className="grid grid-cols-2 gap-6">
                <Section icon={Globe2} title="Languages">
                  <div className="flex flex-wrap gap-1.5">
                    {basic.languages?.length > 0
                      ? basic.languages.map((l, i) => <Tag key={i}>{l}</Tag>)
                      : <span className="text-xs text-gray-400 italic">None listed</span>}
                  </div>
                </Section>
                <Section icon={Scale} title="Practice Areas">
                  <div className="flex flex-wrap gap-1.5">
                    {basic.practiceAreas?.length > 0
                      ? basic.practiceAreas.map((a, i) => <Tag key={i}>{a.name}</Tag>)
                      : <span className="text-xs text-gray-400 italic">None listed</span>}
                  </div>
                </Section>
              </div>

              <Separator />

              {/* Education */}
              <Section icon={GraduationCap} title="Education">
                {edu.education?.length > 0 ? (
                  <div className="space-y-3">
                    {edu.education.map((item, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-gray-950">{item.degree}</p>
                          <p className="text-xs text-gray-700 font-medium">{item.institute} • {item.graduationYear}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No education history.</p>
                )}
              </Section>

              {/* Certifications */}
              <Section icon={Award} title="Certifications">
                {edu.certifications?.length > 0 ? (
                  <div className="space-y-3">
                    {edu.certifications.map((item, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-gray-950">{item.title}</p>
                          <p className="text-xs text-gray-700 font-medium">{item.issuer} • {item.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No certifications.</p>
                )}
              </Section>

              {/* Work History */}
              <Section icon={ShieldCheck} title="Work History">
                {exp.workHistory?.length > 0 ? (
                  <div className="space-y-4">
                    {exp.workHistory.map((w, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-gray-950">{w.position}</p>
                          <p className="text-xs text-gray-700 font-medium">{w.organization} • {w.year}</p>
                          {w.description && <p className="text-xs text-gray-800 mt-1 line-clamp-2 font-medium">{w.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No work history.</p>
                )}
              </Section>

            </div>

            {/* Right — sidebar */}
            <div className="p-6 space-y-6 bg-gray-50/50">

              <Section icon={Mail} title="Contact">
                <div className="space-y-3">
                  <Field label="Email" value={user.email} />
                  <Field label="Phone" value={contact.phone} />
                  <Field label="Office Address" value={contact.officeAddress} />
                  <Field label="Location" value={contact.location} />
                </div>
              </Section>

              <Separator />

              <Section icon={Scale} title="Credentials">
                <div className="space-y-3">
                  {/* Highlighted Bar Registration */}
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Bar Registration ID</span>
                    <div className="mt-1.5 flex items-center justify-between gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 group">
                      <span className="font-mono font-bold tracking-widest text-sm text-amber-900">
                        {lawyer.barRegistrationNumber || <span className="text-amber-400 italic font-sans font-normal tracking-normal">Not Provided</span>}
                      </span>
                      {lawyer.barRegistrationNumber && (
                        <CopyBarId value={lawyer.barRegistrationNumber} />
                      )}
                    </div>
                  </div>
                  <Field
                    label="Memberships"
                    value={
                      Array.isArray(lawyer.memberships)
                        ? lawyer.memberships.join(", ")
                        : lawyer.memberships
                    }
                  />
                </div>
              </Section>

              {/* Quick tips removed */}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 py-4 border-t bg-white flex flex-row items-center justify-between gap-3">
          <DialogClose asChild>
            <Button variant="ghost" className="text-gray-500">Close</Button>
          </DialogClose>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
              onClick={() => onReject?.(userId)}
              disabled={isBusy || status === "rejected"}
            >
              <UserMinus className="w-4 h-4" />
              {isBusy ? "Updating…" : "Reject"}
            </Button>

            <Button
              className="bg-gray-900 hover:bg-gray-700 text-white gap-2"
              onClick={() => onApprove?.(userId)}
              disabled={isBusy || status === "approved" || !lawyer.profileCompleted}
            >
              <UserCheck className="w-4 h-4" />
              {isBusy ? "Updating…" : "Approve"}
            </Button>
          </div>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
