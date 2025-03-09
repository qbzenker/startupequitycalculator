"use client";

import { useEffect, useState } from "react";

const taglines = [
	"Turning hypothetical millions into actual anxiety since 2024 🚀",
	"Where 0.1% of nothing still feels like something 📈",
	"Making 'what if' scenarios more addictive than scrolling social media 📱",
	"Calculate your future fortune, or at least your future conversation starter 💰",
	"Helping founders daydream with mathematical precision ✨",
	"Because spreadsheets weren't made for unicorn dreams 🦄",
	"Quantifying optimism, one equity grant at a time 📊",
	"For when you need to justify working 80-hour weeks 💼",
	"Converting sweat equity into sweet equity since 2024 💸",
	"Because who doesn't want to see their paper value explode? 🚀",
];

function RandomTaglineComponent() {
	const [tagline, setTagline] = useState("");

	useEffect(() => {
		// Use the current date as a seed for daily rotation
		const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

		// Create a simple hash of the date string
		let hash = 0;
		for (let i = 0; i < today.length; i++) {
			hash = (hash << 5) - hash + today.charCodeAt(i);
			hash = hash & hash; // Convert to 32bit integer
		}

		// Use absolute value and modulo to get index
		const index = Math.abs(hash) % taglines.length;
		setTagline(taglines[index]);
	}, []);

	return (
		<p className="text-muted-foreground px-4 mb-4 md:mb-8 text-center max-w-2xl mx-auto">
			{tagline}
		</p>
	);
}

export default RandomTaglineComponent;
