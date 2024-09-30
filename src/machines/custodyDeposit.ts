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
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkIAbMAYgG0AGAXUVAAcB7WXAF1w-ysQAD0QBGACwMSAVgDsMmQA4GATjlyxDCQDYANCACeiHTJKqJSrarHKGO1QCZVAXxcG0WPIVIBhAK6wPBwQhgAEAMpgPP5sNBACYCRB6DxJnjgExCQBQSHhUTFsjCxIIJzcfAJCoggAzNqqJHWOSqp1FgwtdTIGxghaOiS2Ym0KznU6jnV1bh4YmT45gcGhkdGx5FS0JUIVvPyCZbUddSTOIzP2zjISfeLKJHI9YqNKdbqOijJzIBne2VyqwKGzYOWwYEwAGsCFAwkD8vFEiQCAA3DhQ9ILAF+Fb5dZFcGQmH4OEI0IINEcTCpQ4lXZlfZVI6gWoaOQkBhyJQ6Kaqfm89r3AYSRwkUxcuQ6STTVRKJQ-dx-bFZXF5NaFTa+CHQ2HwvGhJGEFH4dGYkj-VXLdUgwna4l68mGSmm6m0gT0sSldhcA7VY6IKViEjvdmObRdHTy4WOXnnRyOMQzDQSSbqRXzLxWp0ErU6klkg2GI1JKnmy1LHOasH23Wk-U2l3omnM+mOb3lX3MmqIKzB3T88NiHQKUZ3IyICSjcx9mQMMT8rkqHS-CuAou5mv5x1FmhgABO+44+5IbEoqQAZsfUBaVZWN9WiXXC42qS26cwGT7KocewgZDMIYAWIzwTNyIHCqoc7DHOziaBI6gKhIq53uuNqbjk+5gLS9Y5gACkemBwLAWzUPQzB7F2v4BgMMxNO8jiaPymivLowoSKmIYMK0cgJloPKmBmypZve6GPr4WE4S+wJhAR1LEZh2F8Lhu4JMaZZYiJaEyeJknKdJ+JyURsAkRJSk7q+rrvh6n4UYyVH+qy4jPMGMitA0jhTkoUpyOxMhNOoXzSkxbliI4KFaWqOmgopUkNjJRkKWZcVOnuh7Hqe548Fe+43muUX4rp5kqehiUmbF+nxfkTZuq2tkdky1FOSKqhDD0yhQZ1kpKJBHxPHIqZRnKc4dMhSr5da0V2npFkJYRCkAOroAc9aYAIF64Ll7r4KRtDCCkaQkOgF5pPuyBaAwDBEDQE1VjFyWVfh83lUtK1wmt+AbVtzK7V+nY-o5IiIImOjSABHRQZ53FChOCC6EonJuZMCE6B0vKzONqEFRq90zSVc3yS9y2VR9X0YD9ABKkLbvWEQ8KkgQliaZqaYs2mFbjxUGWsZUka9JPrZt5OHCQVM4A6tP0zEsA1dZ+D0nZ35+iyQMIAmNiyFKpwLjY3njv0ihikuXyXTyMi8koEVs9jtpanj3PhLzJD83qpNC9tovUxLcJ0wzsBMxpt6RZNHPTVzVU889fPE67gvfSLYs0z7UuBLL22eg1Dkq7UCZSs07WG-YEha8KphNHI3FWObfE9K4mPB3dYcpRuTsu6tcfCwInvi8+kQp-7amlq65ZYyHONN49LdR87Mft597uU17ve+9Lad1UwdDtpRAPZ8DLRmK1Gh1MOtzPD1sMCcMo3H8BmjSlbOJj7bNb2xHjvT2370dx7ife33ftpSPCeM8l5rxB2tk-DCD1ZqGQ-rPL+8945d1-svfua8Pwb0Vv9ZWf5pjvFkKKGQIFphJjqL5WG7QJD9VFK1ZQKh5wPytAANQ4P4HAm4mYHVZo-FhbDsCbj+o1QGtRQbDmaLyYcrwGDmwVMKSQAVuLI0urGUUCFGFLF4ewx8FAyKCKzn+GYCpzgKkunKHWlhz79EkGYJQHErDSnnANNR9cIGaP4eJJOb8whUygLgII+5toB2Htw5hrCtH3U8TmHxfieABOZOgmymDM47wMUocMIYrDvDSSoc2Fg5EVyeKDXOlCpStRXC4nhYT3ERL-lEsAvj-GBMHszDEISNFVKgZEjc0TGnxLfOnT8Xpt44JonUHJTwOLaBAioeG5D+ixjOBXQhqN5AVx6HIdR2Q3GdNqd0+pMS4mHEARlEB2UwETW2R43Z6EemxO2gk+W9VhndlGYoDkPRi6mDCq1VMkFJDDC0CBeQXzLrlMzK4jpj5bkHhgZHQmJEdE7CwUI3ecMZhUJ5KMTy6s2KwzIUMVQ0iK5tFeEfS2FTQl8IwtC-csL37ws9g006dKgks3AZUqlUL9lBBhfjWBDKaV0oeQrZJIzmrF38uYZ4RC5xaDnPoPFPJORBXUCOYcxKwXCQhZymKgq+VwuMiRPVDtjnAKyjlPKo9Lm6u5cy-V9LDWMpibyh2wqnn2RSTRDiGhxT2DCrY6Uow-lUKkUCqURDQWbNINawkxqvFO18B3Ol3jbWHK7oimg+0pZJGOqdc6l0ro3StZCm1TKXXxunomxBqBk23LTTtRFejPXNSIRYJ4ThExhVTB0dimhzCMR6NIqQvJbhRpIDGzYcanoMqrWTWtqaf5LwLCmpl9bWWtPZZS8JsbbXlunY62dQt52rsXT3Zddb7n9PXk2sVqsALTHFHKBQkwoy3EcMKfy0gRy3H5JIU2ddwUcu3ZO3dtL7WyUrUm8DF7F5nr1DBo5zTA4XJLTustYGHYQZnVBzDCHkFLvgwuvpVkBkbyGR629tRwZDHeFGBcqNSliFLrxK+LQeQMD7KIsdE6wRTqnth6tx6Dmns8Xh-AprMqgNypu9pOq0POowxWgTc7oNEYTgR+sYm3VJOeU1O9o0SBTkkMS7Jw5hRtDFFKcMRdGJELGWOgAImARqpJdrkVFS85qqMnAArnMXCwSZeRyKIU8RozwNDmyXBsilSwnMuagCQAAKgE-AsALwusAGQE66R7Bzi1RVzyX0CpfSxhjL2mb2edVuF6QzxPnQwUM8OR0pDMDWkd5lQ0wWiOec-lhLERsAcAAO6Om-syGgh7cphDy5UCremREqGDO1KcQVWKqGC9IcM3adAcRaP6sagGrTTbeiQfrQ2RvVsCb4IrRFKBTZ6zN5F+iaKmGa6mZwRmOPyjW3ivqw53h2Dcg4KcQkJpHf0kllLaXMsSdORamT2Qwewgh0VqHpXyuPebVVrkYpO3tG8p5YuljEAzDMBbVqgUJC3DGWNJU+AQhwCEPlXTwjEAAFoOQWB5K0ECahpFqAVf0VnU4YJV3lBoECoMANasfoi5nqKpCIyTJoNJhKLCEv1iYENtgdsfF4tyd4Y7G6xDl7g+Q4oWi8STMoHi33+i6GGNt8X3EBrrPJQd0SU1Niy4o5Vk40jzeMUTD0bJchbcPA5AhLoXwsWmETIbh8NTe5OhNzRIhCNPgcZd7xLJcjAKWC1sfHk7x+QY3d+zcemwAAS6B4A+7m8DFXzRWiijRnxd9sNbAI00EjSn0MOKatugnieybeYp+aqSs4228FJkTLcbQMZQaclDwhD7bR0bx7EpzZupVp7e6Vr78QfFxQt6sLtufGu4bF05GQi6g1Q-KGi2Xm2UDX77qSq-osY-VaSBUOYbbVh5xuJ5A5R2I1AQxYxGgegGgK4QdR4jcX5w438iY3owg3YkEVYUVcEC1mh5FQVCEug6hhRddDNuJWh-IFw5xT8N9PcEDt8CZHVP5UDRsRY99sED81ZtAEZj5I8bMRpCDYZi4xQEJhwpBbg5wNAvhqDQ47ZED+MGD4EmCLtYNPEV5Agv8c4ZghgB0nF5xgIL9UwqFeJQprcjNmIx1qwABRdKfcdQxAW4BCULCwT9UwBUXoChHzACd4QvUUHnWA4OHjWw+oI-WhSwLkBcWxJMD9BGUYQcc2bkRMeUN3aXLdapQkVgzA0ZWMAKUwUIpiCI-gqxSnWQMKbkbkfFaYbibjVDPMa5GSMTQIqA4MXkDjf1GIgUORIoohVoSuMg0PcKGLLZaosEBzRIQI4AoQ6uECJMEYJrMwbPHoEFDjaUfbZI2TYDXjUDEfKOQIqcfkc4aGMhXiTyEcGMeUfOeheCACdXKouTEDdDLYhldIp7cVTyDkcMMCI43QOZYnBQcUSXMhPnZRUvVYwY24jY+48DJ2PjG0HYynIYb9NQMKbQBjIg345o9oGAgtaYG49Yp1HlRTJA0yHDLxeouvFnf8aRJoUhXiOUWMNoC-MZM4WuUpJxSPSnHE1Iu4hTB4g9YkupE9H6J4zHKjLQDkak5wNJIafQgpKMFbRQY+ecKCDk6lTYyEyDQTVTAU9TODTTNTQGDIltSYRZXQ1ZBMYuaUr9NJc2WwYCRUvwiBRHUkQIqYdJNMBwCGURAoycBGQlMhDoXJCGRibreLXaZ0uk8RcnD0+cL0gYELMhG4QFfyCzYE0He7Y7QrYrTLQImAjkKMLyNoIhUGInWiLQ2MQUc0+cV4e0x+R0vrAbYbXCZg-U541WUwMhQzKMQAtGSGYLRbGk3QJEqQAs4M3rEgEYwgbMi2ULKQYcVGIApjDvSVbbQLBQKQLI9oMdAAVVgAPHhGuzAEoGoAgGdPsKlVTFalsDlEmHYjEXahUQTALNRhpxcCAA */
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

        "Transfering…": {
          invoke: {
            src: "transferDepositToCustody",

            input: ({ context }) => ({
              aoSigner: context.aoSigner,
              depositParameters: context.depositParameters,
              custodyProcessId: context.custodyProcessId!,
            }),

            onDone: "Done",
            onError: "#(machine).User Cancelled",
          },
        },

        "Showing Confirmation": {
          on: {
            "Confirm Deposit": "Transfering…",
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
