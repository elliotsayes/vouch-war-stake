import { describe, it, expect } from "vitest";
import { getInfoQuery, getActiveStakesQuery } from "./custody";
import { queryClient } from "../lib/query";

const testContractId = "48Bg_s9zmZzLKlvpeXPs15qID2uL1xNzJ89sPz5VPhM";

describe("Custody contract", () => {
  it("getInfoQuery", async () => {
    const res = await queryClient.fetchQuery(getInfoQuery(testContractId));
    expect(res).toMatchSnapshot();
  });

  it("getActiveStakesQuery", async () => {
    const res = await queryClient.fetchQuery(
      getActiveStakesQuery(testContractId),
    );
    expect(res).toMatchSnapshot();
  });
});
