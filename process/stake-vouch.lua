local sqlite3 = require("lsqlite3")
local DbAdmin = require("DbAdmin")

function Init(db)
  db:exec [[
    CREATE TABLE IF NOT EXISTS Wallet(
      WalletId TEXT PRIMARY KEY NOT NULL,
      TimestampCreated INTEGER NOT NULL,
      TimestampModified INTEGER NOT NULL,
      ProcessId TEXT UNIQUE,
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

VOUCH_PROCESS = "mIXsPDpV3ITGrXjowrTlAfjuFWmHd7ixBglJazDvfTs"

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

function ParseStake(msg, walletId)
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

  local isValidDuration, duration = ParseDuration(tokenId, msg.Tags.Duration)
  if not isValidDuration then
    print("Invalid duration")
    return false, nil
  end

  return true, {
    Timestamp = msg.Timestamp,
    WalletId = walletId,
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

function WalletExists(walletId)
  local stmt = VOUCH_DB:prepare([[
  SELECT WalletId
  FROM Wallet
  WHERE WalletId = ?;
]])
  stmt:bind_values(walletId)
  local res = stmt:step()
  stmt:finalize()

  return res == sqlite3.ROW
end

function RecordWalletPrototype(walletId, timestamp)
  local stmt = VOUCH_DB:prepare([[
  INSERT INTO Wallet (WalletId, TimestampCreated, TimestampModified)
  VALUES (?, ?, ?)
]])
  stmt:bind_values(walletId, timestamp, timestamp)
  stmt:step()
  local res = stmt:finalize()

  if res ~= sqlite3.OK then
    error("Error creating Wallet: " .. VOUCH_DB:errmsg())
  end
end

function RecordWalletProcess(walletId, timestamp, processId)
  local stmt = VOUCH_DB:prepare([[
  UPDATE Wallet
  SET ProcessId = ?, TimestampModified = ?
  WHERE WalletId = ?;
]])
  stmt:bind_values(processId, timestamp, walletId)
  stmt:step()
  local res = stmt:finalize()

  if res ~= sqlite3.OK then
    error("Error updating Wallet: " .. VOUCH_DB:errmsg())
  end
end

CUSTODY_SRC_MSG = "<TODO>"

function CreateCustodyProcess(walletId)
  local msg = ao.spawn(ao._module, {})
  local res = msg.receive()
  if res == nil then
    error("Failed to create custody process")
  end

  local custodyProcessId = res.ProcessId

  msg = ao.send({
    Target = custodyProcessId,
    Tags = {
      Action = "Eval",
    },
    Data = [[
BENEFICIARY_ADDRESS = "]] .. walletId .. [["
ALLOW_THIRD_PARTY_STAKE = true
WITHDRAW_TO_THIRD_PARTY = true
ao.addAssignable("CUSTODY_SRC_MSG", {
  Id = "]] .. CUSTODY_SRC_MSG .. [["
})
]]
  })
  res = msg.receive()
  if res == nil then
    error("Failed to assign CUSTODY_SRC_MSG")
  end

  Assign({
    Message = CUSTODY_SRC_MSG,
    Processes = {
      custodyProcessId,
    }
  })

  return custodyProcessId
end

Handlers.add(
  "Custody.Create",
  Handlers.utils.hasMatchingTag("Action", "Custody.Create"),
  function(msg)
    local walletId = msg.From
    if not WalletExists(walletId) then
      -- We insert already, because `CreateCustodyProcess` will suspend the process,
      -- and we need to make sure it isn't created multiple times
      RecordWalletPrototype(walletId, msg.Timestamp)
      local processId = CreateCustodyProcess(walletId)
      RecordWalletProcess(walletId, msg.Timestamp, processId)
    else
      print("Wallet already exists")
    end
  end
)

function CountStakeHistory(stake)
  local stmt = VOUCH_DB:prepare([[
  SELECT COUNT(*)
  FROM StakeHistory
  WHERE WalletId = ?;
]])
  stmt:bind_values(stake.WalletId)
  local res = stmt:step()
  local count = stmt:get_value(0)
  stmt:finalize()

  return count
end

function RecordStake(stake, confidence)
  local stmt = VOUCH_DB:prepare([[
  INSERT INTO StakeHistory (WalletId, Timestamp, Quantity, StakeDuration, ConfidenceValue)
  VALUES (?, ?, ?, ?, ?);
]])
  stmt:bind_values(stake.WalletId, stake.Timestamp, stake.Quantity, stake.Duration, confidence)
  stmt:step()
  local res = stmt:finalize()
  if res ~= sqlite3.OK then
    error("Error adding to StakeHistory: " .. VOUCH_DB:errmsg())
  end

  local stmt = VOUCH_DB:prepare([[
UPDATE Wallet
SET TotalConfidenceValue = TotalConfidenceValue + ?
WHERE WalletId = ?;
]])
  stmt:bind_values(confidence, stake.WalletId)
  stmt:step()
  local res = stmt:finalize()

  if res ~= sqlite3.OK then
    error("Error updating Wallet: " .. VOUCH_DB:errmsg())
  end

  print("Stake created")
end

function SendVouch(stake, confidence)
  local confidenceStr = string.format("%.2f-USD", confidence)

  ao.send({
    Target = VOUCH_PROCESS,
    Tags = {
      ['Data-Protocol'] = 'Vouch',
      ['Vouch-For'] = stake.WalletId,
      ['Method'] = 'WAR-Stake',
      ['Confidence-Value'] = confidenceStr,
    },
  })
end

function GetProcessWalletId(msg)
  -- check the wallet table
  local stmt = VOUCH_DB:prepare([[
  SELECT WalletId
  FROM Wallet
  WHERE ProcessId = ?;
]])
  stmt:bind_values(msg.From)
  local res = stmt:step()
  local walletId = stmt:get_value(0)
  stmt:finalize()

  return walletId
end

Handlers.add(
  "Stake-Notice",
  Handlers.utils.hasMatchingTag("Action", "Stake-Notice"),
  function(msg)
    local walletId = GetProcessWalletId(msg)
    if walletId == nil then
      print("Stake-Notice not from child process, ignoring")
      return
    end

    local isStakeValid, stake = ParseStake(msg, walletId)
    if not isStakeValid then
      return
    end

    -- local stakeCount = CountStakeHistory(stake)
    -- if stakeCount > 0 then
    --   print("Warning: Updating stake is currently unsupported")
    --   return
    -- end

    local isConfidenceValid, confidence = CalculateConfidence(stake)
    if not isConfidenceValid then
      print("Invalid confidence value: " .. (confidence or "<nil>"))
      return
    end

    RecordStake(stake, confidence)
    SendVouch(stake, confidence)
  end
)

Handlers.add(
  "Vouch.CalculateConfidence",
  Handlers.utils.hasMatchingTag("Action", "Vouch.CalculateConfidence"),
  function(msg)
    print("Vouch.CalculateConfidence")

    local isValidStake, stake = ParseStake(msg, msg.From)
    if not isValidStake then
      msg.reply({
        Tags = {
          ['Confidence-Result'] = "Failure",
          ['Confidence-Value'] = "0",
        }
      })
      return
    end
    local isValidConfidence, confidence = CalculateConfidence(stake)
    if not isValidConfidence then
      msg.reply({
        Tags = {
          ['Confidence-Result'] = "Failure",
          ['Confidence-Value'] = "0",
        }
      })
      return
    end

    msg.reply({
      Tags = {
        ['Confidence-Result'] = "Success",
        ['Confidence-Value'] = tostring(confidence),
      }
    })
  end
)
