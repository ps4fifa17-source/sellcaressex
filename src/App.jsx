import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hub from "./pages/Hub";
import TownPage from "./pages/TownPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/:slug" element={<TownPage />} />
      </Routes>
    </BrowserRouter>
  );
}
