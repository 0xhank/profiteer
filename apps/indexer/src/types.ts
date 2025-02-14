/**
 * The relevant info about the price of a token from the Jupiter API `/price` endpoint.
 *
 * @property {object} data - The data containing the price of the token
 */
export type GetJupiterPriceResponse = {
  data: { [id: string]: { price: number } };
};

