// Function to parse values with M (million) and B (billion) suffixes
function parseValueWithSuffix(value: string): number {
	const trimmedValue = value.trim().toUpperCase();

	if (trimmedValue.endsWith("M")) {
		return Number.parseFloat(trimmedValue.slice(0, -1)) * 1000000;
	}
	if (trimmedValue.endsWith("B")) {
		return Number.parseFloat(trimmedValue.slice(0, -1)) * 1000000000;
	}
	return Number.parseFloat(trimmedValue);
}

// Format currency values without cents
function formatCurrency(value: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
}

// Format percentage values
function formatPercentage(value: number): string {
	return new Intl.NumberFormat("en-US", {
		style: "percent",
		minimumFractionDigits: 3,
		maximumFractionDigits: 3,
	}).format(value / 100);
}

export function calculateEquity(formData: any) {
	// Parse input values
	const stockOptions = Number(formData.stockOptions);
	const vestedPercentage = Number(formData.vestedPercentage);
	const strikePrice = Number(formData.strikePrice);
	const totalCompanyShares = Number(formData.totalCompanyShares);
	const companyCurrentValue = parseValueWithSuffix(
		formData.companyCurrentValue,
	);
	const exitValue = parseValueWithSuffix(formData.exitValue);
	const fundingRounds = Number(formData.fundingRounds);
	const dilutionPerRound = Number(formData.dilutionPerRound);

	// Calculate vested shares
	const vestedShares = stockOptions * (vestedPercentage / 100);

	// Calculate initial percentage ownership
	const initialPercentageOwnership = (stockOptions / totalCompanyShares) * 100;

	// Calculate dilution effect
	const dilutionEffect = (1 - dilutionPerRound / 100) ** fundingRounds;

	// Calculate future vested shares (assuming all options vest by exit)
	const futureVestedShares = stockOptions;

	// Calculate future percentage ownership
	const futurePercentageOwnership = initialPercentageOwnership * dilutionEffect;

	// Calculate current equity value
	const currentEquityValue =
		(companyCurrentValue / totalCompanyShares) * vestedShares;

	// Calculate future equity value
	const totalFutureEquityValue =
		(exitValue / totalCompanyShares) * futureVestedShares * dilutionEffect;

	// Calculate costs to exercise
	const currentCostToExercise = strikePrice * vestedShares;
	const costToExerciseAll = strikePrice * stockOptions;

	// Calculate post-exercise values
	const currentEquityValuePostExercise =
		currentEquityValue - currentCostToExercise;
	const futureEquityValuePostExercise =
		totalFutureEquityValue - costToExerciseAll;

	return {
		// Future values
		totalFutureEquityValue: formatCurrency(totalFutureEquityValue),
		futureVestedShares: futureVestedShares,
		futurePercentageOwnership: formatPercentage(futurePercentageOwnership),
		costToExerciseAll: formatCurrency(costToExerciseAll),
		futureEquityValuePostExercise: formatCurrency(
			futureEquityValuePostExercise,
		),

		// Current values
		currentEquityValue: formatCurrency(currentEquityValue),
		vestedShares: vestedShares,
		initialPercentageOwnership: formatPercentage(initialPercentageOwnership),
		currentCostToExercise: formatCurrency(currentCostToExercise),
		currentEquityValuePostExercise: formatCurrency(
			currentEquityValuePostExercise,
		),
	};
}
