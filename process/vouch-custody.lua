local json = require("json")
local sqlite3 = require("lsqlite3")
local DbAdmin = require("DbAdmin")
local directory = require("aoform.directory")

function Init(db)
  db:exec [[
    CREATE TABLE IF NOT EXISTS Wallet(
      WalletId TEXT PRIMARY KEY NOT NULL,
      TimestampCreated INTEGER NOT NULL,
      TimestampModified INTEGER NOT NULL,
      TotalConfidenceValue INTEGER NOT NULL DEFAULT 0
    );
  ]]

  db:exec [[
    CREATE TABLE IF NOT EXISTS CustodyProcess(
      WalletId TEXT PRIMARY KEY NOT NULL,
      TimestampCreated INTEGER NOT NULL,
      TimestampModified INTEGER NOT NULL,
      CustodyProcessId TEXT,
      FOREIGN KEY (WalletId) REFERENCES Wallet(WalletId)
    );
  ]]

  db:exec [[
    CREATE TABLE IF NOT EXISTS StakeHistory(
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Sender TEXT NOT NULL,
      CustodyOwner TEXT NOT NULL,
      CustodyProcessId TEXT NOT NULL,
      Timestamp INTEGER NOT NULL,
      Quantity STRING NOT NULL,
      StakeDuration INTEGER NOT NULL,
      ConfidenceValue INTEGER NOT NULL,
      FOREIGN KEY (Sender) REFERENCES Wallet(WalletId),
      FOREIGN KEY (CustodyOwner) REFERENCES Wallet(WalletId),
      FOREIGN KEY (CustodyProcessId) REFERENCES CustodyProcess(CustodyProcessId)
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

CUSTODY_CREATOR_PROCESS = "zYBcGWB4KJeB4pc04XiNOKrD0DQBPelvNBbfDnqiunQ" -- "<CUSTODY_CREATOR_PROCESS>"
VOUCH_PROCESS = "ZTTO02BL2P-lseTLUgiIPD9d0CF1sc4LbMA2AQ7e9jo"
PRICE_PROCESS = directory["arweave-price"]

WAR_TOKEN_PROCESS = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10"

TokenWhitelist = TokenWhitelist or {
  [WAR_TOKEN_PROCESS] = {
    Name = 'WAR',
    Ticker = 'AR',
    Denomination = 12,
    QuantityMin = 10 ^ 9,
    QuantityMax = 10 ^ 15,
    DurationMin = 5 * 60 * 1000,
    DurationMax = 365 * 24 * 60 * 60 * 1000,
    InterestRate = 0.1,
    ValueUsd = nil,
  },
}

MESSAGE_RETRY_TIMEOUT = 60 * 1000

function ParsePrice(msg)
  if msg.Tags.Currency ~= "USD" then
    print("Not USD")
    return false, nil
  end
  if msg.Tags.TokenId ~= WAR_TOKEN_PROCESS then
    print("Not WAR")
    return false, nil
  end

  local price = msg.Tags.Price
  local priceNum = tonumber(price)
  if priceNum == nil then
    return false, nil
  end
  if priceNum <= 0 then
    return false, nil
  end

  return true, priceNum
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
  local tokenConfig = TokenWhitelist[tokenId]
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
  local tokenConfig = TokenWhitelist[tokenId]
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

function ParseStakeDeposit(msg)
  local data = json.decode(msg.Data)

  local sender = data.Sender
  if not ValidateArweaveId(sender) then
    print("Invalid sender")
    return false, nil
  end

  local tokenId = data.TokenId
  if not ValidateArweaveId(tokenId) or TokenWhitelist[tokenId] == nil then
    print("Invalid token id")
    return false, nil
  end

  local isValidQuantity, quantity = ParseQuantity(tokenId, data.Quantity)
  if not isValidQuantity then
    print("Invalid quantity")
    return false, nil
  end

  local isValidDuration, duration = ParseDuration(tokenId, data.StakeDurationMs)
  if not isValidDuration then
    print("Invalid duration")
    return false, nil
  end

  return true, {
    Timestamp = msg.Timestamp,
    Sender = sender,
    CustodyProcessId = msg.From,
    TokenId = tokenId,
    Quantity = quantity,
    Duration = duration,
  }
end

function CalculateConfidence(stake)
  local tokenConfig = TokenWhitelist[stake.TokenId]
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

function WalletRecorded(walletId)
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

function CreateWallet(walletId, timestamp)
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

function CustodyProcess(walletId)
  local stmt = VOUCH_DB:prepare([[
  SELECT *
  FROM CustodyProcess
  WHERE WalletId = ?;
]])
  stmt:bind_values(walletId)
  local res = stmt:step()
  if res ~= sqlite3.ROW then
    stmt:finalize()
    return nil
  end

  local custodyProcess = {
    WalletId = stmt:get_value(0),
    TimestampCreated = stmt:get_value(1),
    TimestampModified = stmt:get_value(2),
    CustodyProcessId = stmt:get_value(3),
  }
  stmt:finalize()

  return custodyProcess
end

function RecordCustodyProcessPrototype(walletId, timestamp)
  local stmt = VOUCH_DB:prepare([[
INSERT INTO CustodyProcess (WalletId, TimestampCreated, TimestampModified)
VALUES (?, ?, ?)
]])
  stmt:bind_values(walletId, timestamp, timestamp)
  stmt:step()
  local res = stmt:finalize()

  if res ~= sqlite3.OK then
    error("Error creating Wallet: " .. VOUCH_DB:errmsg())
  end
end

function BumpCustodyProcessTimestamp(walletId, timestamp)
  local stmt = VOUCH_DB:prepare([[
UPDATE CustodyProcess
SET TimestampModified = ?
WHERE WalletId = ?;
]])
  stmt:bind_values(timestamp, walletId)
  stmt:step()
  local res = stmt:finalize()

  if res ~= sqlite3.OK then
    error("Error updating Wallet: " .. VOUCH_DB:errmsg())
  end
end

function RemoveCustodyProcessPrototype(walletId)
  local stmt = VOUCH_DB:prepare([[
  DELETE FROM CustodyProcess
  WHERE WalletId = ?;
]])
  stmt:bind_values(walletId)
  stmt:step()
  local res = stmt:finalize()

  if res ~= sqlite3.OK then
    error("Error deleting Wallet: " .. VOUCH_DB:errmsg())
  end
end

function RecordCustodyProcessId(walletId, timestamp, custodyProcessId)
  local stmt = VOUCH_DB:prepare([[
UPDATE CustodyProcess
SET CustodyProcessId = ?, TimestampModified = ?
WHERE WalletId = ?;
]])
  stmt:bind_values(custodyProcessId, timestamp, walletId)
  stmt:step()
  local res = stmt:finalize()

  if res ~= sqlite3.OK then
    error("Error updating Wallet: " .. VOUCH_DB:errmsg())
  end
end

function QueryCustodyProcess(walletId)
  local req = ao.send({
    Target = CUSTODY_CREATOR_PROCESS,
    Tags = {
      ['Action'] = 'Custody-Creator.Get-Wallet',
      ['Wallet-Id'] = walletId,
    }
  })
  local res = req.receive()

  local error = res.Tags['Error']
  if error ~= nil then
    print("Error querying custody process: " .. error)
    return nil
  end

  local processId = res.Tags['Process-Id']
  if processId == nil then
    local status = res.Tags.Status or "<No Status>"
    print("No custody process found: " .. status)
    return nil
  end

  return processId
end

function SubscribeToCustodyProcess(custodyProcessId)
  local req = ao.send({
    Target = custodyProcessId,
    Tags = {
      ['Action'] = 'Register-Subscriber',
      Topics = json.encode({ 'stake-deposit' })
    }
  })

  local res = Handlers.receive({
    From = custodyProcessId,
    Action = 'Subscriber-Registration-Confirmation'
  })

  local _error = res.Tags['Error']
  local ok = res.Tags['OK']
  if _error ~= nil or ok ~= "true" then
    error("Error subscribing to custody process: " .. _error)
  end
end

Handlers.add(
  "Vouch-Custody.Get-Custody-Process",
  Handlers.utils.hasMatchingTag("Action", "Vouch-Custody.Get-Custody-Process"),
  function(msg)
    local walletId = msg.From
    if not WalletRecorded(walletId) then
      msg.reply({
        Tags = {
          ['Status'] = "Not Found"
        }
      })
      return
    end

    local stmt = VOUCH_DB:prepare([[
    SELECT CustodyProcessId
    FROM CustodyProcess
    WHERE WalletId = ?;
  ]])
    stmt:bind_values(walletId)
    local res = stmt:step()
    if res ~= sqlite3.ROW then
      msg.reply({
        Tags = {
          ['Status'] = "Not Found"
        }
      })
      return
    end
    local custodyProcessId = stmt:get_value(0)
    stmt:finalize()

    if custodyProcessId == nil then
      msg.reply({
        Tags = {
          ['Status'] = "Not Found"
        }
      })
      return
    end

    msg.reply({
      Tags = {
        ['Status'] = "Success",
        ['Custody-Process-Id'] = custodyProcessId
      }
    })
  end
)

Handlers.add(
  "Vouch-Custody.Register-Custody",
  Handlers.utils.hasMatchingTag("Action", "Vouch-Custody.Register-Custody"),
  function(msg)
    local walletId = msg.From
    if not WalletRecorded(walletId) then
      CreateWallet(walletId, msg.Timestamp)
    end

    local custodyProcess = CustodyProcess(walletId)
    if custodyProcess ~= nil then
      if custodyProcess.CustodyProcessId then
        return print("Custody Process already recorded")
      end
      if (custodyProcess.TimestampModified + MESSAGE_RETRY_TIMEOUT) < msg.Timestamp then
        return print("Custody Process already queried")
      end
      print("Custody Process query timed out, retrying")
      BumpCustodyProcessTimestamp(walletId, msg.Timestamp)
    else
      RecordCustodyProcessPrototype(walletId, msg.Timestamp)
    end

    local custodyProcessId = QueryCustodyProcess(walletId)
    if custodyProcessId == nil then
      print("No custody process in ")
      RemoveCustodyProcessPrototype(walletId)
      return
    end
    SubscribeToCustodyProcess(custodyProcessId)
    RecordCustodyProcessId(walletId, msg.Timestamp, custodyProcessId)
  end
)

function CountStakeHistory(stake)
  local stmt = VOUCH_DB:prepare([[
  SELECT COUNT(*)
  FROM StakeHistory
  WHERE WalletId = ?;
]])
  stmt:bind_values(stake.Sender)
  local res = stmt:step()
  local count = stmt:get_value(0)
  stmt:finalize()

  return count
end

function RecordStake(stake, custodyOwner, confidence)
  local stmt = VOUCH_DB:prepare([[
INSERT INTO StakeHistory (Sender, CustodyOwner, CustodyProcessId, Timestamp, Quantity, StakeDuration, ConfidenceValue)
VALUES (?, ?, ?, ?, ?, ?, ?);
]])
  stmt:bind_values(stake.Sender, custodyOwner, stake.CustodyProcessId, stake.Timestamp, stake.Quantity, stake.Duration,
    confidence)
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
  stmt:bind_values(confidence, stake.Sender)
  stmt:step()
  local res = stmt:finalize()

  if res ~= sqlite3.OK then
    error("Error updating Wallet: " .. VOUCH_DB:errmsg())
  end

  print("Stake created")
end

function RetrieveConfidenceValue(walletId)
  local stmt = VOUCH_DB:prepare([[
  SELECT TotalConfidenceValue
  FROM Wallet
  WHERE WalletId = ?;
]])
  stmt:bind_values(walletId)
  local res = stmt:step()
  if res ~= sqlite3.ROW then
    error("Error getting confidence value: " .. VOUCH_DB:errmsg())
  end
  local confidenceValue = stmt:get_value(0)
  stmt:finalize()

  return confidenceValue
end

function SendVouch(walletId, confidence)
  local confidenceStr = string.format("%.2f-USD", confidence)

  ao.send({
    Target = VOUCH_PROCESS,
    Tags = {
      ['Action'] = 'Vouch',
      ['Vouch-For'] = walletId,
      ['Method'] = 'Custody',
      ['Confidence-Value'] = confidenceStr,
    },
  })
end

function ResendAllVouches()
  local stmt = VOUCH_DB:prepare([[
  SELECT WalletId, TotalConfidenceValue
  FROM Wallet;
]])
  while stmt:step() == sqlite3.ROW do
    local walletId = stmt:get_value(0)
    local confidenceValue = stmt:get_value(1)
    SendVouch(walletId, confidenceValue)
  end
  stmt:finalize()
end

function GetCustodyProcessWalletId(processId)
  -- check the wallet table
  local stmt = VOUCH_DB:prepare([[
  SELECT WalletId
  FROM CustodyProcess
  WHERE CustodyProcessId = ?;
]])
  stmt:bind_values(processId)
  local res = stmt:step()
  if res ~= sqlite3.ROW then
    error("Error getting custody process wallet id: " .. VOUCH_DB:errmsg())
  end
  local walletId = stmt:get_value(0)
  stmt:finalize()

  return walletId
end

Handlers.add(
  "Notify-On-Topic",
  Handlers.utils.hasMatchingTag("Action", "Notify-On-Topic"),
  function(msg)
    local custodyOwner = GetCustodyProcessWalletId(msg.From)
    if custodyOwner == nil then
      print("Notify-On-Topic not from custody process, ignoring")
      return
    end

    local isStakeValid, stake = ParseStakeDeposit(msg)
    if not isStakeValid or stake == nil then
      return
    end

    local isConfidenceValid, confidence = CalculateConfidence(stake)
    if not isConfidenceValid then
      print("Invalid confidence value: " .. (confidence or "<nil>"))
      return
    end

    if not WalletRecorded(stake.Sender) then
      CreateWallet(stake.Sender, stake.Timestamp)
    end
    RecordStake(stake, custodyOwner, confidence)

    local totalConfidence = RetrieveConfidenceValue(stake.Sender)
    SendVouch(stake.Sender, totalConfidence)
  end
)

Handlers.add(
  "Voucher.Calculate-Confidence",
  Handlers.utils.hasMatchingTag("Action", "Voucher.Calculate-Confidence"),
  function(msg)
    print("Voucher.Calculate-Confidence")

    local isValidStake, stake = ParseStakeDeposit(msg)
    if not isValidStake then
      msg.reply({
        Tags = {
          ['Status'] = "Failure",
          ['Value'] = "0",
        }
      })
      return
    end
    local isValidConfidence, confidence = CalculateConfidence(stake)
    if not isValidConfidence then
      msg.reply({
        Tags = {
          ['Status'] = "Failure",
          ['Value'] = "0",
        }
      })
      return
    end

    msg.reply({
      Tags = {
        ['Status'] = "Success",
        ['Value'] = tostring(confidence),
      }
    })
  end
)

Handlers.add(
  "Price.Update",
  Handlers.utils.hasMatchingTag("Action", "Price.Update"),
  function(msg)
    if msg.From ~= PRICE_PROCESS then
      print("Price.Update not from: " .. msg.From)
      return
    end

    local isValidPrice, price = ParsePrice(msg)
    if not isValidPrice then
      print("Invalid price")
      return
    end

    print("Updating price of " .. WAR_TOKEN_PROCESS .. " to " .. price)
    TokenWhitelist[WAR_TOKEN_PROCESS].ValueUsd = price
  end
)

Handlers.add(
  "Info",
  Handlers.utils.hasMatchingTag("Action", "Info"),
  function(msg)
    local data = json.encode({
      TokenWhitelist = TokenWhitelist,
    })
    msg.reply({
      Tags = {
        ['Status'] = "Success",
        ['Value'] = "Vouch-Custody",
      },
      Data = data
    })
  end
)
