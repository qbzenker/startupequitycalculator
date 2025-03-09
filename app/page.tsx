import Footer from "@/components/Footer";
import HomePage from "@/components/HomePage";
import Logo from "@/components/Logo";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
export default function Home() {
	return (
		<div className="flex flex-col min-h-screen ">
			<header className="container mx-auto  max-w-6xl px-4 py-4 flex justify-between">
				<Logo className="w-10 h-10" />
				<ThemeSwitcher />
			</header>

			<HomePage />
			<Footer />
		</div>
	);
}
