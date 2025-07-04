import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FaqsPage() {
  const navigate = useNavigate(); // ⬅️ Add navigate hook

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-6">
      {/* ⬅️ Back Button at top */}
      <Button
        variant="ghost"
        className="flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <h1 className="text-3xl font-bold text-center">FAQs & Contact Us</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            ❓ What is AI Bug Explainer?
          </h2>
          <p className="text-muted-foreground">
            AI Bug Explainer helps developers understand code issues by
            generating natural language explanations using AI.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            🔒 How is my data protected?
          </h2>
          <p className="text-muted-foreground">
            We securely store your data and only use it to improve your
            experience. All API tokens are encrypted.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            📩 How do I contact support?
          </h2>
          <p className="text-muted-foreground">
            You can email us at{" "}
            <a
              href="mailto:support@aibugexplainer.com"
              className="text-primary underline"
            >
              support@aibugexplainer.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
