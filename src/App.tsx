import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { AudioPage } from "./pages/AudioPage";
import { VideoPage } from "./pages/VideoPage";
import { StoryboardPage } from "./pages/StoryboardPage";
import { CharactersPage } from "./pages/CharactersPage";
import { PropsScenesPage } from "./pages/PropsScenesPage";
import { EffectsPage } from "./pages/EffectsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/audio" element={<AudioPage />} />
          <Route path="/video" element={<VideoPage />} />
          <Route path="/storyboard" element={<StoryboardPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/props-scenes" element={<PropsScenesPage />} />
          <Route path="/effects" element={<EffectsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
