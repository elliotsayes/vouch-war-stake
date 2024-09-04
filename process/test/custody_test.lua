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
_G.AoCredProcessId = 'AoCred-123xyz'

WAR_TOKEN_PROCESS = "xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10"
AO_TOKEN_PROCESS = "m3PaWzK4PTG9lAaqYQPaPdOcXdO8hYqi5Fe9NWqXd0w"

_G.Processes = {
  [WAR_TOKEN_PROCESS] = require 'token' (WAR_TOKEN_PROCESS),
  [AO_TOKEN_PROCESS] = require 'token' (AO_TOKEN_PROCESS),
  ['<SomeOtherToken>'] = require 'token' ('SomeOtherToken'),
  ['<Voucher>'] = require 'test.mocked-env.processes.voucher_mock' ('<Voucher>'),
  ['<Trigger>'] = require 'test.mocked-env.processes.trigger_mock' ('<Trigger>'),
}

_G.Handlers = require "handlers"

_G.ao = require "ao" (_G.MainProcessId) -- make global so that the main process and its non-mocked modules can use it
-- => every ao.send({}) in this test file effectively appears as if the message comes the main process

_G.ao.env = {
  Process = {
    Tags = {
      ["Name"] = "GreeterProcess",
      -- ... add other tags that would be passed in when the process is spawned
    }
  }
}

local process = require "custody" -- require so that process handlers are loaded
-- local utils = require "utils"
-- local bint = require ".bint" (512)


local resetGlobals = function()
  -- according to initialization in process.lual
  _G.BENEFICIARY_ADDRESS = "TEST1"
  _G.ALLOW_THIRD_PARTY_STAKE = true
  _G.DISTRIBUTE_TO_BENEFICIARY = true
  _G.WITHDRAW_TO_BENEFICIARY = true
end

local stakeTime = 12345000
local stakeDuration = 2 * 24 * 60 * 60 * 1000
local withdrawTime = stakeTime + stakeDuration

describe("staking", function()
  setup(function()
    resetGlobals()
  end)

  teardown(function()
    -- to execute after this describe
  end)

  it("should have empty STAKED_TOKENS", function()
    assert.is_table(_G.STAKED_TOKENS)
    assert.are.same(_G.STAKED_TOKENS, {})
  end)

  it("should add refund stake for other token", function()
    ao.send({
      Target = ao.id,
      From = "<SomeOtherToken>",
      Timestamp = stakeTime,
      Tags = {
        Action = 'Credit-Notice',
        Sender = 'TEST1',
        Quantity = '1000000000000',
        ['X-Stake-Duration'] = tostring(stakeDuration),
      }
    })
    assert.are.same(_G.STAKED_TOKENS, {})
  end)

  it("should add wAR stake", function()
    ao.send({
      Target = ao.id,
      From = _G.WAR_TOKEN_PROCESS,
      Timestamp = stakeTime,
      Tags = {
        Action = 'Credit-Notice',
        Sender = 'TEST1',
        Quantity = '1000000000000',
        ['X-Stake-Duration'] = tostring(stakeDuration),
      }
    })
    assert.are.same(_G.STAKED_TOKENS, { {
      TokenId = 'xU9zFkq3X2ZQ6olwNVvr1vUWIjc3kXTWr7xKQD6dh10',
      Sender = 'TEST1',
      Quantity = '1000000000000',
      StakeTime = stakeTime,
      StakeDuration = tostring(stakeDuration),
      WithdrawTime = withdrawTime,
    } })
  end)

  it("should not withdraw before stake duration is over", function()
    ao.send({
      Target = ao.id,
      From = "<Trigger>",
      Timestamp = withdrawTime - 1,
      Tags = {
        Action = 'Cron',
      }
    })
    assert.are.same(#_G.STAKED_TOKENS, 1)
  end)

  it("should withdraw after stake duration is over", function()
    ao.send({
      Target = ao.id,
      From = "<Trigger>",
      Timestamp = withdrawTime + 1,
      Tags = {
        Action = 'Cron',
      }
    })
    assert.are.same(_G.STAKED_TOKENS, {})
  end)
end)
