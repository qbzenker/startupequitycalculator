interface ResultsDisplayProps {
	results: {
		// Future values
		totalFutureEquityValue: string;
		futureVestedShares: number;
		futurePercentageOwnership: string;
		costToExerciseAll: string;
		futureEquityValuePostExercise: string;

		// Current values
		currentEquityValue: string;
		vestedShares: number;
		initialPercentageOwnership: string;
		currentCostToExercise: string;
		currentEquityValuePostExercise: string;
	};
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
	return (
		<div className="mt-10">
			<h2 className="text-2xl font-bold mb-6 text-center">
				Calculation Results
			</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="bg-blue-50 p-6 rounded-lg">
					<h3 className="text-xl font-semibold mb-4 text-blue-800">
						Future Value (At Exit)
					</h3>

					<div className="space-y-4">
						<div>
							<p className="text-sm text-gray-600">Total Future Equity Value</p>
							<p className="text-lg font-bold">
								{results.totalFutureEquityValue}
							</p>
						</div>

						<div>
							<p className="text-sm text-gray-600">Future Vested Shares</p>
							<p className="text-lg font-bold">
								{results.futureVestedShares.toLocaleString()}
							</p>
						</div>

						<div>
							<p className="text-sm text-gray-600">
								Future Percentage Ownership
							</p>
							<p className="text-lg font-bold">
								{results.futurePercentageOwnership}
							</p>
						</div>

						<div>
							<p className="text-sm text-gray-600">
								Cost to Exercise All Shares
							</p>
							<p className="text-lg font-bold">{results.costToExerciseAll}</p>
						</div>

						<div>
							<p className="text-sm text-gray-600">
								Future Equity Value Post-Exercise
							</p>
							<p className="text-lg font-bold">
								{results.futureEquityValuePostExercise}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-green-50 p-6 rounded-lg">
					<h3 className="text-xl font-semibold mb-4 text-green-800">
						Current Value
					</h3>

					<div className="space-y-4">
						<div>
							<p className="text-sm text-gray-600">Current Equity Value</p>
							<p className="text-lg font-bold">{results.currentEquityValue}</p>
						</div>

						<div>
							<p className="text-sm text-gray-600">Vested Shares</p>
							<p className="text-lg font-bold">
								{results.vestedShares.toLocaleString()}
							</p>
						</div>

						<div>
							<p className="text-sm text-gray-600">
								Initial Percentage Ownership
							</p>
							<p className="text-lg font-bold">
								{results.initialPercentageOwnership}
							</p>
						</div>

						<div>
							<p className="text-sm text-gray-600">Current Cost to Exercise</p>
							<p className="text-lg font-bold">
								{results.currentCostToExercise}
							</p>
						</div>

						<div>
							<p className="text-sm text-gray-600">
								Current Equity Value Post-Exercise
							</p>
							<p className="text-lg font-bold">
								{results.currentEquityValuePostExercise}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
