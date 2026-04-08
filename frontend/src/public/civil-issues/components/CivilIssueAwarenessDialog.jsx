import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  Info,
  ShieldAlert,
} from "lucide-react";
import {
  CIVIL_ISSUE_AWARENESS_DISCLAIMER,
  CIVIL_ISSUE_CATEGORY_KEYS,
  getAwarenessByCategory,
} from "@/public/civil-issues/awareness/awarenessContent.js";
import { CIVIL_ISSUE_CATEGORIES } from "@/constants/civilIssueConstants.js";

const CATEGORY_LABELS = Object.fromEntries(
  CIVIL_ISSUE_CATEGORIES.map((item) => [item.value, item.label]),
);

export default function CivilIssueAwarenessDialog({
  selectedCategory = "",
  triggerLabel = "Awareness Q&A",
  triggerVariant = "outline",
  triggerClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    selectedCategory && CIVIL_ISSUE_CATEGORY_KEYS.includes(selectedCategory)
      ? selectedCategory
      : CIVIL_ISSUE_CATEGORY_KEYS[0],
  );
  const [openFaqIndex, setOpenFaqIndex] = useState(-1);

  const awareness = useMemo(() => getAwarenessByCategory(activeCategory), [activeCategory]);

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setOpenFaqIndex(-1);
      return;
    }

    if (selectedCategory && CIVIL_ISSUE_CATEGORY_KEYS.includes(selectedCategory)) {
      setActiveCategory(selectedCategory);
    }
  };

  const handleCategoryChange = (value) => {
    setActiveCategory(value);
    setOpenFaqIndex(-1);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant={triggerVariant} className={triggerClassName}>
          <BookOpen className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[min(96vw,72rem)] max-w-[96vw] sm:max-w-4xl max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col max-sm:top-0 max-sm:left-0 max-sm:translate-x-0 max-sm:translate-y-0 max-sm:h-[100dvh] max-sm:w-screen max-sm:max-w-none max-sm:rounded-none max-sm:max-h-none">
        <DialogHeader className="shrink-0 border-b border-slate-100 px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <CircleHelp className="h-5 w-5 text-slate-600" />
            Civil Issue Awareness Q&A
          </DialogTitle>
          <DialogDescription>
            Category-focused guidance to help you prepare a clear and complete report.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-5">
          <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="gap-4">
            <div className="overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <TabsList className="h-auto w-max gap-1 p-1 snap-x snap-mandatory">
                {CIVIL_ISSUE_CATEGORY_KEYS.map((key) => (
                  <TabsTrigger key={key} value={key} className="snap-start px-2.5 py-1.5 text-[11px] sm:px-3 sm:text-sm">
                    {CATEGORY_LABELS[key] || key}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="space-y-4">
              {awareness ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                        {awareness.categoryTitle}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700">{awareness.intro}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <h4 className="mb-2 text-sm font-semibold text-slate-900">When to choose this category</h4>
                      <ul className="space-y-1.5 text-sm text-slate-700">
                        {awareness.whenToChoose?.map((item, index) => (
                          <li key={index}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <h4 className="mb-2 text-sm font-semibold text-slate-900">What to include in your report</h4>
                      <ul className="space-y-1.5 text-sm text-slate-700">
                        {awareness.reportChecklist?.map((item, index) => (
                          <li key={index}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                    <h4 className="mb-3 text-sm font-semibold text-slate-900">Frequently Asked Questions</h4>
                    <div className="space-y-2">
                      {(awareness.faqs || []).map((faq, index) => (
                        <Collapsible
                          key={`${faq.question}-${index}`}
                          open={openFaqIndex === index}
                          onOpenChange={(isOpen) => setOpenFaqIndex(isOpen ? index : -1)}
                          className="rounded-lg border border-slate-200"
                        >
                          <CollapsibleTrigger asChild>
                            <button
                              type="button"
                              className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                            >
                              <span>{faq.question}</span>
                              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 data-[state=open]:rotate-180" />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <Separator />
                            <p className="px-3 py-3 text-sm leading-relaxed text-slate-700">{faq.answer}</p>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                        <ShieldAlert className="h-4 w-4" />
                        Escalation note
                      </h4>
                      <p className="text-sm leading-relaxed text-amber-900/90">{awareness.escalation}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No awareness guidance found for this category.</p>
              )}
            </div>
          </Tabs>
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:px-6">
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
            <p>
              <span className="font-semibold text-slate-700">{CIVIL_ISSUE_AWARENESS_DISCLAIMER.title}:</span>{" "}
              {CIVIL_ISSUE_AWARENESS_DISCLAIMER.text}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
