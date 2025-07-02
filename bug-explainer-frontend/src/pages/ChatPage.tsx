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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define types for analysis results
interface AnalysisItem {
  lineNumber: number;
  type: string;
  message: string;
  suggestion?: string;
}

// Sample snippets for each language
const languageSnippets: Record<string, string> = {
  javascript:
    '// JavaScript example\nfunction example() {\n  return "Hello, world!";\n}',
  python: '# Python example\ndef example():\n    return "Hello, world!"',
  java: '// Java example\npublic class Example {\n  public static void main(String[] args) {\n    System.out.println("Hello, world!");\n  }\n}',
  cpp: '// C++ example\n#include <iostream>\nint main() {\n  std::cout << "Hello, world!";\n  return 0;\n}',
  c: '// C example\n#include <stdio.h>\nint main() {\n  printf("Hello, world!");\n  return 0;\n}',
  php: '<?php\necho "Hello, world!";\n?>',
  typescript:
    '// TypeScript example\nfunction greet(): string {\n  return "Hello, world!";\n}',
  go: '// Go example\npackage main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, world!")\n}',
  rust: '// Rust example\nfn main() {\n  println!("Hello, world!");\n}',
};

export function ChatPage() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(languageSnippets["javascript"]);
  const [analysis, setAnalysis] = useState<AnalysisItem[]>([]);
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
      const response = await analysisService.analyzeCode(code, language);
      const issues = response.data?.issues || [];
      setAnalysis(issues);
      toast({
        title: "Analysis complete",
        description: `Found ${issues.length} potential issues`,
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
    <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden">
      {/* Left Panel */}
      <div className="w-1/2 h-full p-4 border-r flex flex-col gap-4 relative">
        {/* Language Dropdown - Moved to top with high z-index */}
        <div className="relative z-[9999]">
          <Select
            value={language}
            onValueChange={(lang: string) => {
              setLanguage(lang);
              setCode(languageSnippets[lang] || "// Code example");
            }}
          >
            <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-2 shadow-md">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent
              className="z-[10000] bg-white dark:bg-gray-800 border-2 shadow-lg max-h-60 overflow-y-auto"
              position="popper"
              sideOffset={4}
            >
              {Object.keys(languageSnippets).map((lang) => (
                <SelectItem
                  key={lang}
                  value={lang}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Code Editor */}
        <Card className="flex-1 bg-background/90 backdrop-blur-md rounded-xl shadow-md overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">Code Editor</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-57px)]">
            <CodeMirror
              value={code}
              height="100%"
              extensions={[javascript()]} // optional: dynamic per language
              theme={oneDark}
              onChange={setCode}
              className="h-full text-sm"
            />
          </CardContent>
        </Card>

        {/* Analyze Button */}
        <Button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg rounded-xl text-base py-2 font-semibold"
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
      </div>

      {/* Right Panel */}
      <div className="w-1/2 h-full p-4">
        <Card className="h-full bg-background/90 backdrop-blur-md rounded-xl shadow-md flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 overflow-auto flex-1">
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
  );
}
