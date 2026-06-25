"use client";

import React, { useState } from "react";
import { ArrowRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeSubmitModal } from "@/components/ResumeSubmitModal";

/**
 * Client-side CTA card for the homepage "Get Discovered by Top Recruiters"
 * section. Replaces the static <Link> with a button that opens the
 * ResumeSubmitModal.
 */
export function SubmitResumeCTA() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Seeker CTA Card */}
      <div className="group rounded-3xl border border-border/60 bg-card/50 backdrop-blur p-8 shadow-sm hover:shadow-xl hover:border-primary/30 transition duration-300 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">
              Get Discovered by Top Recruiters
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload your medical resume and experience details to let
              recruitment specialists match you with premium healthcare
              facilities.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <Button
            size="lg"
            className="w-full sm:w-auto font-semibold shadow-md rounded-2xl"
            onClick={() => setModalOpen(true)}
          >
            Submit Resume <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* Modal */}
      <ResumeSubmitModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
