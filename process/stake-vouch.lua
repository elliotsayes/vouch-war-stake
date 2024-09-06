local sqlite3 = require("lsqlite3")
local DbAdmin = require("DbAdmin")

function Init(db)
  db:exec [[
    CREATE TABLE IF NOT EXISTS Wallet(
      WalletId TEXT PRIMARY KEY NOT NULL,
      TimestampCreated INTEGER NOT NULL,
      TimestampModified INTEGER NOT NULL,
      ProcessId TEXT UNIQUE NOT NULL,
      TotalConfidenceValue INTEGER NOT NULL DEFAULT 0
    );
  ]]

  db:exec [[
    CREATE TABLE IF NOT EXISTS StakeHistory(
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      WalletId TEXT NOT NULL,
      Timestamp INTEGER NOT NULL,
      Quantity INTEGER NOT NULL,
      StakeDuration INTEGER NOT NULL,
      ConfidenceValue INTEGER NOT NULL,
      FOREIGN KEY (WalletId) REFERENCES Wallet(WalletId)
    );
  ]]
end

VOUCH_DB = VOUCH_DB or sqlite3.open_memory()
VOUCH_DB_ADMIN = VOUCH_DB_ADMIN or DbAdmin.new(VOUCH_DB)

VOUCH_DB_INIT = VOUCH_DB_INIT or false
if not VOUCH_DB_INIT then
  Init(VOUCH_DB)
  VOUCH_DB_INIT = true
end

VOUCH_PROCESS = "<VOUCH_PROCESS>"

WAR_TOKEN_PROCESS = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10"
WAR_ORACLE_PROCESS = "<WAR_ORACLE_PROCESS>"

TOKEN_WHITELIST = {
  [WAR_TOKEN_PROCESS] = {
    Name = 'WAR',
    Ticker = 'AR',
    Denomination = 12,
    QuantityMin = 10 ^ 9,
    QuantityMax = 10 ^ 15,
    DurationMin = 1 * 24 * 60 * 60 * 1000,
    DurationMax = 365 * 24 * 60 * 60 * 1000,
    InterestRate = 0.1,
    ValueUsd = nil,
  },
}

function ParsePrice(price)
  local priceNum = tonumber(price)
  if priceNum == nil then
    return false, nil
  end
  if priceNum <= 0 then
    return false, nil
  end

  return true, priceNum
end

function UpdateTokenValues()
  local req = ao.send({
    Target = WAR_ORACLE_PROCESS,
    Tags = {
      Action = 'GetPrice',
      Ticker = 'AR',
      Currency = 'USD',
    }
  })
  local res = req.receive()
  if res == nil then
    error("Failed to get price")
    return
  end
  local isValidPrice, price = ParsePrice(res.Tags.Price)
  if not isValidPrice then
    error("Invalid price: " .. (res.Tags.Price or "<nil>"))
    return
  end
  TOKEN_WHITELIST[WAR_TOKEN_PROCESS].ValueUsd = price
end

-- Sender = sender,
-- TokenId = tokenId,
-- Quantity = quantity,
-- ["Stake-Duration"] = stakeDuration,

function ValidateArweaveId(address)
  if type(address) ~= "string" then
    return false
  end

  if string.len(address) ~= 43 then
    return false
  end

  return true
end

function ParseQuantity(tokenId, quantity)
  local quantityNum = tonumber(quantity)
  if quantityNum == nil then
    return false, nil
  end
  local tokenConfig = TOKEN_WHITELIST[tokenId]
  if tokenConfig == nil then
    return false, nil
  end
  local minValid = tokenConfig.QuantityMin == nil or quantityNum >= tokenConfig.QuantityMin
  local maxValid = tokenConfig.QuantityMax == nil or quantityNum <= tokenConfig.QuantityMax
  if not minValid or not maxValid then
    return false, nil
  end

  return true, quantityNum
end

function ParseDuration(tokenId, duration)
  local durationNum = tonumber(duration)
  if durationNum == nil then
    return false, nil
  end
  local tokenConfig = TOKEN_WHITELIST[tokenId]
  if tokenConfig == nil then
    return false, nil
  end
  local minValid = tokenConfig.DurationMin == nil or durationNum >= tokenConfig.DurationMin
  local maxValid = tokenConfig.DurationMax == nil or durationNum <= tokenConfig.DurationMax
  if not minValid or not maxValid then
    return false, nil
  end

  return true, durationNum
end

function ParseStake(msg)
  local sender = msg.Tags.Sender
  -- if not ValidateArweaveId(sender) then
  --   print("Invalid sender address")
  --   return false, nil
  -- end

  local tokenId = msg.Tags.TokenId
  if not ValidateArweaveId(tokenId) or TOKEN_WHITELIST[tokenId] == nil then
    print("Invalid token id")
    return false, nil
  end

  local isValidQuantity, quantity = ParseQuantity(tokenId, msg.Tags.Quantity)
  if not isValidQuantity then
    print("Invalid quantity")
    return false, nil
  end

  local isValidDuration, duration = ParseDuration(tokenId, msg.Tags["Stake-Duration"])
  if not isValidDuration then
    print("Invalid duration")
    return false, nil
  end

  return true, {
    Timestamp = msg.Timestamp,
    Sender = sender,
    TokenId = tokenId,
    Quantity = quantity,
    Duration = duration,
  }
end

function CalculateConfidence(stake)
  local tokenConfig = TOKEN_WHITELIST[stake.TokenId]
  if tokenConfig.ValueUsd == nil then
    return false, nil
  end

  -- Use simple interest formula
  local tokenValue = stake.Quantity * tokenConfig.ValueUsd / (10 ^ tokenConfig.Denomination)
  local durationYears = stake.Duration / (1000 * 60 * 60 * 24 * 365)
  local confidenceValue = tokenValue * durationYears * tokenConfig.InterestRate
  if confidenceValue < 0.01 then
    return false, confidenceValue
  end

  return true, confidenceValue
end

function RecordStake(stake, confidenceValue)
  -- Check if wallet exists
  local stmt = VOUCH_DB:prepare([[
  SELECT WalletId FROM Wallet WHERE WalletId = ?;
]])
  stmt:bind_values(stake.Sender)
  local isNewWallet = true
  for _ in stmt:nrows() do
    isNewWallet = false
  end
  stmt:finalize()

  if isNewWallet then
    stmt = VOUCH_DB:prepare([[
  INSERT INTO Wallet (WalletId, TimestampCreated, TimestampModified, ProcessId, TotalConfidenceValue)
  VALUES (?, ?, ?, ?, ?)
]])
    stmt:bind_values(stake.Sender, stake.Timestamp, stake.Timestamp, "VOUCH", confidenceValue)
  else
    stmt = VOUCH_DB:prepare([[
  UPDATE Wallet
  SET TotalConfidenceValue = TotalConfidenceValue + ?
  WHERE WalletId = ?;
]])
    stmt:bind_values(confidenceValue, stake.Sender)
  end
  stmt:step()
  res = stmt:finalize()

  if res ~= sqlite3.OK then
    error("Error updating Wallet: " .. VOUCH_DB:errmsg())
  end

  stmt = VOUCH_DB:prepare([[
  INSERT INTO StakeHistory (WalletId, Timestamp, Quantity, StakeDuration, ConfidenceValue)
  VALUES (?, ?, ?, ?, ?);
]])
  stmt:bind_values(stake.Sender, stake.Timestamp, stake.Quantity, stake.Duration, confidenceValue)
  stmt:step()
  local res = stmt:finalize()
  if res ~= sqlite3.OK then
    error("Error adding to StakeHistory: " .. VOUCH_DB:errmsg())
  end

  print("Stake created")
  return isNewWallet
end

function SendVouch(stake, confidence)
  local confidenceStr = string.format("%.2f-USD", confidence)

  ao.send({
    Target = VOUCH_PROCESS,
    Tags = {
      ['Data-Protocol'] = 'Vouch',
      ['Vouch-For'] = stake.Sender,
      ['Method'] = 'WAR-Stake',
      ['Confidence-Value'] = confidenceStr,
    },
  })
end

Handlers.add(
  "Stake-Notice",
  Handlers.utils.hasMatchingTag("Action", "Stake-Notice"),
  function(msg)
    local isStakeValid, stake = ParseStake(msg)
    if not isStakeValid then
      return
    end

    local isConfidenceValid, confidence = CalculateConfidence(stake)
    if not isConfidenceValid then
      print("Invalid confidence value: " .. (confidence or "<nil>"))
      return
    end

    local isFirstStake = RecordStake(stake, confidence)
    if isFirstStake then
      SendVouch(stake, confidence)
    else
      print("Warning: Updating stake is currently unsupported")
      -- error("Updating stake is currently unsupported")
    end
  end
)
