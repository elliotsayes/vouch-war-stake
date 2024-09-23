export type VouchMethod =
  | "Vouch-X"
  | "Vouch-AO-Balance"
  | "Vouch-Gitcoin-Passport"
  | "Vouch-Custody";

export type VoucherInfo = {
  name: VouchMethod;
  address: string;
  url: string;
};

export const whitelistedVouchers: Array<VoucherInfo> = [
  {
    name: "Vouch-X",
    address: "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8",
    url: "https://vouch-twitter.arweave.net/",
  },
  {
    name: "Vouch-AO-Balance",
    address: "def456",
    url: "https://vouch-ao-balance.arweave.net/",
  },
  {
    name: "Vouch-Gitcoin-Passport",
    address: "ghi789",
    url: "https://vouch-gitcoin-passport.arweave.net/",
  },
  {
    name: "Vouch-Custody",
    address: "jkl012",
    url: "https://vouch-custody.arweave.net/",
  },
];

export const vouchLookupByAddress = new Map<string, VoucherInfo>(
  whitelistedVouchers.map((voucher) => [voucher.address, voucher]),
);
