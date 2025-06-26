import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { analysisService } from "@/services";

export function ChatPage() {
  const [code, setCode] = useState(
    '// Write your code here...\nfunction example() {\n  return "Hello, world!"\n}'
  );
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await analysisService.analyzeCode(code);
      setAnalysis(response.data.issues);
      toast({
        title: "Analysis complete",
        description:
          "Found " + response.data.issues.length + " potential issues",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col md:flex-row gap-4 p-4">
      <div className="flex-1 h-full">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Code Editor</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-80px)]">
            <CodeMirror
              value={code}
              height="100%"
              extensions={[javascript()]}
              theme={oneDark}
              onChange={(value) => setCode(value)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 h-full flex flex-col gap-4">
        <Button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full md:w-auto md:self-end"
        >
          {isLoading ? "Analyzing..." : "Analyze Code"}
        </Button>

        <Card className="flex-1 overflow-auto">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis.length === 0 ? (
              <p className="text-muted-foreground">
                No issues found yet. Submit your code for analysis.
              </p>
            ) : (
              analysis.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Line {item.lineNumber}:</span>
                    <span className="text-sm text-muted-foreground">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm">{item.message}</p>
                  {item.suggestion && (
                    <div className="bg-secondary/10 p-3 rounded-md">
                      <p className="text-sm font-medium">Suggestion:</p>
                      <p className="text-sm mt-1">{item.suggestion}</p>
                    </div>
                  )}
                  {index < analysis.length - 1 && <Separator />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
