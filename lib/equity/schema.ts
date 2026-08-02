import { z } from "zod";

export const MAX_SHARE_COUNT = 1_000_000_000_000;
export const MAX_COMPANY_VALUE = 1_000_000_000_000_000;
export const MAX_STRIKE_PRICE = 1_000_000_000;
export const MAX_VESTING_MONTHS = 600;

const finiteNumber = z.number().finite("Enter a finite number");
const positiveNumber = finiteNumber.positive("Must be greater than zero");
const nonNegativeNumber = finiteNumber.min(0, "Cannot be negative");
const shareCount = positiveNumber.max(
  MAX_SHARE_COUNT,
  "Share count is too large to model safely",
);
const optionalShareCount = nonNegativeNumber.max(
  MAX_SHARE_COUNT,
  "Share count is too large to model safely",
);
const companyValue = positiveNumber.max(
  MAX_COMPANY_VALUE,
  "Company value is too large to model safely",
);

export const equityScenarioSchema = z
  .object({
    mode: z.enum(["new-offer", "existing-equity"]),
    grantShares: shareCount,
    strikePrice: nonNegativeNumber.max(
      MAX_STRIKE_PRICE,
      "Strike price is too large to model safely",
    ),
    totalCompanyShares: shareCount,
    currentCompanyValue: companyValue,
    exitCompanyValue: companyValue,
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
    vestingMonths: positiveNumber
      .int("Use a whole number of months")
      .max(MAX_VESTING_MONTHS, "Vesting term cannot exceed 50 years"),
    cliffMonths: nonNegativeNumber.int("Use a whole number of months"),
    vestedSharesToday: optionalShareCount,
    remainingVestingMonths: nonNegativeNumber
      .int("Use a whole number of months")
      .max(
        MAX_VESTING_MONTHS,
        "Remaining vesting cannot exceed 50 years",
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

    if (input.grantShares > input.totalCompanyShares) {
      context.addIssue({
        code: "custom",
        path: ["grantShares"],
        message: "Grant shares cannot exceed fully diluted company shares",
      });
    }
  });

export type EquityScenarioDraft = z.input<typeof equityScenarioSchema>;

export function parseScenario(input: unknown) {
  return equityScenarioSchema.parse(input);
}
