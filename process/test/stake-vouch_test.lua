---@diagnostic disable: duplicate-set-field
require("test.setup")()

_G.VerboseTests = 0                    -- how much logging to see (0 - none at all, 1 - important ones, 2 - everything)
_G.VirtualTime = _G.VirtualTime or nil -- use for time travel
-- optional logging function that allows for different verbosity levels
_G.printVerb = function(level)
  level = level or 2
  return function(...) -- define here as global so we can use it in application code too
    if _G.VerboseTests >= level then print(table.unpack({ ... })) end
  end
end

_G.Owner = '123MyOwner321'
_G.MainProcessId = '123xyzMySelfabc321'

_G.Processes = {
  ['<Dummy>'] = require 'test.mocked-env.processes.dummy' ('<Dummy>'),
  ['<VOUCH_PROCESS>'] = require 'test.mocked-env.processes.dummy' ('<VOUCH_PROCESS>'),
}

_G.Handlers = require "handlers"

_G.ao = require "ao" (_G.MainProcessId) -- make global so that the main process and its non-mocked modules can use it
-- => every ao.send({}) in this test file effectively appears as if the message comes the main process

_G.ao.env = {
  Process = {
    Tags = {
      ["Name"] = "StakeVouchProcess",
      -- ... add other tags that would be passed in when the process is spawned
    }
  }
}

local stake_vouch = require "stake-vouch" -- require so that process handlers are loaded
-- local utils = require "utils"
-- local bint = require ".bint" (512)


local resetGlobals = function()
  -- according to initialization in process.lual
end

local testWallet = "<MyWallet>"
local testCustodyProcess = "<Dummy>"
local warTokenId = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10"
local testQuantity1 = 100000000000  -- 0.1wAR
local testDuration1 = 365 * 24 * 60 * 60 * 1000
local testQuantity2 = 1000000000000 -- 1.0wAR
local testDuration2 = 365 * 24 * 60 * 60 * 1000

describe("vouching", function()
  setup(function()
    resetGlobals()
    _G.VOUCH_PROCESS = "<VOUCH_PROCESS>"
    -- Set a confidenceValue for war token
    _G.TOKEN_WHITELIST[warTokenId].ValueUsd = 10.0
  end)

  teardown(function()
    -- to execute after this describe
  end)

  it("should start with no wallets or vouch history", function()
    local walletCount = _G.VOUCH_DB_ADMIN:count("Wallet")
    assert.equal(0, walletCount)
    local historyCount = _G.VOUCH_DB_ADMIN:count("StakeHistory")
    assert.equal(0, historyCount)
  end)

  it("should spawn a child", function()
    _G.RecordWalletPrototype(testWallet, 0)
    _G.RecordWalletProcess(testWallet, 1, testCustodyProcess)
  end)

  it("should add a vouch", function()
    -- Simulate a vouch message
    ao.send({
      Target = _G.MainProcessId,
      From = testCustodyProcess,
      Tags = {
        Action = "Stake-Notice",
        Sender = testWallet,
        TokenId = warTokenId,
        Quantity = tostring(testQuantity1),
        ["Duration"] = tostring(testDuration1),
      }
    })

    local walletCount = _G.VOUCH_DB_ADMIN:count("Wallet")
    assert.equal(1, walletCount)
    local historyCount = _G.VOUCH_DB_ADMIN:count("StakeHistory")
    assert.equal(1, historyCount)

    local wallets = _G.VOUCH_DB_ADMIN:exec("SELECT * FROM Wallet")
    assert.near(0.1, wallets[1].TotalConfidenceValue, 0.001)
  end)

  it("should add another vouch", function()
    -- Simulate a vouch message
    ao.send({
      Target = _G.MainProcessId,
      From = testCustodyProcess,
      Tags = {
        Action = "Stake-Notice",
        Sender = testWallet,
        TokenId = warTokenId,
        Quantity = tostring(testQuantity2),
        ["Duration"] = tostring(testDuration2),
      }
    })

    local walletCount = _G.VOUCH_DB_ADMIN:count("Wallet")
    assert.equal(1, walletCount)
    local historyCount = _G.VOUCH_DB_ADMIN:count("StakeHistory")
    assert.equal(2, historyCount)

    local wallets = _G.VOUCH_DB_ADMIN:exec("SELECT * FROM Wallet")
    assert.near(1.1, wallets[1].TotalConfidenceValue, 0.001)
  end)
end)
