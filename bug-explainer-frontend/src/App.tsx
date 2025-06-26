import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
