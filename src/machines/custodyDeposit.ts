import { DepositParameters } from "@/contract/custody";
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
};

type Context = InputContext & MutableContext;

export const custodyDepositMachine = setup({
  types: {
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
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkIAbMAYgG0AGAXUVAAcB7WXAF1w-ysQAD0QBGACwMSAVgDsMmQA4GATjlyxDCQDYANCACeiHTJKqJSrarHKGO1QCZVAXxcG0WPIVIBhAK6wPBwQhgAEAMpgPP5sNBACYCRB6DxJnjgExCQBQSHhUTFsjCxIIJzcfAJCoggAzNqqJHWOSqp1FgwtdTIGxghaOiS2Ym0KznU6jnV1bh4YmT45gcGhkdGx5FS0JUIVvPyCZbUddSTOIzP2zjISfeLKJHI9YqNKdbqOijJzIBne2VyqwKGzYOWwYEwAGsCFAwkD8vFEiQCAA3DhQ9ILAF+Fb5dZFcGQmH4OEI0IINEcTCpQ4lXZlfZVI6gWoaOQkBhyJQ6Kaqfm89r3AYSRwkUxcuQ6STTVRKJQ-dx-bFZXF5NaFTa+CHQ2HwvGhJGEFH4dGYkj-VXLdUgwna4l68mGSmm6m0gT0sSldhcA7VY6IKViEjvdmObRdHTy4WOXnnRyOMQzDQSSbqRXzLxWp0ErU6klkg2GI1JKnmy1LHOasH23Wk-U2l3omnM+mOb3lX3MmqIKzB3T88NiHQKUZ3IyICSjcx9mQMMT8rkqHS-CuAou5mv5x1FmhgABO+44+5IbEoqQAZsfUBaVZWN9WiXXC42qS26cwGT7KocewgZDMIYAWIzwTNyIHCqoc7DHOziaBI6gKhIq53uuNqbjk+5gLS9Y5gACkemBwLAWzUPQzB7F2v4BgMMxNO8jiaPymivLowoSKmIYMK0cgJloPKmBmypZve6GPr4WE4S+wJhAR1LEZh2F8Lhu4JMaZZYiJaEyeJknKdJ+JyURsAkRJSk7q+rrvh6n4UYyVH+qy4jPMGMitA0jhTkoUpyOxMhNOoXzSkxbliI4KFaWqOmgopUkNjJRkKWZcVOnuh7Hqe548Fe+43muUX4rp5kqehiUmbF+nxfkTZuq2tkdky1FOSKqhDD0yhQZ1kpKJBHxPHIqZRnKc4dMhSr5da0V2npFkJYRCkAOroAc9aYAIF64Ll7r4KRtDCCkaQkOgF5pPuyBaAwDBEDQE1VjFyWVfh83lUtK1wmt+AbVtzK7V+nY-o5IiIImOjSABHRQZ53FChOCC6EonJuZMCE6B0vKzONqEFRq90zSVc3yS9y2VR9X0YD9ABKkLbvWEQ8KkgQliaZqaYs2mFbjxUGWsZUka9JPrZt5OHCQVM4A6tP0zEsA1dZ+D0nZ35+iyQMIAmNiyFKpwLjY3njv0ihikuXyXTyMi8koEVs9jtpanj3PhLzJD83qpNC9tovUxLcJ0wzsBMxpt6RZNHPTVzVU889fPE67gvfSLYs0z7UuBLL22eg1Dkq7UCZSs07WG-YEha8KphNHI3FWObfE9K4mPB3dYcpRuTsu6tcfCwInvi8+kQp-7amlq65ZYyHONN49LdR87Mft597uU17ve+9Lad1UwdDtpRAPZ8DLRmK1Gh1MOtzPD1sMCcMo3H8BmjSlbOJj7bNb2xHjvT2370dx7ife33ftpSPCeM8l5rxB2tk-DCD1ZqGQ-rPL+8945d1-svfua8Pwb0Vv9ZWf5pjvFkKKGQIFphJjqL5WG7QJD9VFK1ZQKh5wPytAANQ4P4HAGEKBkT+o1QGJw6gKnOAqS6codaWHPv0SQZglAcSsNKecA0EKMKWCwth2AoFJzfmEKmUBcBBH3NtAOw9WaPxUew8SGiczaN0TwfRzJ0E2UwZnHef5+HhhDFYd4ShWgMHNhYYUIFpBSm4oxShUpWornrhA0xajzF-0sWAHReiDGD2ZhiYxzDWFmPuhYjcVikl2LfOnT8Xpt44JovwnxTwOLaBAioeG5D+ixjOBXQhqN5AVx6HIJR2RokYTyadGBkdCYkU4TsLBPDd5wxmFQnkoxPLqzYrDMhQxVA+Irm0V4R9LaRJMZkmJMV+kHkGe-YZntEkDPxoiFJgcJq9MfIc-cxzZLTwecc+x8t6qlO7DRYu-lzDPCIXOLQc59BLJ5JyIK6gRzDnWREzMUS9l9ISdYo5lyhnGVMh3J5-TbEi1GTQfaUskjHVOudS6V0bqjzuQc5FQRUUO2eac3wWK0XhBxR7UZ3Cs5-iIRYJ4ThExhVTB0dimhzCMR6D4qQvJbjdNINSwkrzWWMoxTkFlDL2WLx7gWLRtKbHJORDcqliL7l6vpZop2zLEGoGxXq3FyCl46s1Ycd5CsnFlOagBaY4o5QKEmFGW4jhhT+WkCOW4-JJCmzrvC3ZqikXnPNU9Jl6rNHOoddqvUab8CGJZuA2NWTFVmsecqy1Kb4nnPtTtFBTq7XbVdcU913zPUzCGO8KMC5UZhLEKXXiV8Wg8gYH2UGYg5UkAVZsJVDLS3WttRWn+jrM21uZIAjKIDspgNuSamlCbi1Tunlasms7rGVu7horN9bHFfKaqrACfKpySHWV42Rwo2hiilOGIujEiH8NHeOrccTclLsOCu4BWUcp5WNXG2Jvdy3HrrYU9eXLnHlMUByHoxdTBhVaqmSCkhhhaBAvITDl04XCQRVB7dKLd0WpeUW45IHMqgNynmjJFHC07qeU7Sdb8L1IY9arDiGhxT2DCtI6UoxcNUNePIojRCSO-q3UUJmB10nKMU7EPjTbVbDraryYc0nzYKn8Qhcw3FkaXVjKKRRvx8AhDgEIfKV7eGIAALQcgsDyVoATVlzlasKFzU4YJeMYtI24T7o1kcfqMpzkypCIyTJoLxqyLCrP1iYKTtgOLTN4tyd4o7G6xBi7g+Q4oWi8STMoHiqh2JDGHAODx8pRP5YfDFaL9lkPNQaGYVGjFEw9CfXIarsNbAcgQl0L4czTCJma2JbJAGbRFZokQhGnxB0DTIe5cR4hAKWC1sfHk7x+QYxjdmFrhIAAS6B4Dtf4znJLzRWiijRnxINw3HiaCRhIWCFhdAzamnbcOSaMWLeapss4OgntWBaJl7QMZQackGx8aR9h3huS6Ts07s2J6cenm1pWWnahhUTOKSHSZEy3Fh7DQTnIyEXUGoN5Q6OTuiX+y-QHU8mWvydCD1WkgVDmAh1Yec3F5BynYmoEMsZGg9AaBXISt0zsA+bqVOBb0whuyQSrCZuDyXNEkKsz9I06jCg+KNszc4vs8RHRjlnocleTxV6cz+6vv4-Tx9ggnwNtAI2PmNw3XRjdU97QhOrUq5waC+H9u3bPlcE1Vc7jXncq0Lsln7HnOcW3nGeAo+cwE0tTKobxUKlX73MVHdWAAoulfc6fEC3BMxXCwIbTAKl6BQpwsh+EzDHImOXCm2OFZu57+ofEBdha5AuaRSZg0I1GHKeUIWQ+mH7wWzY7vtflNjAFUwlgJ9yinIHiRX3ZBhW5NyZZ0xuIr-2XaHJ6Es21-qMBcUoMrBebaAKYzZgiHeNaK0UX4UNuPS6mYIAAIokI-gAZLgoOHlIGFP4gBCGC0MXG-mfKmNfvGlRjjsMo-lOPyOcNDGQrxJ5CODGG0MMJoBtsFIlgBBgaahxiWrjtsLgZ5ByOGGBMQboA0ogGQt1qDO0HLuStMHQZRnStRkDgpNxtzkPterUBxObOKAoGoGFNoJ2ibgoC-moGQj4kIcdpFqxqvmCFIRzqqgekLEevktehvp6j4k0KQrxHKLGG0PnvwlJk4K1GZsfCQSIexlgYwcmjOsqlmrtJAVoByPYc4F4kNPnsXKGl4ubLYMBPOFBD4ROnRv4aYWWoBnOlqmekBoDNYTepMM0rnu0gmMXDERXOKPEdKIoMfMkfLqPKAWAI1KSI-lMIxAQlIINutgBNwSKAjPYLQj4lYBxBxIAcztkM0a0VACETIc5ggFMBofXlyOoKmH0TGH1IoE4G5PKAOsvkAaQNMVRKSCQAACr6L4CwAXgHjtEcRNDdAXCwSwSbFULbFwTcj-7myKhuBAA */
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
        Idle: {},
        Transfer: {},
      },

      initial: "Idle",
    },
  },

  initial: "Idle",
});
