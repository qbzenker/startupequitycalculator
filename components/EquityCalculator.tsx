"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { calculateEquity } from "@/utils/calculations";
import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSignIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { z } from "zod";
import { Divider } from "./ui/divider";
import { Input } from "./ui/input";

// Define the schema for form validation with Zod
const formSchema = z.object({
	stockOptions: z.number().positive("Must be greater than 0"),
	vestedPercentage: z.number().min(0).max(100),
	strikePrice: z.number().min(0),
	totalCompanyShares: z.number().positive("Must be greater than 0"),
	companyCurrentValue: z.string().min(1, "Required"),
	exitValue: z.string().min(1, "Required"),
	fundingRounds: z.number().min(0),
	dilutionPerRound: z.number().min(0).max(100),
});

type FormData = z.infer<typeof formSchema>;

export default function EquityCalculator() {
	// Initialize React Hook Form with Zod validation
	const {
		control,
		watch,
		setValue,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			stockOptions: 20000,
			vestedPercentage: 50,
			strikePrice: 0.6,
			totalCompanyShares: 17000000,
			companyCurrentValue: "200M",
			exitValue: "3B",
			fundingRounds: 2,
			dilutionPerRound: 18,
		},
	});

	// Watch all form values
	const formData = watch();

	// Calculate results whenever form data changes
	const results = calculateEquity(formData);

	// Helper function to handle slider changes
	const handleSliderChange = (
		name: "vestedPercentage" | "fundingRounds" | "dilutionPerRound",
		value: number[],
	) => {
		setValue(name, value[0], { shouldValidate: true });
	};

	// Add state for the suffix toggles
	const [companyCurrentValueSuffix, setCompanyCurrentValueSuffix] =
		useState("M");
	const [exitValueSuffix, setExitValueSuffix] = useState("B");

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
			{/* Left column - Inputs */}
			<div className="space-y-6 ">
				<Divider className="mb-4 mt-0">Your Equity Details</Divider>
				{/* <h2 className="text-xl font-semibold mb-4">Your Equity Details</h2> */}

				<div className="flex items-center space-x-4 justify-between">
					<label htmlFor="stockOptions" className="text-sm font-medium">
						Total Stock Options
					</label>
					<div className="flex-grow max-w-48">
						<Controller
							name="stockOptions"
							control={control}
							render={({ field }) => (
								<NumericFormat
									id="stockOptions"
									value={field.value}
									thousandSeparator=","
									onValueChange={(values) => {
										field.onChange(values.floatValue);
									}}
									customInput={Input}
									className="w-full px-3 py-2 text-right"
									min="1"
								/>
							)}
						/>
						{errors.stockOptions && (
							<p className="text-red-500 text-sm mt-1">
								{errors.stockOptions.message}
							</p>
						)}
					</div>
				</div>

				<div className="pl-5 border-l border-border space-y-6">
					<div>
						<div className="flex justify-between items-center mb-1.5">
							<label htmlFor="vestedPercentage" className="text-sm font-medium">
								Percentage of Options Vested
							</label>
							<span className="text-sm font-medium text-muted-foreground">
								{Math.round(
									watch("stockOptions") * (watch("vestedPercentage") / 100),
								).toLocaleString()}{" "}
								<span className="text-muted-foreground">
									({Math.round(watch("vestedPercentage"))}%)
								</span>
							</span>
						</div>
						<Controller
							name="vestedPercentage"
							control={control}
							render={({ field }) => (
								<Slider
									id="vestedPercentage"
									min={0}
									max={100}
									step={1}
									value={[field.value]}
									defaultValue={[field.value]}
									onValueChange={(value) =>
										setValue("vestedPercentage", value[0], {
											shouldValidate: true,
										})
									}
								/>
							)}
						/>
						{errors.vestedPercentage && (
							<p className="text-red-500 text-sm mt-1">
								{errors.vestedPercentage.message}
							</p>
						)}
					</div>

					{/* Add a new field for direct input of vested shares */}
					<div className="flex items-center space-x-4 justify-between">
						<div className="max-w-72">
							<label
								htmlFor="vestedShares"
								className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
							>
								Number of Shares Vested (Alternative Input)
							</label>
							<p className="text-xs text-muted-foreground mt-1">
								Enter the exact number of vested shares instead of using the
								percentage slider
							</p>
						</div>
						<div className="flex-grow max-w-32">
							<NumericFormat
								id="vestedShares"
								value={Math.round(
									formData.stockOptions * (formData.vestedPercentage / 100),
								)}
								thousandSeparator=","
								onValueChange={(values) => {
									// Calculate percentage based on current stockOptions value
									const vestedShares = values.floatValue || 0;
									const newPercentage =
										(vestedShares / formData.stockOptions) * 100;
									// Clamp percentage between 0 and 100
									const clampedPercentage = Math.min(
										100,
										Math.max(0, newPercentage),
									);
									setValue("vestedPercentage", clampedPercentage, {
										shouldValidate: true,
									});
								}}
								customInput={Input}
								className="w-full px-4 py-2 text-right"
							/>
						</div>
					</div>
					<div className="flex items-center space-x-4 justify-between">
						<div className="max-w-72">
							<label
								htmlFor="strikePrice"
								className="text-sm font-medium whitespace-nowrap"
							>
								Strike Price
							</label>
							<p className="text-xs text-muted-foreground mt-1">
								The price at which you can buy the stock
							</p>
						</div>
						<div className="flex-grow max-w-32">
							<Controller
								name="strikePrice"
								control={control}
								render={({ field }) => (
									<div className="mt-2 grid grid-cols-1">
										<DollarSignIcon className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4" />
										<NumericFormat
											id="strikePrice"
											value={field.value}
											thousandSeparator={true}
											decimalScale={2}
											fixedDecimalScale
											onValueChange={(values) => {
												field.onChange(values.floatValue);
											}}
											customInput={Input}
											className="col-start-1 text-right row-start-1 "
										/>
									</div>
								)}
							/>
							{errors.strikePrice && (
								<p className="text-red-500 text-sm mt-1">
									{errors.strikePrice.message}
								</p>
							)}
						</div>
					</div>
				</div>
				<Divider>Company Information</Divider>
				<div className="flex items-center space-x-4 justify-between">
					<label
						htmlFor="totalCompanyShares"
						className="text-sm font-medium whitespace-nowrap"
					>
						Total Company Shares
						<br />
						<span className="text-muted-foreground">
							{(watch("totalCompanyShares") / 1000000).toLocaleString()}M
						</span>
					</label>

					<div className="flex-grow max-w-48">
						<Controller
							name="totalCompanyShares"
							control={control}
							render={({ field }) => (
								<div className="flex group ">
									<NumericFormat
										id="totalCompanyShares"
										value={field.value}
										thousandSeparator=","
										onValueChange={(values) => {
											field.onChange(values.floatValue);
										}}
										customInput={Input}
										className="w-full px-4 py-2 text-right"
									/>
								</div>
							)}
						/>
						{errors.totalCompanyShares && (
							<p className="text-red-500 text-sm mt-1">
								{errors.totalCompanyShares.message}
							</p>
						)}
					</div>
				</div>
				<div className="pl-5 border-l border-border space-y-6">
					<div className="flex items-center space-x-4 justify-between">
						<label
							htmlFor="companyCurrentValue"
							className="text-sm font-medium mb-1"
						>
							Company Current Value
						</label>
						<div className="flex-grow max-w-48">
							<Controller
								name="companyCurrentValue"
								control={control}
								render={({ field }) => (
									<div className="flex relative">
										{/* Emoji indicator */}
										{field.value && (
											<div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
												{(() => {
													const numValue = Number.parseFloat(
														field.value.replace(/[MB]$/, ""),
													);
													const suffix = field.value.slice(-1);

													if (suffix === "B" && numValue >= 100)
														return "🦄🦄🦄"; // Decacorn (≥10B)
													if (suffix === "B" && numValue >= 10) return "🦄🦄"; // Decacorn (≥10B)
													if (suffix === "B" && numValue >= 1) return "🦄"; // Unicorn (≥1B)
													if (suffix === "M" && numValue >= 100) return "🦏"; // Rhino (≥100M)
													if (suffix === "M" && numValue >= 10) return "🐘"; // Elephant (≥10M)
													if (suffix === "M" && numValue < 10) return "💰"; // Money bag (<10M)
													return null;
												})()}
											</div>
										)}

										<Input
											type="number"
											id="companyCurrentValue"
											value={field.value.replace(/[MB]$/, "")}
											onChange={(e) => {
												const numericValue = e.target.value;
												field.onChange(
													numericValue + companyCurrentValueSuffix,
												);
											}}
											className="flex-grow px-4 py-2 text-right rounded-r-none border-r-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
											placeholder="e.g., 100"
										/>
										<ToggleGroup
											type="single"
											value={companyCurrentValueSuffix}
											onValueChange={(value) => {
												if (value) {
													setCompanyCurrentValueSuffix(value);
													const numericValue = field.value.replace(/[MB]$/, "");
													field.onChange(numericValue + value);
												}
											}}
											className="border border-gray-200 dark:border-gray-600 rounded-l-none"
										>
											<ToggleGroupItem
												value="M"
												className="px-3 py-1 text-sm h-full cursor-pointer first:rounded-l-none"
											>
												M
											</ToggleGroupItem>
											<ToggleGroupItem
												value="B"
												className="px-3 py-1 text-sm h-full cursor-pointer"
											>
												B
											</ToggleGroupItem>
										</ToggleGroup>
									</div>
								)}
							/>
							{errors.companyCurrentValue && (
								<p className="text-red-500 text-sm mt-1">
									{errors.companyCurrentValue.message}
								</p>
							)}
						</div>
					</div>

					<div className="flex items-center space-x-4 justify-between">
						<label
							htmlFor="exitValue"
							className="block text-sm font-medium mb-1"
						>
							Hypothetical Exit Value
						</label>
						<div className="flex-grow max-w-48">
							<Controller
								name="exitValue"
								control={control}
								render={({ field }) => (
									<div className="flex relative">
										{/* Emoji indicator */}
										{field.value && (
											<div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
												{(() => {
													const numValue = Number.parseFloat(
														field.value.replace(/[MB]$/, ""),
													);
													const suffix = field.value.slice(-1);

													if (suffix === "B" && numValue >= 100)
														return "🦄🦄🦄"; // Decacorn (≥10B)
													if (suffix === "B" && numValue >= 10) return "🦄🦄"; // Decacorn (≥10B)
													if (suffix === "B" && numValue >= 1) return "🦄"; // Unicorn (≥1B)
													if (suffix === "M" && numValue >= 100) return "🦏"; // Rhino (≥100M)
													if (suffix === "M" && numValue >= 10) return "🐘"; // Elephant (≥10M)
													if (suffix === "M" && numValue < 10) return "💰"; // Money bag (<10M)
													return null;
												})()}
											</div>
										)}

										<Input
											type="text"
											id="exitValue"
											value={field.value.replace(/[MB]$/, "")}
											onChange={(e) => {
												const numericValue = e.target.value;
												field.onChange(numericValue + exitValueSuffix);
											}}
											className={`flex-grow px-4 py-2 text-right rounded-r-none border-r-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${field.value ? "pl-8" : "pl-4"}`}
											placeholder="e.g., 5"
										/>
										<ToggleGroup
											type="single"
											value={exitValueSuffix}
											onValueChange={(value) => {
												if (value) {
													setExitValueSuffix(value);
													const numericValue = field.value.replace(/[MB]$/, "");
													field.onChange(numericValue + value);
												}
											}}
											className="border border-gray-200 dark:border-gray-600 rounded-l-none"
										>
											<ToggleGroupItem
												value="M"
												className="px-3 py-1 text-sm h-full cursor-pointer first:rounded-l-none"
											>
												M
											</ToggleGroupItem>
											<ToggleGroupItem
												value="B"
												className="px-3 py-1 text-sm h-full cursor-pointer"
											>
												B
											</ToggleGroupItem>
										</ToggleGroup>
									</div>
								)}
							/>
							{errors.exitValue && (
								<p className="text-red-500 text-sm mt-1">
									{errors.exitValue.message}
								</p>
							)}
						</div>
					</div>

					<div>
						<div className="flex justify-between items-center mb-1.5">
							<label
								htmlFor="fundingRounds"
								className="text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Additional Rounds of Funding
							</label>
							<span className="text-muted-foreground text-sm">
								{formData.fundingRounds}
							</span>
						</div>
						<Controller
							name="fundingRounds"
							control={control}
							render={({ field }) => (
								<Slider
									id="fundingRounds"
									min={0}
									max={10}
									step={1}
									value={[field.value]}
									defaultValue={[field.value]}
									onValueChange={(value) =>
										handleSliderChange("fundingRounds", value)
									}
								/>
							)}
						/>
						{errors.fundingRounds && (
							<p className="text-red-500 text-sm mt-1">
								{errors.fundingRounds.message}
							</p>
						)}
					</div>

					<div>
						<div className="flex justify-between items-center mb-1.5">
							<label htmlFor="dilutionPerRound" className="text-sm font-medium">
								Dilution per Round
							</label>
							<span className="text-muted-foreground text-sm">
								{formData.dilutionPerRound}%
							</span>
						</div>
						<Controller
							name="dilutionPerRound"
							control={control}
							render={({ field }) => (
								<Slider
									id="dilutionPerRound"
									min={0}
									max={50}
									step={1}
									value={[field.value]}
									defaultValue={[field.value]}
									onValueChange={(value) =>
										handleSliderChange("dilutionPerRound", value)
									}
								/>
							)}
						/>
						{errors.dilutionPerRound && (
							<p className="text-red-500 text-sm mt-1">
								{errors.dilutionPerRound.message}
							</p>
						)}
					</div>
				</div>
			</div>
			{results && (
				<div>
					<div className="space-y-20 mt-3">
						{/* Future Value Section */}
						<div className="rounded-lg overflow-hidden">
							<Card className="p-0 border-r-0 border-y-0 border-l-8 border-emerald-500 dark:border-emerald-400 rounded-none">
								<CardHeader>
									<CardTitle className="text-emerald-500 dark:text-emerald-400">
										Future Equity Value
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="mb-8">
										<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
											Total Future Equity Value
										</p>
										<p className="text-6xl font-bold dark:text-emerald-500 text-emerald-600">
											{results.totalFutureEquityValue}
										</p>
									</div>

									<div className="grid grid-cols-2 gap-6">
										<div className="space-y-1">
											<p className="text-sm font-medium text-muted-foreground">
												Future Vested Shares
											</p>
											<p className="text-xl font-semibold">
												{results.futureVestedShares.toLocaleString()}
											</p>
										</div>

										<div className="space-y-1">
											<p className="text-sm font-medium text-muted-foreground">
												Future Ownership
											</p>
											<p className="text-xl font-semibold">
												{results.futurePercentageOwnership}
											</p>
										</div>

										<div className="space-y-1">
											<p className="text-sm font-medium text-muted-foreground">
												Exercise Cost
											</p>
											<p className="text-xl font-semibold">
												{results.costToExerciseAll}
											</p>
										</div>

										<div className="space-y-1">
											<p className="text-sm font-medium text-muted-foreground">
												Net Value After Exercise
											</p>
											<p className="text-xl font-semibold">
												{results.futureEquityValuePostExercise}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Current Value Section */}
						<div className="rounded-lg overflow-hidden">
							<Card className="p-0 border-r-0 border-y-0 border-l-8 border-indigo-400 rounded-none">
								<CardHeader>
									<CardTitle className=" text-indigo-400">
										Current Equity Value
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="mb-8">
										<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
											Current Equity Value
										</p>
										<p className="text-4xl font-bold text-indigo-500">
											{results.currentEquityValue}
										</p>
									</div>

									<div className="grid grid-cols-2 gap-6">
										<div className="space-y-1">
											<p className="text-sm font-medium text-muted-foreground">
												Vested Shares
											</p>
											<p className="text-xl font-base">
												{results.vestedShares.toLocaleString()}
											</p>
										</div>

										<div className="space-y-1">
											<p className="text-sm font-medium text-muted-foreground">
												Current Ownership
											</p>
											<p className="text-xl font-base">
												{results.initialPercentageOwnership}
											</p>
										</div>

										<div className="space-y-1">
											<p className="text-sm font-medium text-muted-foreground">
												Exercise Cost
											</p>
											<p className="text-xl font-base">
												{results.currentCostToExercise}
											</p>
										</div>

										<div className="space-y-1">
											<p className="text-sm font-medium text-muted-foreground">
												Net Value After Exercise
											</p>
											<p className="text-xl font-base">
												{results.currentEquityValuePostExercise}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
