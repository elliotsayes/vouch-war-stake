export type VouchMethod =
  | "Vouch-X"
  | "Vouch-Gitcoin-Passport"
  | "Vouch-AO-Balance"
  | "Vouch-wAR-Stake";

export type VoucherInfo = {
  name: VouchMethod;
  description: string;
  address: string;
  url: string;
  icon: JSX.Element;
};

export const whitelistedVouchers: Array<VoucherInfo> = [
  {
    name: "Vouch-X",
    description:
      "Earn vouch points based on the credibility of your X account.",
    address: "Ax_uXyLQBPZSQ15movzv9-O1mDo30khslqN64qD27Z8",
    url: "https://vouch-twitter.arweave.net/",
    icon: (
      <svg
        width="32"
        height="32"
        className="p-1 mx-1"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.2439 2.25H21.5519L14.3249 10.51L22.8269 21.75H16.1699L10.9559 14.933L4.98991 21.75H1.67991L9.40991 12.915L1.25391 2.25H8.07991L12.7929 8.481L18.2439 2.25ZM17.0829 19.77H18.9159L7.08391 4.126H5.11691L17.0829 19.77Z"
          fill="black"
        />
      </svg>
    ),
  },
  {
    name: "Vouch-Gitcoin-Passport",
    description:
      "Earn vouch points from your Ethereum wallet via Gitcoin Passport",
    // TODO: Real address
    address: "k6p1MtqYhQQOuTSfN8gH7sQ78zlHavt8dCDL88btn9s",
    url: "https://vouch-gitcoin-passport.arweave.net/",
    icon: (
      <svg
        width="32"
        height="32"
        className="p-0.5 mx-1.5"
        viewBox="0 0 128 146"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#fff">
          <path
            d="m61.6349 145.42-59.47037-34.335c-1.339304-.774-2.16453-2.203-2.16453-3.75v-68.6698c0-1.5476.825226-2.9762 2.16453-3.75l59.47037-34.334836c1.3393-.773818 2.9897-.773818 4.329 0l59.4701 34.334836c1.34.7738 2.165 2.2024 2.165 3.75v68.6698c0 1.547-.825 2.976-2.165 3.75l-59.4701 34.335c-1.3393.773-2.9897.773-4.329 0zm-48.6477-40.583 48.6477 28.088c1.3393.774 2.9897.774 4.329 0l48.6481-28.088c1.339-.773 2.164-2.202 2.164-3.75v-56.1717c0-1.5477-.825-2.9763-2.164-3.7501l-48.6481-28.0874c-1.3393-.7738-2.9897-.7738-4.329 0l-48.6477 28.0874c-1.3393.7738-2.1646 2.2024-2.1646 3.7501v56.1717c0 1.548.8253 2.977 2.1646 3.75z"
            fill="black"
          />
          <path
            d="m61.6345 23.0133-40.0437 23.1198c-1.3393.7738-2.1645 2.2024-2.1645 3.7501v43.7396c0 3.0926 1.6504 5.9525 4.329 7.4972l4.8702 2.811c.7224.417 1.6234-.102 1.6234-.936v-46.8617c0-1.5477.8252-2.9763 2.1645-3.7501l29.2211-16.8698c1.3393-.7738 2.9898-.7738 4.3291 0l29.2211 16.8698c1.3393.7738 2.1645 2.2024 2.1645 3.7501v33.7422c0 1.5476-.8252 2.9762-2.1645 3.75l-29.2211 16.8695c-1.3393.774-2.9898.774-4.3291 0l-9.7403-5.622c-1.3393-.774-2.1646-2.202-2.1646-3.75v-33.7423c0-1.5477.8253-2.9763 2.1646-3.7501l9.7403-5.6223c1.3393-.7739 2.9898-.7739 4.3291 0l9.7404 5.6223c1.3393.7738 2.1645 2.2024 2.1645 3.7501v11.2474c0 1.5476-.8252 2.9762-2.1645 3.75l-4.8702 2.8112c-.7224.4167-1.6234-.1028-1.6234-.9362v-6.9183-4.8783c0-1.5477-.8252-2.9762-2.1645-3.7501l-2.1646-1.25c-.671-.3869-1.4935-.3869-2.1645 0l-2.7057 1.5612c-1.0038.579-1.6233 1.6531-1.6233 2.8112v1.1715 23.1686c0 1.553.8333 2.987 2.1807 3.7581l1.0444.595c1.3366.763 2.9789.761 4.3128-.011l20.6009-11.8936c1.3393-.7738 2.1645-2.2024 2.1645-3.7501v-23.7448c0-1.5477-.8252-2.9762-2.1645-3.7501l-20.563-11.8724c-1.3393-.7738-2.9898-.7738-4.3291 0l-20.563 11.8724c-1.3393.7739-2.1645 2.2024-2.1645 3.7501v46.2365c0 1.548.8252 2.977 2.1645 3.751l20.563 11.872c1.3393.774 2.9898.774 4.3291 0l40.0434-23.1199c1.34-.7738 2.165-2.2024 2.165-3.7501v-46.2369c0-1.5477-.825-2.9763-2.165-3.7501l-40.0434-23.1198c-1.3393-.7738-2.9898-.7738-4.3291 0z"
            fill="black"
          />
        </g>
      </svg>
    ),
  },
  {
    name: "Vouch-AO-Balance",
    description: "Earn vouch points for the AO tokens locked in your wallet.",
    // TODO: Real address
    address: "QeXDjjxcui7W2xU08zOlnFwBlbiID4sACpi0tSS3VgY",
    url: "https://vouch-ao-balance.arweave.net/",
    icon: (
      <svg
        width="32"
        height="32"
        className="mx-2"
        viewBox="0 0 429 214"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 214H71.3763L85.9429 174.61L53.1681 107.5L0 214Z"
          fill="black"
        />
        <path
          d="M189.366 160.75L109.978 1L85.9429 55.7089L160.961 214H215L189.366 160.75Z"
          fill="black"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M322 214C381.094 214 429 166.094 429 107C429 47.9055 381.094 0 322 0C262.906 0 215 47.9055 215 107C215 166.094 262.906 214 322 214ZM322 172C357.899 172 387 142.899 387 107C387 71.1015 357.899 42 322 42C286.101 42 257 71.1015 257 107C257 142.899 286.101 172 322 172Z"
          fill="black"
        />
      </svg>
    ),
  },
  {
    name: "Vouch-wAR-Stake",
    description: "Earn vouch points by staking wrapped Arweave tokens.",
    address: "3y0YE11i21hpP8UY0Z1AVhtPoJD4V_AbEBx-g0j9wRc",
    url: "https://vouch-portal.arweave.net/",
    icon: (
      <div className="relative w-8 h-8">
        <img
          className="rounded-full h-full w-full"
          src="/images/war-3146b8af.png"
        />
        <img
          className="rounded-full w-4 h-4 absolute border bg-white"
          src="/images/ao-cf4fb40b.svg"
          style={{
            borderColor: "rgba(218, 218, 218, 0.85)",
            bottom: "-2px",
            right: "-2px",
          }}
        />
      </div>
    ),
  },
];

export const vouchLookupByAddress = new Map<string, VoucherInfo>(
  whitelistedVouchers.map((voucher) => [voucher.address, voucher]),
);
