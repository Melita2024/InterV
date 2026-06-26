"use client";

import { useEffect, useState } from "react";
import { ListChecks, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const QuestionsModal = ({ questions }: { questions?: string[] }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!questions || questions.length === 0) return null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="!rounded-full gap-2 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <ListChecks className="size-4" />
        View Interview Questions
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="card-border w-full max-w-lg max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card flex flex-col gap-4 p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3>Interview Questions</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-light-400 hover:text-white cursor-pointer"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>

              <ol className="flex flex-col gap-3 list-decimal list-inside text-light-100">
                {questions.map((question, index) => (
                  <li key={index} className="text-sm leading-relaxed">
                    {question}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionsModal;
