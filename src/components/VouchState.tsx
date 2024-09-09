import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { useActiveAddress } from "arweave-wallet-kit";
import {
  createCustodyMutation,
  vouchConfidenceQuery,
  vouchStateQuery,
} from "../contract/vouchWarStake";
import { useState } from "react";
import useAoSigner from "../hooks/useAoSigner";

export function VouchState() {
  const { aoSigner } = useAoSigner();

  const activeAddress = useActiveAddress();

  // 1^10^10 => 1^10^15
  const [quantity, setQuantity] = useState(0);
  // 1Day(ms) to 1Year(ms)
  const [duration, setDuration] = useState(0);

  const voucherState = useQuery(vouchStateQuery(activeAddress!));
  const voucherConfidence = useQuery(
    queryOptions({
      ...vouchConfidenceQuery(quantity, duration),
    })
  );

  const createCustody = useMutation(createCustodyMutation(aoSigner!));

  return (
    <div>
      <div>
        {voucherState.isLoading && <div>Loading...</div>}
        {voucherState.isError && <div>Error: {voucherState.error.message}</div>}
      </div>
      <div>
        {voucherConfidence.isLoading && <div>Loading...</div>}
        {voucherConfidence.isError && (
          <div>Error: {voucherConfidence.error.message}</div>
        )}
        {voucherConfidence.isSuccess && (
          <div>US${voucherConfidence.data.confidence.toFixed(2)}</div>
        )}
      </div>
      <div>
        <input
          type="range"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min={Math.pow(10, 10)}
          max={Math.pow(10, 15)}
        />
        <input
          type="range"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          min={24 * 60 * 60 * 1000}
          max={365 * 24 * 60 * 60 * 1000}
        />
        {
          // Display inputs value as number
        }
        <div>Quantity: {quantity / Math.pow(10, 12)}</div>
        <div>
          Duration:{" "}
          {Intl.NumberFormat().format(duration / (24 * 60 * 60 * 1000))} days
        </div>
        <div>Until: {new Date(Date.now() + duration).toISOString()}</div>
      </div>
      <div>
        {voucherState.isSuccess &&
          (voucherState.data.length === 0 ? (
            <>
              <div>No voucher found</div>
              <button onClick={() => createCustody.mutate()}>Create</button>
            </>
          ) : (
            <>
              <div>Balance: {voucherState.data[0].TotalConfidenceValue}</div>
            </>
          ))}
      </div>
    </div>
  );
}
