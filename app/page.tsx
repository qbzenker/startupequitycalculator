"use client";

import EquityCalculator from "@/components/EquityCalculator";
import Footer from "@/components/Footer";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export default function Home() {
	return (
		<div className="flex flex-col min-h-screen ">
			<header className="container mx-auto px-4 py-4 flex justify-end">
				<ThemeSwitcher />
			</header>

			<main className="container mx-auto p-4 max-w-6xl flex-grow">
				<h1 className="text-4xl font-bold mb-6 text-center">
					Startup Equity Calculator
				</h1>
				<p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
					Calculate the potential value of your startup equity based on various
					parameters
				</p>

				<div className="bg-card text-card-foreground rounded-lg border shadow-lg p-6">
					<EquityCalculator />
				</div>

				<div className="mt-12 bg-muted p-6 rounded-lg border">
					<h2 className="text-xl font-semibold mb-4">About This Calculator</h2>
					<p className="mb-3 text-foreground">
						This simple calculator helps startup employees estimate the
						potential value of their equity compensation. It accounts for
						vesting schedules, dilution from future funding rounds, and
						different exit scenarios.
					</p>
					<p className="mb-3 text-foreground">
						The calculations are based on standard equity models but are
						simplified for educational purposes.
					</p>
					<div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mt-4">
						<h3 className="font-bold text-yellow-800 dark:text-yellow-500">
							Financial Disclaimer
						</h3>
						<p className="text-yellow-700 dark:text-yellow-400">
							This calculator provides estimates only and should not be
							considered financial advice. Actual equity outcomes depend on many
							factors including company performance, market conditions, future
							financing terms, and exit scenarios. Consult with a financial
							advisor before making investment decisions based on equity
							compensation.
						</p>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
