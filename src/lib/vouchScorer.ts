import { VouchDaoGetVouchesResponse } from "@/contract/vouchDao";
import { dryrun } from "@permaweb/aoconnect";

const VOUCHDAO_PROCESS_ID = "ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo";
const VOUCHER_WHITELIST = [
  // Vouch-X
  "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8",
  // Vouch-Gitcoin-Passport
  "k6p1MtqYhQQOuTSfN8gH7sQ78zlHavt8dCDL88btn9s",
  // Vouch-AO-Balance
  "QeXDjjxcui7W2xU08zOlnFwBlbiID4sACpi0tSS3VgY",
  // Vouch-wAR-Stake
  "3y0YE11i21hpP8UY0Z1AVhtPoJD4V_AbEBx-g0j9wRc",
];

export async function getVouchScoreUsd(walletId: string) {
  const res = await dryrun({
    process: VOUCHDAO_PROCESS_ID,
    tags: [
      {
        name: "Action",
        value: "Get-Vouches",
      },
      {
        name: "ID",
        value: walletId!,
      },
    ],
  });
  const replyData = res.Messages[0].Data;
  const vouchData = JSON.parse(replyData) as VouchDaoGetVouchesResponse;

  if (!("Vouchers" in vouchData)) {
    console.log("No Vouchers for wallet: ", walletId);
    return 0;
  }

  const vouches = vouchData["Vouchers"];

  let score = 0;

  for (const [voucher, vouch] of Object.entries(vouches)) {
    if (VOUCHER_WHITELIST.includes(voucher)) {
      const vouchFor = vouch["Vouch-For"];
      if (vouchFor !== walletId) {
        console.warn(
          `${voucher} has Vouch-For mismatch, expected: ${walletId}, got: ${vouchFor}`,
        );
      } else {
        // Extract the value before '-USD'
        const match = vouch.Value.match(/([\d.]+)-USD/);
        const valueStr = match ? match[1] : null;
        const value = valueStr ? parseFloat(valueStr) : null;

        if (valueStr === null || value === null) {
          console.log(`${voucher} has invalid value: ${vouch.Value}`);
        } else {
          score += value;
        }
      }
    }
  }

  return score;
}
