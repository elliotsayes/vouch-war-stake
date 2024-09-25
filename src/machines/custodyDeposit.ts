import { DepositParameters } from "@/contract/custody";
import { createCustody, getWalletQuery } from "@/contract/custodyCreator";
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
        const custodyExists = await queryClient.fetchQuery(
          getWalletQuery(walletId),
        );
        return custodyExists;
      },
    ),
    createCustody: fromPromise(({ input }: { input: { aoSigner: AoSigner } }) =>
      createCustody(input.aoSigner),
    ),
  },
  actions: {
    assignCustodyProcessId: (
      _,
      { custodyProcessId }: { custodyProcessId: string },
    ) => assign({ custodyProcessId }),
  },
  guards: {
    custodyIndexSuccess: (_, params: { status?: string }) => {
      return params.status === "Success";
    },
    custodyIndexPending: (_, params: { status?: string }) => {
      return params.status === "Pending";
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgEkIAbMAYgG0AGAXUVAAcB7WXAF1w-ysQAD0QBGACwB2EgDYArAA5F8hrLFipDVfIA0IAJ6IAnMZJSAzBIuzZE+QCZjEh9IC+b-Wix5CpAMIArrA8HBAGAAQAymA8gWw0EAJgJCHoPCneOATEJEEhYZExcWyMLEggnNx8AkKiCBYMEmYWDorGFs4MrRZ6huJqJGLyYu1Sjh2yDhYWHl4Y2X55waHh0bHx5FS0ZUJVvPyCFfWdFiROw2Izak7yEvpGCMOK5r0aylZT8t9zIFm+uXyqyKGzYeWwYEwAGsCFAIkDColkiQCAA3DhQzILAEBFaFdYlcGQmH4OEI8IINEcTDpQ5lXYVfY1I6gepSdkkBhSRS2JymWwdB7iFxyVTs9QuTrKeS-f45XEFNbFTb+CHQ2HwvHhJGEFH4dGYkhypbkkGE1XEjWmyn66m0gT0sTldhcA61Y6IKTqEiKCzsqQOJrdWTKIUIBy2c4OBxXP1SayyYzjWXY+XLRVmlVqklkrUGHUpKmG42AvMErOW0majM29E05n0hzOyqu5l1RCKDQkCSJ4yBsSycaje79BASUYkYyd4YMMSmLmKNQpnxp03lsH+ABOYFpVbXAAVN9S4LAttR6Mw9q3Du2njMzL6HFI50mNJJZGGJNYfQw2gGYwwPIKDKnh-KmJplsqG7bruuYZhEh7HrAp5bjufB7nmBZ6gaWIrhB8FQXkMHoXBwIIUemAnkRaFWnmtZ2g2zAMi61Q3h6TyWGIJCOL6v7jooXpSJ+8hmEmDjyOoz7GI4YgOMuiylgRoLUbB1ZkYhlHISQADq6AHFWmACAAZrgm4YMyZ60MIaQZCQ6BGRkm7IIGDAMEQNAlgqZGEahqkHhRVG6fpcKGfgJlmfa+CWcxLase6rKIDGsgMNx97Sa4v6CqOPYvNo0x2MYsidLYsygZ56becpvkkWp+IaYFek1aF4XmYcJAAEqQtmGpRDw6TBFhRa4QpXn4j5xG0fB9VaUFTXGaZrUCB1XWVnCvX9bA9H1nSTGXoy17xSIiUXNxXqnC+ozxmG3wOJy3Lia5PISSG8k4hVY1VRNGFTQFM2NRqzULZFy04Kt0R9XEsCDbaxbgYplXml9pF1b9p6zQD80RRZnWg+qVbrZDW2RY6zZMmxCXhk+sgkDM3w3Wo0hFWGChmFobTDFMMa9MYr2rpBn00d96mozp-0GZji1RTj3X4xDA1JLqQ1GnDo1KgLflltNaNiyFEvA9LYME8EROMUwdBNlecUskd4atPIk6DpxCjSBYihhkBQydNYwwWJoA5iLz+EIyqSO1WsWui8FESA1jbUG3ja1y1DYCbkem4kGwlDpEZHBmcreHwx9iOC8j4ci+j4thUD2MrQn4MbSbO1m3tLFutb9TTL63EuI4yWydGYhhtJZyOOOT5Jn6gEB78+BhHAQieZbbe3rJYYALTjkMShXIoTgRioPKB7kFDUEvbbsclQ8vBI7Tb1+ph9nOR+q5mbBn+TNviTIRVPlzSh-sYT81MBzSHElMVomhD5lRVu9NWhIT5gHfodE42g5CtADFcf+AlAGjmGDIZo3RxKjAjDJZ+sDX5EjrqaJB7dEAjGvlMQC8Y-RtFdmGWM3YBJFV9jyX0phSrzALi-dcJAAAS6B4D7StreNoTgaZtElIVAeDh2FKHMMMaY9hMpflkGQtc40S5h0iFrGhK9NBnDsJ3K4MY7hNDDBGFKXJnDYL7L7cSej+bFw1j9JCp4EGmPYv3LiljXbWOGBIOx2VpCcj9GIVyCYpDSQEh4pSXiar+V8SpdJeYAkU0kIuB2N84lxK-lOT8DAHwOOaL0RoWgQKCJGuQkR1VJrC0yRXXWVdY6HTJsgxKrkUq+wIQzB6MwwxWHwb+N4xhAJJXcdAoRTSDHeLaZpbWUcY6S0srkz+TQXhDJmSM1QYzsoBm7MYEB2gtHsnmQ0t6+j1bZJ8WsyOc0ulbPjjmeukMdkdxmNTJ8fovyznkEMz8VhzDiRsbvccL4pBkIAKKp1zr8xK4xboSQejY6Swx3YdHMLCgM8ZVBxMUGQgAahwQIOB1yooaNMLiAZxyNCmEVLk7tHHjADFMX0XpWEUqpTSwi-ipHL3Yug1mrgrg3DZUJXBg4aZThErOfktgJIeA8EAA */
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
                  type: "custodyIndexSuccess",
                  params: ({ event }) => event.output,
                },

                actions: {
                  type: "assignCustodyProcessId",
                  params: ({ event }) => ({
                    custodyProcessId: event.output.processId!,
                  }),
                },
              },
              {
                target: "Creating Custody Process.Waiting confirmation",

                guard: {
                  type: "custodyIndexPending",
                  params: ({ event }) => event.output,
                },

                reenter: true,
              },
              {
                target: "Creating Custody Process",
                reenter: true,
              },
            ],
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
              },
            },

            "Waiting confirmation": {
              states: {
                Idle: {
                  after: {
                    "2000": "Rechecking Status",
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
                          type: "custodyIndexSuccess",
                          params: ({ event }) => event.output,
                        },

                        actions: {
                          type: "assignCustodyProcessId",
                          params: ({ event }) => ({
                            custodyProcessId: event.output.processId!,
                          }),
                        },
                      },
                      {
                        target: "Idle",
                        guard: {
                          type: "custodyIndexPending",
                          params: ({ event }) => event.output,
                        },
                        reenter: true,
                      },
                      {
                        target: "#(machine).Error",
                        reenter: true,
                      },
                    ],

                    onError: "#(machine).Error",
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

    Error: {
      type: "final",
    },

    "Vouch Setup": {
      states: {
        Idle: {},
      },

      initial: "Idle",
    },
  },

  initial: "Idle",
});
