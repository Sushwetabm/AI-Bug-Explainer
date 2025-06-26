import { useAuth } from "@/hooks/useAuth";
import { analysisService } from "@/services/analysis.service";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await analysisService.getAnalysisHistory();
        setHistory(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    loadHistory();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Name: {user?.name}</p>
          <p>Email: {user?.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p>No analysis history yet</p>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id}>{/* Render history items */}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
