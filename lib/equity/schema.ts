import { z } from "zod";

const finiteNumber = z.number().finite("Enter a finite number");
const positiveNumber = finiteNumber.positive("Must be greater than zero");
const nonNegativeNumber = finiteNumber.min(0, "Cannot be negative");

export const equityScenarioSchema = z
  .object({
    mode: z.enum(["new-offer", "existing-equity"]),
    grantShares: positiveNumber,
    strikePrice: nonNegativeNumber,
    totalCompanyShares: positiveNumber,
    currentCompanyValue: positiveNumber,
    exitCompanyValue: positiveNumber,
    exitMonths: positiveNumber
      .int("Use a whole number of months")
      .max(180, "Exit timing cannot exceed 15 years"),
    fundingRounds: nonNegativeNumber
      .int("Use a whole number of rounds")
      .max(10, "Funding rounds cannot exceed 10"),
    dilutionPerRound: nonNegativeNumber.lt(
      100,
      "Dilution must be below 100%",
    ),
    vestingMonths: positiveNumber.int("Use a whole number of months"),
    cliffMonths: nonNegativeNumber.int("Use a whole number of months"),
    vestedSharesToday: nonNegativeNumber,
    remainingVestingMonths: nonNegativeNumber.int(
      "Use a whole number of months",
    ),
  })
  .superRefine((input, context) => {
    if (input.cliffMonths > input.vestingMonths) {
      context.addIssue({
        code: "custom",
        path: ["cliffMonths"],
        message: "Cliff cannot be longer than the vesting term",
      });
    }

    if (input.vestedSharesToday > input.grantShares) {
      context.addIssue({
        code: "custom",
        path: ["vestedSharesToday"],
        message: "Vested shares cannot exceed the grant",
      });
    }
  });

export type EquityScenarioDraft = z.input<typeof equityScenarioSchema>;

export function parseScenario(input: unknown) {
  return equityScenarioSchema.parse(input);
}
