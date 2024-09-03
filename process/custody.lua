-- Set these variables before loading
-- BENEFICIARY_ADDRESS = ""
-- ALLOW_THIRD_PARTY_STAKE = true
-- WITHDRAW_TO_THIRD_PARTY = true

MIN_STAKE_QUANTITY = 10 ^ 9                    -- 0.001 wAR
MAX_STAKE_QUANTITY = 10 ^ 15                   -- 1000 wAR

MIN_STAKE_DURATION = 1 * 24 * 60 * 60 * 1000   -- 1 day
MAX_STAKE_DURATION = 365 * 24 * 60 * 60 * 1000 -- 1 year

WAR_TOKEN_PROCESS = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10"
AO_TOKEN_PROCESS = "m3PaWzK4PTG9lAaqYQPaPdOcXdO8hYqi5Fe9NWqXd0w"
VOUCHER_PROCESS = "<Voucher>"
TRIGGER_PROCESS = "<Trigger>"

STAKED_TOKENS = STAKED_TOKENS or {
  -- {
  --   Sender = "<Address>",
  --   TokenId = "<TokenId>",
  --   Quantity = "<Quantity>",
  --   StakeTime = "<StakeTime>",
  --   StakeDuration = "<StakeDuration>",
  --   WithdrawTime = "<StakeTime>",
  -- }
}

function ValidateQuantity(quantity)
  local quantityNum = tonumber(quantity)
  if quantityNum == nil then
    return false
  end
  return quantityNum >= MIN_STAKE_QUANTITY and quantityNum <= MAX_STAKE_QUANTITY
end

function ValidateStakeDuration(duration)
  local durationNum = tonumber(duration)
  if durationNum == nil then
    return false
  end
  return durationNum >= MIN_STAKE_DURATION and durationNum <= MAX_STAKE_DURATION
end

function RefundTokens(msg)
  local tokenId = msg.From
  local quantity = msg.Tags.Quantity
  local sender = msg.Tags.Sender

  print("Refunding " .. quantity .. " of " .. tokenId .. " tokens to " .. sender)
  ao.send({
    Target = tokenId,
    Tags = {
      Action = "Transfer",
      Quantity = quantity,
      Recipient = sender,
    },
  })
end

function WithdrawExpriedStakes(msg)
  for i, stake in ipairs(STAKED_TOKENS) do
    if msg.Timestamp >= stake.WithdrawTime then
      local recipient = BENEFICIARY_ADDRESS
      if WITHDRAW_TO_THIRD_PARTY then
        recipient = stake.Sender
      end

      print("Withdrawing expired stake from " .. stake.Sender .. ", withdrawing "
        .. stake.Quantity .. " of " .. stake.TokenId .. " tokens to " .. recipient)
      ao.send({
        Target = stake.TokenId,
        Tags = {
          Action = "Transfer",
          Quantity = stake.Quantity,
          Recipient = stake.Sender,
        },
      })
      table.remove(STAKED_TOKENS, i)
    end
  end
end

function HandleStake(msg)
  local sender = msg.Tags.Sender
  if (sender ~= BENEFICIARY_ADDRESS and not ALLOW_THIRD_PARTY_STAKE) then
    print("Cannot stake tokens from " .. sender)
    RefundTokens(msg)
    return
  end

  local tokenId = msg.From
  local quantity = msg.Tags.Quantity
  local stakeDuration = msg.Tags['X-Stake-Duration']
  if not ValidateQuantity(quantity) then
    print("Invalid quantity for staking from " .. sender)
    RefundTokens(msg)
    return
  end

  if not ValidateStakeDuration(stakeDuration) then
    print("Invalid duration for staking from " .. sender)
    RefundTokens(msg)
    return
  end

  print("Staking " .. quantity .. " of " .. tokenId .. " tokens from " .. sender)

  local stakeTime = msg.Timestamp
  local withdrawTime = stakeTime + tonumber(stakeDuration)
  table.insert(STAKED_TOKENS, {
    Sender = sender,
    TokenId = tokenId,
    Quantity = quantity,
    StakeTime = stakeTime,
    StakeDuration = stakeDuration,
    WithdrawTime = withdrawTime,
  })

  ao.send({
    Target = VOUCHER_PROCESS,
    Tags = {
      Action = "Stake-Notice",
      Sender = sender,
      TokenId = tokenId,
      Quantity = quantity,
      ["Stake-Duration"] = stakeDuration,
    },
  })

  ao.send({
    Target = TRIGGER_PROCESS,
    Tags = {
      Action = "Trigger-Request",
      ["Trigger-Time"] = tostring(withdrawTime)
    },
  })
end

function HandleDistribute(msg)
  ao.send({
    Target = msg.From,
    Tags = {
      Action = "Transfer",
      Recipient = BENEFICIARY_ADDRESS,
      Quantity = msg.Tags.Quantity,
    },
  })
end

Handlers.add(
  "Credit-Notice",
  Handlers.utils.hasMatchingTag("Action", "Credit-Notice"),
  function(msg)
    if msg.From == WAR_TOKEN_PROCESS then
      HandleStake(msg)
    else
      if msg.From == AO_TOKEN_PROCESS then
        WithdrawExpriedStakes(msg)
        HandleDistribute(msg)
      else
        RefundTokens(msg)
      end
    end
  end
)

Handlers.add(
  "Cron-Tick",
  Handlers.utils.hasMatchingTag("Action", "Cron"),
  function(msg)
    local sender = msg.From
    if sender ~= ao.id and sender ~= TRIGGER_PROCESS then
      print("Unauthorised Cron: " .. sender)
      return
    end

    WithdrawExpriedStakes(msg)
  end
)
