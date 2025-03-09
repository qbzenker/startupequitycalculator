import Footer from "@/components/Footer";
import HomePage from "@/components/HomePage";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export default function Home() {
	return (
		<div className="flex flex-col min-h-screen ">
			<header className="container mx-auto px-4 py-4 flex justify-end">
				<ThemeSwitcher />
			</header>

			<HomePage />
			<Footer />
		</div>
	);
}
