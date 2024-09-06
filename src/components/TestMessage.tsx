import { message } from "@permaweb/aoconnect";
import useAoSigner from "../hooks/useAoSigner";

export function TestMessage() {
  const { aoSigner } = useAoSigner();

  return (
    <div>
      <button
        onClick={async () => {
          const process = import.meta.env.VITE_VOUCHER_PROCESS_ID!;
          console.log(process);
          const res = await message({
            process,
            tags: [
              {
                name: "Action",
                value: "Test",
              },
            ],
            signer: aoSigner!,
          });
          console.log(res);
        }}
      >
        CLICK
      </button>
    </div>
  );
}
