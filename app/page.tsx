import Footer from "@/components/Footer";
import { EquityStudio } from "@/components/equity/EquityStudio";

export default function Home() {
  return (
    <div className="app-shell">
      <main>
        <EquityStudio />
      </main>
      <Footer />
    </div>
  );
}
