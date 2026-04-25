import { Configuration, CountryCode, PlaidApi, PlaidEnvironments, Products } from "plaid";

const plaidClientId = process.env.PLAID_CLIENT_ID;
const plaidSecret = process.env.PLAID_SECRET;
const plaidEnv = process.env.PLAID_ENV ?? "sandbox";

export function createPlaidClient() {
  if (!plaidClientId) {
    throw new Error("Missing PLAID_CLIENT_ID");
  }

  if (!plaidSecret) {
    throw new Error("Missing PLAID_SECRET");
  }

  const basePath = PlaidEnvironments[plaidEnv];
  if (!basePath) {
    throw new Error(`Invalid PLAID_ENV: ${plaidEnv}`);
  }

  const configuration = new Configuration({
    basePath,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": plaidClientId,
        "PLAID-SECRET": plaidSecret,
      },
    },
  });

  return new PlaidApi(configuration);
}

export const plaidProducts = [Products.Investments];
export const plaidCountryCodes = [CountryCode.Us];
