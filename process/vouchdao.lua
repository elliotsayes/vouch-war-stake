Name = "VouchDAO"
Variant = "0.3"
--[[

VouchDAO

]]


-- Utils
local function splitString(inputString, delimiter)
  local result = {}
  for match in (inputString .. delimiter):gmatch("(.-)" .. delimiter) do
    table.insert(result, match)
  end
  return result
end

-- Schemas

VoucherConfidence = [[
  CREATE TABLE IF NOT EXISTS VoucherConfidence (
    ID INT PRIMARY KEY,
    Voucher TEXT,
    Staker TEXT,
    ConfidenceScore INTEGER CHECK (ConfidenceScore BETWEEN 0 AND 100)
  );
]]

Vouched = [[
  CREATE TABLE IF NOT EXISTS Vouched (
    ID INT PRIMARY KEY,
    VouchFor TEXT NOT NULL,
    Voucher TEXT NOT NULL,
    VouchMethod TEXT NOT NULL,
    Identifier TEXT,
    Country TEXT,
    Updated INTEGER,
    ConfidenceValue TEXT,
    UNIQUE(VouchFor, Voucher)
  );

]]

SubIDs = [[
  CREATE TABLE IF NOT EXISTS SubIDs (
    ID INT PRIMARY KEY,
    SubID TEXT,
    VouchAddress TEXT,
    Updated INTEGER
  );

]]

local sqlite3 = require('lsqlite3')

db = db or sqlite3.open_memory()

-- initialize tables
function InitDB()
  db:exec(VoucherConfidence)
  db:exec(Vouched)
  db:exec(SubIDs)
  return "OK"
end

-- queries
local function querySubIDs(subID)
  local sql = [[
    SELECT * FROM SubIDs
    WHERE SubID = ?
  ]]
  local stmt = db:prepare(sql)
  local records = {}
  if stmt then
    stmt:bind_values(subID)
    for record in stmt:nrows() do
      table.insert(records, record)
    end
    stmt:finalize()
  end
  return #records
end

local function queryVouched(voucher, vouchFor)
  local sql = [[
    SELECT * FROM Vouched
    WHERE Voucher = ? AND VouchFor = ?
  ]]
  local stmt = db:prepare(sql)
  local records = {}
  if stmt then
    stmt:bind_values(voucher, vouchFor)
    for record in stmt:nrows() do
      table.insert(records, record)
    end
    stmt:finalize()
  end
  return #records
end

local function insertVouched(vouchFor, voucher, method, identifier, country, updated, confidenceValue)
  local sql = [[
      INSERT INTO Vouched (VouchFor, Voucher, VouchMethod, Identifier, Country, Updated, ConfidenceValue)
      VALUES (?, ?, ?, ?, ?, ?, ?)
  ]]
  local stmt = db:prepare(sql)
  local result = false

  if stmt then
    -- Bind the values to the placeholders
    stmt:bind_values(vouchFor, voucher, method, identifier, country, updated, confidenceValue)

    -- Execute the insert statement
    local res = stmt:step()
    if res == sqlite3.DONE then
      result = true
    else
      print("Error Inserting record: " .. db:errmsg())
      result = false
    end

    -- Finalize the prepared statement
    stmt:finalize()
  end
  return result
end

local function insertSubID(subID, account, updated)
  local sql = [[
      INSERT INTO SubIDs (SubID, VouchAddress, Updated)
      VALUES (?, ?, ?)
  ]]
  local stmt = db:prepare(sql)
  local result = false

  if stmt then
    -- Bind the values to the placeholders
    stmt:bind_values(subID, account, updated)

    -- Execute the insert statement
    local res = stmt:step()
    if res == sqlite3.DONE then
      result = true
    else
      print("Error Inserting record: " .. db:errmsg())
      result = false
    end

    -- Finalize the prepared statement
    stmt:finalize()
  end
  return result
end

local function isVouched(vouchFor)
  local sql = [[
    SELECT * FROM Vouched
    WHERE VouchFor = ?
  ]]
  local stmt = db:prepare(sql)
  local records = {}
  if stmt then
    stmt:bind_values(vouchFor)
    for record in stmt:nrows() do
      table.insert(records, record)
    end
    stmt:finalize()
  end
  return #records
end

local function getVouchRecords(id)
  -- this function finds the vouch wallet id in the SubIds table
  -- then uses it to join on the Vouches table to get the Vouchers for
  -- a given wallet and/or sub id

  local sql = [[
    SELECT V.*
    FROM Vouched V
    LEFT OUTER JOIN SubIDs S ON V.VouchFor = S.VouchAddress
    WHERE S.SubID = ?;
  ]]
  local stmt = db:prepare(sql)
  local records = {}
  if stmt then
    stmt:bind_values(id)
    for record in stmt:nrows() do
      table.insert(records, record)
    end
    stmt:finalize()
  end
  return records
end

local function getSubIDsForWallet(wallet)
  local sql = [[
    SELECT SubID
    FROM SubIDs
    WHERE VouchAddress = ?
  ]]
  local stmt = db:prepare(sql)
  local ids = {}
  if stmt then
    stmt:bind_values(wallet)
    for record in stmt:nrows() do
      if record.SubID ~= wallet then
        table.insert(ids, record.SubID)
      end
    end
    stmt:finalize()
  end
  return ids or {}
end

function listVouchedRecords()
  local sql = "SELECT * FROM Vouched"
  local records = {}
  -- Iterate over all rows returned by the query
  for row in db:nrows(sql) do
    table.insert(records, row)
  end
  return records
end

-- $CRED
BuyToken = "Sa0iBLPNyJQrwpTTG-tWLQU-1QeUAJA73DdxGGiKoJc"
MaxSupply = MaxSupply or 1000000
Minted = Minted or 0
VoteLength = 30 * 24

-- Vouch Logic
Vouch = {
  isVouchFor = function(Msg)
    local v = Utils.find(
      function(tag)
        return tag.name == "Data-Protocol" and tag.value == "Vouch"
      end,
      Msg.TagArray
    ) or false
    return v and v.value == "Vouch"
  end,
  doVouchFor = function(Msg)
    -- check to see if already vouched
    local vouched = queryVouched(Msg.From, Msg['Vouch-For'])

    if vouched == 0 then
      -- if not then record Vouch Record
      local res = insertVouched(
        Msg['Vouch-For'],
        Msg.From,
        Msg.Method,
        Msg.Identifier or '',
        Msg.Country or '',
        Msg.Timestamp,
        Msg['Confidence-Value']
      )
      insertSubID(Msg['Vouch-For'], Msg['Vouch-For'], Msg.Timestamp)
      Send({ Target = Msg.From, Action = "Vouch-Notice", Data = Msg['Vouch-For'] .. " has been vouched." })
      Send({ Target = Msg['Vouch-For'], Action = "Vouch-Notice", Data = "Successfully Vouched" })
      print(Msg['Vouch-For'] .. ' vouched by ' .. Msg.From)
    else
      Send({ Target = Msg['Vouch-For'], Action = "Vouch-Notice", Data = "Already Vouched" })
      print(Msg['Vouch-For'] .. ' already vouched by ' .. Msg.From)
    end
  end,
  isSubID = function(Msg)
    return Msg.Action == "Add-ID"
  end,
  addSubID = function(Msg)
    local count = querySubIDs(Msg["Sub-ID"])
    local vouched = isVouched(Msg.From)
    if vouched == 0 then
      return print("Not Vouched!")
    end
    if count == 0 and vouched > 0 then
      -- add ID
      local res = insertSubID(Msg["Sub-ID"], Msg.From, Msg.Timestamp)
      Send({ Target = Msg.From, Data = "Successfully added Sub-ID" })
      print('Successfully added ' .. Msg["Sub-ID"])
      return
    end
    print("Already Vouched.")
  end,
  isGetVouches = function(Msg)
    return Msg.Action == "Get-Vouches"
  end,
  getVouches = function(Msg)
    local vouches = getVouchRecords(Msg.Tags["ID"])

    if #vouches == 0 then
      Send({ Target = Msg.From, Action = "VouchDAO.Vouches", Data = require('json').encode({ Status = "NOT_VOUCHED", ID =
      Msg.Tags["ID"] }) })
      return print(Msg.From .. " is not Vouched!")
    end
    local totalValue = Utils.reduce(
      function(acc, v)
        local value = splitString(v.ConfidenceValue, '-')
        if value[2] == acc.currency then
          acc.amount = acc.amount + tonumber(value[1])
        end
        return acc
      end,
      { amount = 0, currency = "USD" },
      vouches
    )

    local values = Utils.keys(Utils.reduce(function(acc, v)
      acc[v.ConfidenceValue] = true
      return acc
    end
    , {}, vouches))

    local result = {
      ["Vouches-For"] = vouches[1].VouchFor,
      ["Total-Value"] = totalValue.amount .. "-" .. totalValue.currency,
      Values = values or {}
    }

    result = Utils.reduce(function(acc, v)
      acc[v.VouchMethod .. '-Value'] = v.ConfidenceValue
      return acc
    end, result, vouches)

    result = Utils.reduce(function(acc, v)
      acc.Vouchers = acc.Vouchers or {}
      acc.Vouchers[v.Voucher] = { Method = v.VoucherMethod, Country = v.Country or '', Identifier = v.Identifier or '', Value =
      v.ConfidenceValue }
      return acc
    end, result, vouches)
    result['Sub-IDs'] = getSubIDsForWallet(vouches[1].VouchFor)
    Send({ Target = Msg.From, Action = "VouchDAO.Vouches", ID = Msg.Tags["ID"], Data = require('json').encode(result) })
    print(result)
  end,
  isAssignment = function(Msg)
    return Msg.Tags.Type == "Process" and Msg.Id ~= ao.id
  end,
  addAssignmentSubID = function(Msg)
    local count = querySubIDs(Msg.Id)
    local vouched = isVouched(Msg.From)
    if vouched == 0 then
      Send({ Target = Msg.From, Data = "Not Vouched" })
      return print("Not Vouched!")
    end
    if count == 0 and vouched > 0 then
      -- add ID
      local res = insertSubID(Msg.Id, Msg.From, Msg.Timestamp)
      Send({ Target = Msg.From, Data = "Successfully added Sub-ID" })
      print('Successfully added ' .. Msg.Id)
      return
    end
    print("Already Vouched.")
  end
}



Handlers.add("Vouch.Vouch-For", Vouch.isVouchFor, Vouch.doVouchFor)
Handlers.add("Vouch.Add-SubID", Vouch.isSubID, Vouch.addSubID)
Handlers.add("Vouch.Get-Vouches", Vouch.isGetVouches, Vouch.getVouches)
Handlers.add("Vouch.Add-by-Assign", Vouch.isAssignment, Vouch.addAssignmentSubID)
