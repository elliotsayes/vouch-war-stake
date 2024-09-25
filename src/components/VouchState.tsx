import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";
import { useActiveAddress } from "arweave-wallet-kit";
import { createCustody, getWalletQuery } from "../contract/custodyCreator";
import { vouchCustodyInfoQuery } from "../contract/vouchCustody";
import { useState } from "react";
import useAoSigner from "../hooks/useAoSigner";
import { vouchDaoVouchesQuery } from "../contract/vouchDao";

export function VouchState() {
  const { aoSigner } = useAoSigner();

  const activeAddress = useActiveAddress();

  // 1^10^10 => 1^10^15
  const [quantity, setQuantity] = useState(0);
  // 1Day(ms) to 1Year(ms)
  const [duration, setDuration] = useState(0);

  const vouchDaoVouches = useQuery(vouchDaoVouchesQuery(activeAddress!));

  const custodyCreatorInfo = useQuery(getWalletQuery(activeAddress!));

  const voucherState = useQuery(vouchCustodyInfoQuery());
  // const voucherConfidence = useQuery(
  //   queryOptions({
  //     ...vouchConfidenceQuery(quantity, duration),
  //   })
  // );

  const createCustody = useMutation(createCustody(aoSigner!));

  return (
    <div>
      <div>
        {voucherState.isLoading && <div>Loading...</div>}
        {voucherState.isError && <div>Error: {voucherState.error.message}</div>}
      </div>
      {/* <div>
        {voucherConfidence.isLoading && <div>Loading...</div>}
        {voucherConfidence.isError && (
          <div>Error: {voucherConfidence.error.message}</div>
        )}
        {voucherConfidence.isSuccess && (
          <div>US${voucherConfidence.data.confidence.toFixed(2)}</div>
        )}
      </div> */}
      <div>
        {custodyCreatorInfo.isLoading && <div>Loading...</div>}
        {custodyCreatorInfo.isError && (
          <div>Error: {custodyCreatorInfo.error.message}</div>
        )}
        {custodyCreatorInfo.isSuccess && (
          <div>Wallet: {custodyCreatorInfo.data}</div>
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
      <div>
        {
          // Display vouchDaoVouches
          vouchDaoVouches.isSuccess &&
            ("ID" in vouchDaoVouches.data ? (
              <>{vouchDaoVouches.data.Status}</>
            ) : (
              <>
                {vouchDaoVouches.data["Vouches-For"]}
                {vouchDaoVouches.data["Total-Value"]}
                {Object.entries(vouchDaoVouches.data.Vouchers).map(
                  ([voucher, record]) => (
                    <div key={voucher}>
                      {voucher}
                      {Object.entries(record).map(([key, val]) => (
                        <span
                          key={key}
                          style={{
                            border: "1px solid black",
                          }}
                        >
                          {key}: {val as string}
                        </span>
                      ))}
                    </div>
                  ),
                )}
              </>
            ))
        }
      </div>
    </div>
  );
}
