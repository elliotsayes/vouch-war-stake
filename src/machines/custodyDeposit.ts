import { custodyDeposit, DepositParameters } from "@/contract/custody";
import {
  custodyCreatorCreateCustody,
  custodyCreatorGetWalletQuery,
} from "@/contract/custodyCreator";
import {
  vouchCustodyGetProcessIdQuery,
  vouchCustodyRegisterCustody,
} from "@/contract/vouchCustody";
import { AoSigner } from "@/hooks/useAoSigner";
import { queryClient } from "@/lib/query";
import { assign, fromPromise, setup } from "xstate";

type Events =
  | {
      type: "Confirm Deposit";
    }
  | {
      type: "Cancel Deposit";
    };

type InputContext = {
  walletId: string;
  aoSigner: AoSigner;
  depositParameters: DepositParameters;
};

type Input = {
  context: InputContext;
};

type MutableContext = {
  custodyProcessId?: string;
  depositMessageId?: string;
};

type Context = InputContext & MutableContext;

export const custodyDepositMachine = setup({
  types: {
    events: {} as Events,
    input: {} as Input,
    context: {} as Context,
  },
  actors: {
    custodyStatus: fromPromise(
      async ({ input: { walletId } }: { input: { walletId: string } }) => {
        const custodyCreatorStatus = await queryClient.fetchQuery(
          custodyCreatorGetWalletQuery(walletId),
        );
        return custodyCreatorStatus;
      },
    ),
    createCustody: fromPromise(({ input }: { input: { aoSigner: AoSigner } }) =>
      custodyCreatorCreateCustody(input.aoSigner),
    ),
    vouchCustodyStatus: fromPromise(
      async ({ input: { walletId } }: { input: { walletId: string } }) => {
        const vouchCustodyStatus = await queryClient.fetchQuery(
          vouchCustodyGetProcessIdQuery(walletId),
        );
        return vouchCustodyStatus;
      },
    ),
    vouchCustodyRegister: fromPromise(
      async ({ input: { aoSigner } }: { input: { aoSigner: AoSigner } }) => {
        vouchCustodyRegisterCustody(aoSigner);
      },
    ),
    transferDepositToCustody: fromPromise(
      async ({
        input,
      }: {
        input: {
          aoSigner: AoSigner;
          depositParameters: DepositParameters;
          custodyProcessId: string;
        };
      }) => {
        const res = await custodyDeposit(
          input.custodyProcessId,
          input.depositParameters,
          input.aoSigner,
        );
        return res;
      },
    ),
  },
  guards: {
    statusSuccess: (_, params: { status?: string }) => {
      return params.status === "Success";
    },
    statusPending: (_, params: { status?: string }) => {
      return params.status === "Pending";
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkIAbMAYgG0AGAXUVAAcB7WXAF1w-ysQAD0QBGACwMSAVgDsMmQA4GATjlyxDCQDYANCACeiHTJKqJSrarHKGO1QCZVAXxcG0WPIVIBhAK6wPBwQhgAEAMpgPP5sNBACYCRB6DxJnjgExCQBQSHhUTFsjCxIIJzcfAJCoggAzNqqJHWOSqp1FgwtdTIGxghaOiS2Ym0KznU6jnV1bh4YmT45gcGhkdGx5FS0JUIVvPyCZbUddSTOIzP2zjISfeLKJHI9YqNKdbqOijJzIBne2VyqwKGzYOWwYEwAGsCFAwkD8vFEiQCAA3DhQ9ILAF+Fb5dZFcGQmH4OEI0IINEcTCpQ4lXZlfZVI6gWoaOQkBhyJQ6Kaqfm89r3AYSRwkUxcuQ6STTVRKJQ-dx-bFZXF5NaFTa+CHQ2HwvGhJGEFH4dGYkj-VXLdUgwna4l68mGSmm6m0gT0sSldhcA7VY6IKViEjvdmObRdHTy4WOXnnRyOMQzDQSSbqRXzLxWp0ErU6klkg2GI1JKnmy1LHOasH23Wk-U2l3omnM+mOb3lX3MmqIKzB3T88NiHQKUZ3IyICSjcx9mQMMT8rkqHS-CuAou5mv5x1FmhgABO+44+5IbEoqQAZsfUBaVZWN9WiXXC42qS26cwGT7KocewgZDMIYAWIzwTNyIHCqoc7DHOziaBI6gKhIq53uuNqbjk+5gLS9Y5gACkemBwLAWzUPQzB7F2v4BgMMxNO8jiaPymivLowoSKmIYMK0cgJloPKmBmypZve6GPr4WE4S+wJhAR1LEZh2F8Lhu4JMaZZYiJaEyeJknKdJ+JyURsAkRJSk7q+rrvh6n4UYyVH+qy4jPMGMitA0jhTkoUpyOxMhNOoXzSkxbliI4KFaWqOmgopUkNjJRkKWZcVOnuh7Hqe548Fe+43muUX4rp5kqehiUmbF+nxfkTZuq2tkdky1FOSKqhDD0yhQZ1kpKJBHxPHIqZRnKc4dMhSr5da0V2npFkJYRCkAOroAc9aYAIF64Ll7r4KRtDCCkaQkOgF5pPuyBaAwDBEDQE1VjFyWVfh83lUtK1wmt+AbVtzK7V+nY-o5IiIImOjSABHRQZ53FChOCC6EonJuZMCE6B0vKzONqEFRq90zSVc3yS9y2VR9X0YD9ABKkLbvWEQ8KkgQliaZqaYs2mFbjxUGWsZUka9JPrZt5OHCQVM4A6tP0zEsA1dZ+D0nZ35+iyQMIAmNiyFKpwLjY3njv0ihikuXyXTyMi8koEVs9jtpanj3PhLzJD83qpNC9tovUxLcJ0wzsBMxpt6RZNHPTVzVU889fPE67gvfSLYs0z7UuBLL22eg1Dkq7UCZSs07WG-YEha8KphNHI3FWObfE9K4mPB3dYcpRuTsu6tcfCwInvi8+kQp-7amlq65ZYyHONN49LdR87Mft597uU17ve+9Lad1UwdDtpRAPZ8DLRmK1Gh1MOtzPD1sMCcMo3H8BmjSlbOJj7bNb2xHjvT2370dx7ife33ftpSPCeM8l5rxB2tk-DCD1ZqGQ-rPL+8945d1-svfua8Pwb0Vv9ZWf5pjvFkKKGQIFphJjqL5WG7QJD9VFK1ZQKh5wPytAANQ4P4HAm4mYHVZo-FhbDsCbj+o1QGtRQbDmaLyYcrwGDmwVMKSQAVuLI0urGUUCFGFLF4ewx8FAyKCKzn+GYCpzgKkunKHWlhz79EkGYJQHErDSnnANNR9cIGaP4eJJOb8whUygLgII+5toB2Htw5hrCtH3U8TmHxfieABOZOgmymDM47wMUocMIYrDvDSSoc2Fg5EVyeKDXOlCpStRXC4nhYT3ERL-lEsAvj-GBMHszDEISNFVKgZEjc0TGnxLfOnT8Xpt44JonUHJTwOLaBAioeG5D+ixjOBXQhqN5AVx6HIdR2Q3GdNqd0+pMS4mHEARlEB2UwETW2R43Z6EemxO2gk+W9VhndlGYoDkPRi6mDCq1VMkFJDDC0CBeQXzLrlMzK4jpj5bkHhgZHQmJEdE7CwUI3ecMZhUJ5KMTy6s2KwzIUMVQ0iK5tFeEfS2FTQl8IwtC-csL37ws9g006dKgks3AZUqlUL9lBBhfjWBDKaV0oeQrZJIzmrF38uYZ4RC5xaDnPoPFPJORBXUCOYcxKwXCQhZymKgq+VwuMiRPVDtjnAKyjlPKo9Lm6u5cy-V9LDWMpibyh2wqnn2RSTRDiGhxT2DCrY6Uow-lUKkUCqURDQWbNINawkxqvFO18B3Ol3jbWHK7oimg+0pZJGOqdc6l0ro3StZCm1TKXXxunomxBqBk23LTTtRFejPXNSIRYJ4ThExhVTB0dimhzCMR6NIqQvJbhRpIDGzYcanoMqrWTWtqaf5LwLCmpl9bWWtPZZS8JsbbXlunY62dQt52rsXT3Zddb7n9PXk2sVqsALTHFHKBQkwoy3EcMKfy0gRy3H5JIU2ddwUcu3ZO3dtL7WyUrUm8DF7F5nr1DBo5zTA4XJLTustYGHYQZnVBzDCHkFLvgwuvpVkBkbyGR629tRwZDHeFGBcqNSliFLrxK+LQeQMD7KIsdE6wRTqnth6tx6Dmns8Xh-AprMqgNypu9pOq0POowxWgTc7oNEYTgR+sYm3VJOeU1O9o0SBTkkMS7Jw5hRtDFFKcMRdGJELGWOgAImARqpJdrkVFS85qqMnAArnMXCwSZeRyKIU8RozwNDmyXBsilSwnMuagCQCI2AOAAHdHTf2ZDQQ9uUwhxa7DezzqsozzmaIoKcQVWKqGC9IcM3adAcRaP6sagGrR5Z-K5pLqX0vVsCb4dA+AiKUFy85-LyL9E0VMNKQzLQAv8XlFVvFfVhzvDsG5BwU4hITTa29EgAAVAJ+BYAXgPOukewdtv6T2wdo7B5tMFb02yMh0hnifOhgoZ4cipvFykObDoKhpgtDcEqfAIQ4BCHyrp4RiAAC0HILA8laCBNQ0i1AKv6NDqcME0ncS5E4Sw7Qx2Ish6iqQiMkyaDSYSiwhL9YmBDbYBrHxeLcneGOxusRie4PkOKFovEkzKB4gt-ouhhj1c0EGWwcptBs4fDFInFHCsnGkTzxiiYejZLkELh4HIEJdC+Fi0wiYZdiRqb3J0nOaJEIRp8DjA0yHuUseIQClgtbHx5O8fkGMWuiSmpsAAEugeACuHvA0p80Vooo0Z8XfbDWwCNNBIwkLBCwuhje+5fuHfdxELfNVJWcereCkyJluNoGMoNOSa8mF8JPCpvLRe9+zcedtM-8cdfLpWivxB8XFJHqwjWS+07hsXTkZCLqDU18oevWrH7s4z83UqlbX7m+D1DkUKhzD1asPObi8g5TsTUCGWMjQegNArpt0es+KrJtbvAsIbskEqxRbggtzR5GgsIV0OowomeGe4q0XWCEbQzW0+2YsuE81+cCb0d+GWIs7e2Cneas2gCMx8uuNmI0X+sMxcYoCEw4P2SekoXwaeocze8+BMjqn80BPWsGniK8gQOeqsAOQwA6Ti84wEg+qYVCvEoUAuRmzEY61YAAoulPuPQVRhxOXGoEnoSqYAqL0BQj5gBO8G7qKEjufsHDxqIYgC0ImBvrcCoExLYkmB+gjKMHKIGnKAhJ5GINxqhpsHAU-qMrGAFKYJYFyAuIYRgVYknrIGFNyNyPitMNxDYXJnmNcjJGJpofUMBOKKDFYIjm0AKHIt4UQq0JXK0LvuFDFlsrYWCA5okJERkYZtXCBEmCMJ9mYLxCtiChxtKMAShiEbxqBhAfCpEVOPyOcNDGQrxJ5CODGPKPnCoPvGMvVjYHUcWg0U6jyoplnuVPYeNuKp5ByOGGBN0boHMloQoDEWoE9nOMol7iAbJsBo0ehs0Y6nxjaK0UnkMN+moGFNoAxt-psbyNsWfgWtMMEUcZMXaphgmjhl4hESvqinOJKqQrxHKLGEAd-vgrXKYEsiBBYh8dUvJlMacUlH8XUiej9HMc2neloByKCc4GkkNOwQUlGBVooMfPOFBIidSk0eBr8YJqppiepnBppmpoDA4S2pMIsqwasgmN9r2l+mkubLYMBFSWoRAhdrCJEVMOkmmA4BDKIp4ZOAjISvimthDKrmMediNu1gltiZRiYBCeIq1O0AKPOMqQMCFvblBICv5BZvsVtrqTtvtv1jdiIYCX+GfhyFGF5G0EQrEXIpMPGLyOtgNPOK8BKY-FKR1slmlrhDARyfMUVgBDrsVloGjJDMFsGDaboHcVIP6WOgAKqwAHjwj9aDbUAQAym3BULqCpitSS60bsRiLtQqIJj+mozamSnOmXZ5GECRFShRihZSDDiow75Max6Sr1aBYKBSBOEE5A5AA */
  context: ({ input }) => input.context,

  states: {
    Idle: {
      always: "Custody Setup",
    },

    "Custody Setup": {
      states: {
        Idle: {
          always: "Checking Custody",
        },

        "Checking Custody": {
          invoke: {
            src: "custodyStatus",
            input: ({ context }) => context,

            onDone: [
              {
                target: "Has",

                guard: {
                  type: "statusSuccess",
                  params: ({ event }) => event.output,
                },

                actions: assign({
                  custodyProcessId: ({ event: { output } }) => output.processId,
                }),
              },
              {
                target: "Creating Custody Process.Waiting confirmation",

                guard: {
                  type: "statusPending",
                  params: ({ event }) => event.output,
                },

                reenter: true,
              },
              {
                target: "Creating Custody Process",
                reenter: true,
              },
            ],

            onError: "#(machine).SetupError",
          },
        },

        Has: {
          type: "final",
        },

        "Creating Custody Process": {
          states: {
            Idle: {
              always: "Creating Custody",
            },

            "Creating Custody": {
              invoke: {
                src: "createCustody",
                input: ({ context }) => context,

                onDone: {
                  target: "Waiting confirmation",
                  reenter: true,
                },

                onError: "#(machine).SetupError",
              },
            },

            "Waiting confirmation": {
              states: {
                Idle: {
                  after: {
                    "1000": "Rechecking Status",
                  },
                },
                "Rechecking Status": {
                  invoke: {
                    src: "custodyStatus",
                    input: ({ context }) => context,

                    onDone: [
                      {
                        target: "#(machine).Custody Setup.Has",
                        reenter: true,

                        guard: {
                          type: "statusSuccess",
                          params: ({ event }) => event.output,
                        },

                        actions: assign({
                          custodyProcessId: ({ event: { output } }) =>
                            output.processId,
                        }),
                      },
                      {
                        target: "Idle",
                        guard: {
                          type: "statusPending",
                          params: ({ event }) => event.output,
                        },
                        reenter: true,
                      },
                      {
                        target: "#(machine).SetupError",
                        reenter: true,
                      },
                    ],

                    onError: "#(machine).SetupError",
                  },
                },
              },

              initial: "Idle",
            },
          },

          initial: "Idle",
        },
      },

      initial: "Idle",

      onDone: "#(machine).Vouch Setup",
    },

    SetupError: {
      type: "final",
    },

    "Vouch Setup": {
      states: {
        Idle: {
          always: "Checking Custody Registration",
        },

        "Checking Custody Registration": {
          invoke: {
            src: "vouchCustodyStatus",
            input: ({ context }) => context,

            onDone: [
              {
                target: "Done",
                guard: {
                  type: "statusSuccess",
                  params: ({ event }) => event.output,
                },
              },
              {
                target: "Registering Custody Process",
                reenter: true,
              },
            ],

            onError: "#(machine).SetupError",
          },
        },

        Done: {
          type: "final",
        },

        "Registering Custody Process": {
          states: {
            Idle: {
              always: "Registering Custody",
            },

            "Registering Custody": {
              invoke: {
                src: "vouchCustodyRegister",
                input: ({ context }) => context,
                onDone: "Confirming Custody Registration",
                onError: "#(machine).SetupError",
              },
            },
            "Confirming Custody Registration": {
              states: {
                Idle: {
                  after: {
                    "1000": "Rechecking Registration",
                  },
                },

                "Rechecking Registration": {
                  invoke: {
                    src: "vouchCustodyStatus",
                    input: ({ context }) => context,

                    onDone: [
                      {
                        target: "#(machine).Vouch Setup.Done",
                        guard: {
                          type: "statusSuccess",
                          params: ({ event }) => event.output,
                        },
                      },
                      {
                        target: "Idle",
                        reenter: true,
                      },
                    ],

                    onError: "#(machine).SetupError",
                  },
                },
              },

              initial: "Idle",
            },
          },

          initial: "Idle",
        },
      },

      initial: "Idle",
      onDone: "Depositing",
    },

    Depositing: {
      states: {
        Idle: {
          always: "Showing Confirmation",
        },

        Transfer: {
          invoke: {
            src: "transferDepositToCustody",

            input: ({ context }) => ({
              aoSigner: context.aoSigner,
              depositParameters: context.depositParameters,
              custodyProcessId: context.custodyProcessId!,
            }),

            onDone: "Done",
          },
        },

        "Showing Confirmation": {
          on: {
            "Confirm Deposit": "Transfer",
            "Cancel Deposit": "#(machine).User Cancelled",
          },
        },

        Done: {},
      },

      initial: "Idle",
    },

    "User Cancelled": {
      type: "final",
    },
  },

  initial: "Idle",
});
