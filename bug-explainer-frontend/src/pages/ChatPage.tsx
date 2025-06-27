import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { analysisService } from "@/services";
import { Loader2 } from "lucide-react";

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
        description: `Found ${response.data.issues.length} potential issues`,
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
    <div className="flex h-[calc(100vh-65px)] w-full">
      {/* Code Editor - Left Panel */}
      <div className="w-1/2 h-full p-4 border-r">
        <Card className="h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">Code Editor</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-57px)]">
            <CodeMirror
              value={code}
              height="100%"
              extensions={[javascript()]}
              theme={oneDark}
              onChange={setCode}
              className="h-full text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Analysis - Right Panel */}
      <div className="w-1/2 h-full p-4">
        <div className="h-full flex flex-col gap-4">
          <Button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:from-primary/90 hover:to-secondary/90 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Code"
            )}
          </Button>

          <Card className="flex-1 overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold">
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 overflow-auto h-[calc(100%-57px)]">
              {analysis.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    No issues found yet. Submit your code for analysis.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analysis.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          Line {item.lineNumber}:
                        </span>
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
